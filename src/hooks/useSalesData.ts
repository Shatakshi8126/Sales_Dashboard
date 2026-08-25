import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Order, 
  FilterState, 
  QuickDatePreset,
  EnrichedSale 
} from '../types/sales';
import { 
  fetchReferenceData, 
  fetchAllOrders, 
  enrichSalesRecords, 
  subscribeToOrders, 
  ReferenceData 
} from '../services/salesService';
import { 
  filterSales, 
  calculateKPIMetrics, 
  calculateSalesTrend, 
  calculateCategoryBreakdown, 
  calculateDestinationBreakdown, 
  calculateProductLeaderboard, 
  calculateSalespersonLeaderboard 
} from '../utils/calculations';

const INITIAL_FILTERS: FilterState = {
  preset: 'allTime',
  specificDate: null,
  startDate: null,
  endDate: null,
  selectedMonth: null,
  selectedYear: null,
  category: 'ALL',
  destination: 'ALL',
  salespersonId: 'ALL',
  searchQuery: '',
};

export function useSalesData() {
  const [rawOrders, setRawOrders] = useState<Order[]>([]);
  const [refData, setRefData] = useState<ReferenceData | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [realtimeNotification, setRealtimeNotification] = useState<{ id: number; message: string } | null>(null);

  const notifTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((message: string) => {
    if (notifTimeoutRef.current) {
      clearTimeout(notifTimeoutRef.current);
    }
    setRealtimeNotification({ id: Date.now(), message });
    notifTimeoutRef.current = setTimeout(() => {
      setRealtimeNotification(null);
    }, 4000);
  }, []);

  // Initial Data Load
  const loadData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [references, orders] = await Promise.all([
        fetchReferenceData(isManualRefresh),
        fetchAllOrders(),
      ]);

      setRefData(references);
      setRawOrders(orders);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      console.error('Error loading sales data:', err);
      const msg = err instanceof Error ? err.message : 'Failed to connect to Supabase';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Supabase Realtime Subscription
  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      // On INSERT
      (newOrder) => {
        setRawOrders((prev) => {
          // Check if already present to avoid duplicates
          if (prev.some((o) => o.order_no === newOrder.order_no)) {
            return prev;
          }
          return [newOrder, ...prev];
        });
        setLastUpdated(new Date());
        showNotification(`New order #${newOrder.order_no} received in real-time!`);
      },
      // On UPDATE
      (updatedOrder) => {
        setRawOrders((prev) => 
          prev.map((o) => (o.order_no === updatedOrder.order_no ? updatedOrder : o))
        );
        setLastUpdated(new Date());
        showNotification(`Order #${updatedOrder.order_no} updated!`);
      },
      // On DELETE
      (deletedOrder) => {
        if (deletedOrder.order_no) {
          setRawOrders((prev) => prev.filter((o) => o.order_no !== deletedOrder.order_no));
          setLastUpdated(new Date());
          showNotification(`Order #${deletedOrder.order_no} deleted!`);
        }
      }
    );

    return () => {
      unsubscribe();
      if (notifTimeoutRef.current) {
        clearTimeout(notifTimeoutRef.current);
      }
    };
  }, [showNotification]);

  // Enrich raw orders with user/product/dest references
  const allEnrichedSales: EnrichedSale[] = useMemo(() => {
    if (!refData || rawOrders.length === 0) return [];
    return enrichSalesRecords(rawOrders, refData);
  }, [rawOrders, refData]);

  // Apply active filters & calculate comparison period
  const { filteredSales, previousPeriodSales, dateRange } = useMemo(() => {
    return filterSales(allEnrichedSales, filters);
  }, [allEnrichedSales, filters]);

  // KPI Calculations
  const kpiMetrics = useMemo(() => {
    return calculateKPIMetrics(filteredSales, previousPeriodSales);
  }, [filteredSales, previousPeriodSales]);

  // Trend Analytics
  const salesTrend = useMemo(() => {
    return calculateSalesTrend(filteredSales, dateRange);
  }, [filteredSales, dateRange]);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(filteredSales, kpiMetrics.totalRevenue);
  }, [filteredSales, kpiMetrics.totalRevenue]);

  // Destination Breakdown
  const destinationBreakdown = useMemo(() => {
    return calculateDestinationBreakdown(filteredSales, kpiMetrics.totalRevenue);
  }, [filteredSales, kpiMetrics.totalRevenue]);

  // Product Leaderboard
  const productLeaderboard = useMemo(() => {
    return calculateProductLeaderboard(filteredSales, kpiMetrics.totalRevenue, 10);
  }, [filteredSales, kpiMetrics.totalRevenue]);

  // Salesperson Leaderboard
  const salespersonLeaderboard = useMemo(() => {
    return calculateSalespersonLeaderboard(filteredSales, kpiMetrics.totalRevenue);
  }, [filteredSales, kpiMetrics.totalRevenue]);

  // Available Filter Options
  const availableSalespeople = useMemo(() => {
    return refData?.salespeopleList || [];
  }, [refData]);

  const availableDestinations = useMemo(() => {
    return refData?.destinationsList || [];
  }, [refData]);

  // Filter Mutators
  const setPreset = useCallback((preset: QuickDatePreset) => {
    setFilters((prev) => ({
      ...prev,
      preset,
      specificDate: null,
      startDate: null,
      endDate: null,
      selectedMonth: null,
      selectedYear: null,
    }));
  }, []);

  const setSpecificDate = useCallback((specificDate: string | null) => {
    if (specificDate) {
      setFilters((prev) => ({
        ...prev,
        preset: 'specificDate',
        specificDate,
        startDate: null,
        endDate: null,
        selectedMonth: null,
        selectedYear: null,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        preset: 'allTime',
        specificDate: null,
      }));
    }
  }, []);

  const setCustomDateRange = useCallback((startDate: string, endDate: string) => {
    setFilters((prev) => ({
      ...prev,
      preset: 'custom',
      specificDate: null,
      startDate,
      endDate,
      selectedMonth: null,
      selectedYear: null,
    }));
  }, []);

  const setSelectedMonthYear = useCallback((month: number, year: number) => {
    setFilters((prev) => ({
      ...prev,
      preset: 'monthYear',
      specificDate: null,
      selectedMonth: month,
      selectedYear: year,
      startDate: null,
      endDate: null,
    }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setDestination = useCallback((destination: string) => {
    setFilters((prev) => ({ ...prev, destination }));
  }, []);

  const setSalespersonId = useCallback((salespersonId: number | 'ALL') => {
    setFilters((prev) => ({ ...prev, salespersonId }));
  }, []);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const refreshData = useCallback(() => {
    loadData(true);
  }, [loadData]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.preset !== 'allTime' ||
      filters.specificDate !== null ||
      filters.category !== 'ALL' ||
      filters.destination !== 'ALL' ||
      filters.salespersonId !== 'ALL' ||
      (filters.searchQuery || '').trim().length > 0
    );
  }, [filters]);

  return {
    // Data
    allSalesCount: allEnrichedSales.length,
    filteredSales,
    kpiMetrics,
    salesTrend,
    categoryBreakdown,
    destinationBreakdown,
    productLeaderboard,
    salespersonLeaderboard,
    dateRangeLabel: dateRange.label,
    
    // Status
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    realtimeNotification,
    
    // Filter State & Options
    filters,
    hasActiveFilters,
    availableSalespeople,
    availableDestinations,
    
    // Actions
    setPreset,
    setSpecificDate,
    setCustomDateRange,
    setSelectedMonthYear,
    setCategory,
    setDestination,
    setSalespersonId,
    setSearchQuery,
    clearFilters,
    refreshData,
  };
}
