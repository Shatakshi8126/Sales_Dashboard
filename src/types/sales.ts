export interface Order {
  order_no: number;
  order_date_time: string; // ISO date string e.g. "2026-01-01" or full timestamp
  user_id: number; // Customer ID
  product_id: number;
  amount: number;
  discount_amount: number;
  created_by: number; // Salesperson ID
}

export interface Product {
  prod_id: number;
  productName: string;
  simMode: number; // 1 = Plastic SIM, 2 = eSIM
  amount: number;
  validity?: number;
  coverageDestinations?: string;
  allocatedDestinations?: string;
  fupLimit?: number;
  data_limit?: number;
  operatorId?: number;
  addOnId?: string;
}

export interface User {
  user_id: number;
  name: string;
  country_code?: number;
  mobile?: string;
  user_role: number; // 1 = Customer, 2 = Salesperson / Staff
  created_dateTime?: string;
}

export interface Destination {
  destination_id: string;
  destination_name: string;
  destination_type: number; // 1 = Country, 2 = Region
  flag_path?: string;
  included_destinations?: string;
  is_active?: number;
}

export type CategoryType = 'eSIM' | 'Plastic SIM' | 'Other';

export interface EnrichedSale {
  order_no: number;
  order_date_time: string;
  parsed_date: Date;
  amount: number;
  discount_amount: number;
  net_amount: number;
  
  // Customer details
  user_id: number;
  customer_name: string;
  customer_mobile: string;
  
  // Product details
  product_id: number;
  product_name: string;
  category: CategoryType;
  sim_mode: number;
  validity?: number;
  
  // Salesperson details
  salesperson_id: number;
  salesperson_name: string;
  
  // Destination / Region details
  destination_code: string;
  destination_name: string;
  destination_flag?: string;
}

export type QuickDatePreset = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'thisYear'
  | 'allTime'
  | 'custom'
  | 'monthYear'
  | 'specificDate';

export interface FilterState {
  preset: QuickDatePreset;
  specificDate: string | null; // YYYY-MM-DD for exact single-date filter
  startDate: string | null;    // YYYY-MM-DD
  endDate: string | null;      // YYYY-MM-DD
  selectedMonth: number | null; // 1-12
  selectedYear: number | null;  // e.g. 2026
  category: string; // 'ALL' | 'eSIM' | 'Plastic SIM'
  destination: string; // 'ALL' | destination_name / code
  salespersonId: number | 'ALL';
  searchQuery: string;
}

export interface KPIMetrics {
  totalRevenue: number;
  totalOrders: number;
  unitsSold: number;
  averageOrderValue: number;
  totalDiscount: number;
  netRevenue: number;
  topProduct: {
    name: string;
    revenue: number;
    units: number;
    category: CategoryType;
  } | null;
  // Comparison vs previous period
  prevPeriodRevenue: number;
  prevPeriodOrders: number;
  revenueGrowthPct: number | null;
  ordersGrowthPct: number | null;
}

export interface SalesTrendPoint {
  dateKey: string; // "2026-01-15" or "2026-01"
  label: string;   // "Jan 15" or "Jan 2026"
  revenue: number;
  ordersCount: number;
  aov: number;
  eSimRevenue: number;
  plasticSimRevenue: number;
}

export interface CategoryBreakdown {
  category: CategoryType;
  revenue: number;
  ordersCount: number;
  percentage: number;
  color: string;
}

export interface DestinationBreakdown {
  name: string;
  code: string;
  flag?: string;
  revenue: number;
  ordersCount: number;
  percentage: number;
}

export interface ProductLeaderboardItem {
  productId: number;
  name: string;
  category: CategoryType;
  unitsSold: number;
  revenue: number;
  percentageOfTotal: number;
  validity?: number;
}

export interface SalespersonLeaderboardItem {
  id: number;
  name: string;
  mobile?: string;
  ordersCount: number;
  revenue: number;
  averageOrderValue: number;
  percentageOfTotal: number;
}
