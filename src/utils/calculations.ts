import { 
  EnrichedSale, 
  FilterState, 
  KPIMetrics, 
  SalesTrendPoint, 
  CategoryBreakdown, 
  DestinationBreakdown, 
  ProductLeaderboardItem, 
  SalespersonLeaderboardItem, 
  CategoryType 
} from '../types/sales';
import { getDateRangeForPreset, getPreviousPeriodRange, isDateInRange } from './dateUtils';
import { format, isValid, differenceInCalendarDays } from 'date-fns';

/**
 * Filter sales according to the complete active multi-dimensional filter state
 */
export function filterSales(sales: EnrichedSale[], filters: FilterState, anchorDate: Date = new Date()): {
  filteredSales: EnrichedSale[];
  previousPeriodSales: EnrichedSale[];
  dateRange: { start: Date | null; end: Date | null; label: string };
} {
  const dateRange = getDateRangeForPreset(
    filters.preset,
    anchorDate,
    filters.startDate,
    filters.endDate,
    filters.selectedMonth,
    filters.selectedYear,
    filters.specificDate
  );

  const { prevStart, prevEnd } = getPreviousPeriodRange(dateRange.start, dateRange.end);

  const search = (filters.searchQuery || '').trim().toLowerCase();

  // Current period matching
  const filteredSales = sales.filter((sale) => {
    // 1. Date filter
    if (!isDateInRange(sale.parsed_date, dateRange.start, dateRange.end)) {
      return false;
    }

    // 2. Category filter
    if (filters.category && filters.category !== 'ALL') {
      if (sale.category !== filters.category) {
        return false;
      }
    }

    // 3. Destination filter
    if (filters.destination && filters.destination !== 'ALL') {
      const matchName = sale.destination_name.toLowerCase() === filters.destination.toLowerCase();
      const matchCode = sale.destination_code.toLowerCase() === filters.destination.toLowerCase();
      if (!matchName && !matchCode) {
        return false;
      }
    }

    // 4. Salesperson filter
    if (filters.salespersonId && filters.salespersonId !== 'ALL') {
      if (sale.salesperson_id !== filters.salespersonId) {
        return false;
      }
    }

    // 5. Search Query (order_no, customer_name, mobile, product_name, salesperson, destination)
    if (search) {
      const matchOrder = sale.order_no.toString().includes(search);
      const matchCustomer = sale.customer_name.toLowerCase().includes(search);
      const matchMobile = sale.customer_mobile.toLowerCase().includes(search);
      const matchProduct = sale.product_name.toLowerCase().includes(search);
      const matchSalesperson = sale.salesperson_name.toLowerCase().includes(search);
      const matchDest = sale.destination_name.toLowerCase().includes(search);

      if (!matchOrder && !matchCustomer && !matchMobile && !matchProduct && !matchSalesperson && !matchDest) {
        return false;
      }
    }

    return true;
  });

  // Previous period sales (for comparative growth calculations)
  const previousPeriodSales = prevStart && prevEnd
    ? sales.filter((sale) => {
        if (!isDateInRange(sale.parsed_date, prevStart, prevEnd)) {
          return false;
        }
        if (filters.category && filters.category !== 'ALL' && sale.category !== filters.category) {
          return false;
        }
        if (filters.destination && filters.destination !== 'ALL') {
          const matchName = sale.destination_name.toLowerCase() === filters.destination.toLowerCase();
          const matchCode = sale.destination_code.toLowerCase() === filters.destination.toLowerCase();
          if (!matchName && !matchCode) return false;
        }
        if (filters.salespersonId && filters.salespersonId !== 'ALL' && sale.salesperson_id !== filters.salespersonId) {
          return false;
        }
        return true;
      })
    : [];

  return { filteredSales, previousPeriodSales, dateRange };
}

/**
 * Calculates core KPI metrics including revenue, orders, AOV, and growth vs previous period
 */
export function calculateKPIMetrics(currentSales: EnrichedSale[], previousSales: EnrichedSale[]): KPIMetrics {
  const totalRevenue = currentSales.reduce((sum, s) => sum + s.amount, 0);
  const totalDiscount = currentSales.reduce((sum, s) => sum + s.discount_amount, 0);
  const netRevenue = totalRevenue - totalDiscount;
  const totalOrders = currentSales.length;
  const unitsSold = currentSales.length; // Each order item represents 1 unit/plan
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Previous period metrics
  const prevPeriodRevenue = previousSales.reduce((sum, s) => sum + s.amount, 0);
  const prevPeriodOrders = previousSales.length;

  let revenueGrowthPct: number | null = null;
  if (prevPeriodRevenue > 0) {
    revenueGrowthPct = ((totalRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100;
  }

  let ordersGrowthPct: number | null = null;
  if (prevPeriodOrders > 0) {
    ordersGrowthPct = ((totalOrders - prevPeriodOrders) / prevPeriodOrders) * 100;
  }

  // Top Product calculation
  const productRevMap = new Map<string, { revenue: number; units: number; category: CategoryType }>();
  for (const s of currentSales) {
    const existing = productRevMap.get(s.product_name) || { revenue: 0, units: 0, category: s.category };
    existing.revenue += s.amount;
    existing.units += 1;
    productRevMap.set(s.product_name, existing);
  }

  let topProduct: KPIMetrics['topProduct'] = null;
  let maxProdRev = -1;
  for (const [name, stats] of productRevMap.entries()) {
    if (stats.revenue > maxProdRev) {
      maxProdRev = stats.revenue;
      topProduct = {
        name,
        revenue: stats.revenue,
        units: stats.units,
        category: stats.category
      };
    }
  }

  return {
    totalRevenue,
    totalOrders,
    unitsSold,
    averageOrderValue,
    totalDiscount,
    netRevenue,
    topProduct,
    prevPeriodRevenue,
    prevPeriodOrders,
    revenueGrowthPct,
    ordersGrowthPct,
  };
}

/**
 * Calculates adaptive time-series trend points (grouped by Day or Month)
 */
export function calculateSalesTrend(
  sales: EnrichedSale[], 
  dateRange: { start: Date | null; end: Date | null }
): { trendData: SalesTrendPoint[]; granularity: 'day' | 'month' } {
  if (sales.length === 0) {
    return { trendData: [], granularity: 'day' };
  }

  // Determine granularity: if span is > 60 days or All Time, group by Month. Otherwise by Day.
  let isMonthly = false;
  if (!dateRange.start || !dateRange.end) {
    // All time
    isMonthly = true;
  } else {
    const days = differenceInCalendarDays(dateRange.end, dateRange.start);
    isMonthly = days > 60;
  }

  const grouped = new Map<string, {
    label: string;
    revenue: number;
    ordersCount: number;
    eSimRevenue: number;
    plasticSimRevenue: number;
  }>();

  for (const sale of sales) {
    const d = sale.parsed_date;
    if (!isValid(d)) continue;

    const key = isMonthly ? format(d, 'yyyy-MM') : format(d, 'yyyy-MM-dd');
    const label = isMonthly ? format(d, 'MMM yyyy') : format(d, 'MMM dd');

    const existing = grouped.get(key) || {
      label,
      revenue: 0,
      ordersCount: 0,
      eSimRevenue: 0,
      plasticSimRevenue: 0,
    };

    existing.revenue += sale.amount;
    existing.ordersCount += 1;
    if (sale.category === 'eSIM') {
      existing.eSimRevenue += sale.amount;
    } else if (sale.category === 'Plastic SIM') {
      existing.plasticSimRevenue += sale.amount;
    }

    grouped.set(key, existing);
  }

  // Sort chronologically
  const sortedKeys = Array.from(grouped.keys()).sort();
  const trendData: SalesTrendPoint[] = sortedKeys.map((key) => {
    const val = grouped.get(key)!;
    return {
      dateKey: key,
      label: val.label,
      revenue: Math.round(val.revenue * 100) / 100,
      ordersCount: val.ordersCount,
      aov: val.ordersCount > 0 ? Math.round((val.revenue / val.ordersCount) * 100) / 100 : 0,
      eSimRevenue: Math.round(val.eSimRevenue * 100) / 100,
      plasticSimRevenue: Math.round(val.plasticSimRevenue * 100) / 100,
    };
  });

  return { trendData, granularity: isMonthly ? 'month' : 'day' };
}

/**
 * Calculates category breakdown (eSIM vs Plastic SIM)
 */
export function calculateCategoryBreakdown(sales: EnrichedSale[], totalRevenue: number): CategoryBreakdown[] {
  let eSimRev = 0;
  let eSimCount = 0;
  let plasticSimRev = 0;
  let plasticSimCount = 0;
  let otherRev = 0;
  let otherCount = 0;

  for (const s of sales) {
    if (s.category === 'eSIM') {
      eSimRev += s.amount;
      eSimCount += 1;
    } else if (s.category === 'Plastic SIM') {
      plasticSimRev += s.amount;
      plasticSimCount += 1;
    } else {
      otherRev += s.amount;
      otherCount += 1;
    }
  }

  const result: CategoryBreakdown[] = [];

  if (eSimCount > 0 || plasticSimCount > 0) {
    result.push({
      category: 'eSIM',
      revenue: eSimRev,
      ordersCount: eSimCount,
      percentage: totalRevenue > 0 ? (eSimRev / totalRevenue) * 100 : 0,
      color: '#0284c7', // Sky / Brand Blue
    });
    result.push({
      category: 'Plastic SIM',
      revenue: plasticSimRev,
      ordersCount: plasticSimCount,
      percentage: totalRevenue > 0 ? (plasticSimRev / totalRevenue) * 100 : 0,
      color: '#0d9488', // Teal
    });
  }

  if (otherCount > 0) {
    result.push({
      category: 'Other',
      revenue: otherRev,
      ordersCount: otherCount,
      percentage: totalRevenue > 0 ? (otherRev / totalRevenue) * 100 : 0,
      color: '#64748b', // Slate
    });
  }

  return result;
}

/**
 * Calculates regional / destination breakdown
 */
export function calculateDestinationBreakdown(sales: EnrichedSale[], totalRevenue: number): DestinationBreakdown[] {
  const map = new Map<string, { code: string; flag?: string; revenue: number; ordersCount: number }>();

  for (const s of sales) {
    const name = s.destination_name || 'Other';
    const existing = map.get(name) || {
      code: s.destination_code,
      flag: s.destination_flag,
      revenue: 0,
      ordersCount: 0,
    };
    existing.revenue += s.amount;
    existing.ordersCount += 1;
    if (!existing.flag && s.destination_flag) {
      existing.flag = s.destination_flag;
    }
    map.set(name, existing);
  }

  const list: DestinationBreakdown[] = Array.from(map.entries()).map(([name, val]) => ({
    name,
    code: val.code,
    flag: val.flag,
    revenue: val.revenue,
    ordersCount: val.ordersCount,
    percentage: totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0,
  }));

  return list.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Calculates Top Products Leaderboard
 */
export function calculateProductLeaderboard(sales: EnrichedSale[], totalRevenue: number, limit = 10): ProductLeaderboardItem[] {
  const map = new Map<number, {
    name: string;
    category: CategoryType;
    unitsSold: number;
    revenue: number;
    validity?: number;
  }>();

  for (const s of sales) {
    const existing = map.get(s.product_id) || {
      name: s.product_name,
      category: s.category,
      unitsSold: 0,
      revenue: 0,
      validity: s.validity,
    };
    existing.unitsSold += 1;
    existing.revenue += s.amount;
    map.set(s.product_id, existing);
  }

  const list: ProductLeaderboardItem[] = Array.from(map.entries()).map(([productId, val]) => ({
    productId,
    name: val.name,
    category: val.category,
    unitsSold: val.unitsSold,
    revenue: val.revenue,
    percentageOfTotal: totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0,
    validity: val.validity,
  }));

  return list.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

/**
 * Calculates Salesperson performance ranking
 */
export function calculateSalespersonLeaderboard(sales: EnrichedSale[], totalRevenue: number): SalespersonLeaderboardItem[] {
  const map = new Map<number, {
    name: string;
    mobile?: string;
    ordersCount: number;
    revenue: number;
  }>();

  for (const s of sales) {
    const existing = map.get(s.salesperson_id) || {
      name: s.salesperson_name,
      ordersCount: 0,
      revenue: 0,
    };
    existing.ordersCount += 1;
    existing.revenue += s.amount;
    map.set(s.salesperson_id, existing);
  }

  const list: SalespersonLeaderboardItem[] = Array.from(map.entries()).map(([id, val]) => ({
    id,
    name: val.name,
    ordersCount: val.ordersCount,
    revenue: val.revenue,
    averageOrderValue: val.ordersCount > 0 ? val.revenue / val.ordersCount : 0,
    percentageOfTotal: totalRevenue > 0 ? (val.revenue / totalRevenue) * 100 : 0,
  }));

  return list.sort((a, b) => b.revenue - a.revenue);
}
