import { useState } from 'react';
import { useSalesData } from './hooks/useSalesData';
import { useTheme } from './hooks/useTheme';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { RevenueHeroCard, RightKPICards } from './components/KPICards';
import { SalesTrendChart } from './components/SalesTrendChart';
import { CategoryChart } from './components/CategoryChart';
import { RegionChart } from './components/RegionChart';
import { ProductRanking } from './components/ProductRanking';
import { SalespersonRanking } from './components/SalespersonRanking';
import { SalesTable } from './components/SalesTable';
import { QuickAddSaleModal } from './components/QuickAddSaleModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';
import { EmptyState } from './components/EmptyState';

export function App() {
  const {
    allSalesCount,
    filteredSales,
    kpiMetrics,
    salesTrend,
    categoryBreakdown,
    destinationBreakdown,
    productLeaderboard,
    salespersonLeaderboard,
    dateRangeLabel,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    realtimeNotification,
    filters,
    hasActiveFilters,
    availableSalespeople,
    availableDestinations,
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
  } = useSalesData();

  const { isDark, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#eef1f6] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors">
      
      {/* ── Left Sidebar Pill (from uploaded mockup) ── */}
      <div className="hidden sm:block pl-4 pr-1 py-4">
        <Sidebar />
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 pr-4 pl-4 sm:pl-0 py-4 gap-4 animate-page-in">
        
        {/* Top Header Row */}
        <Header
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={refreshData}
          onOpenNewSaleModal={() => setIsModalOpen(true)}
          totalOrdersCount={allSalesCount}
          filteredOrdersCount={filteredSales.length}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          realtimeNotification={realtimeNotification}
        />

        {error ? (
          <ErrorState error={error} onRetry={refreshData} />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-4">
            
            {/* Filter Bar with Welcome Name + presets */}
            <FilterBar
              filters={filters}
              dateRangeLabel={dateRangeLabel}
              hasActiveFilters={hasActiveFilters}
              availableSalespeople={availableSalespeople}
              availableDestinations={availableDestinations}
              filteredCount={filteredSales.length}
              totalCount={allSalesCount}
              onSetPreset={setPreset}
              onSetSpecificDate={setSpecificDate}
              onSetCustomDateRange={setCustomDateRange}
              onSetMonthYear={setSelectedMonthYear}
              onSetCategory={setCategory}
              onSetDestination={setDestination}
              onSetSalespersonId={setSalespersonId}
              onSetSearchQuery={setSearchQuery}
              onClearFilters={clearFilters}
            />

            {filteredSales.length === 0 ? (
              <EmptyState onClearFilters={clearFilters} />
            ) : (
              <>
                {/* ── 3-Column Layout from uploaded mockup ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  
                  {/* Column 1: Credit Card Hero Widget & Growth metrics */}
                  <RevenueHeroCard metrics={kpiMetrics} />

                  {/* Column 2: Large engagement/trend bar chart */}
                  <div className="lg:col-span-1">
                    <SalesTrendChart
                      data={salesTrend.trendData}
                      granularity={salesTrend.granularity}
                      dateRangeLabel={dateRangeLabel}
                    />
                  </div>

                  {/* Column 3: Stacked list of other KPI metrics (Orders, AOV, Discounts) */}
                  <RightKPICards metrics={kpiMetrics} />
                </div>

                {/* ── Sub-row: Category split, Region map lists, and Product lists ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <CategoryChart
                    data={categoryBreakdown}
                    totalRevenue={kpiMetrics.totalRevenue}
                  />
                  <RegionChart
                    data={destinationBreakdown}
                    totalRevenue={kpiMetrics.totalRevenue}
                  />
                  <ProductRanking products={productLeaderboard} />
                  <SalespersonRanking salespeople={salespersonLeaderboard} />
                </div>

                {/* ── Payment History Style transaction table ── */}
                <SalesTable sales={filteredSales} />
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 py-1 text-[11px] text-slate-400">
          <div>Sales Dashboard · Live Real-time Supabase Data</div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-live-dot" />
            <span>Synced: {allSalesCount.toLocaleString()} orders</span>
          </div>
        </footer>
      </div>

      <QuickAddSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableProducts={productLeaderboard.map((p) => ({
          prod_id: p.productId,
          productName: p.name,
          simMode: p.category === 'eSIM' ? 2 : 1,
          amount: p.revenue / Math.max(1, p.unitsSold),
        }))}
        availableSalespeople={availableSalespeople}
        availableCustomers={availableSalespeople}
      />
    </div>
  );
}

export default App;
