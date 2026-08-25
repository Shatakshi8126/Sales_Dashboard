import { supabase } from '../lib/supabase';
import { Order, Product, User, Destination, EnrichedSale, CategoryType } from '../types/sales';
import { parseISO } from 'date-fns';

export interface ReferenceData {
  productsMap: Map<number, Product>;
  usersMap: Map<number, User>;
  destinationsMap: Map<string, Destination>;
  salespeopleList: User[];
  destinationsList: { name: string; code: string; flag?: string }[];
  categoriesList: CategoryType[];
}

let cachedReferenceData: ReferenceData | null = null;

/**
 * Fetch all reference tables (products, users, destinations)
 */
export async function fetchReferenceData(forceRefresh = false): Promise<ReferenceData> {
  if (cachedReferenceData && !forceRefresh) {
    return cachedReferenceData;
  }

  const [productsRes, usersRes, destsRes] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('users').select('*'),
    supabase.from('destinations').select('*'),
  ]);

  if (productsRes.error) {
    console.error('Error fetching products:', productsRes.error);
  }
  if (usersRes.error) {
    console.error('Error fetching users:', usersRes.error);
  }
  if (destsRes.error) {
    console.error('Error fetching destinations:', destsRes.error);
  }

  const productsMap = new Map<number, Product>();
  for (const p of (productsRes.data || [])) {
    productsMap.set(p.prod_id, {
      ...p,
      productName: (p.productName || '').replace(/[\r\n]+/g, ' ').trim(),
    });
  }

  const usersMap = new Map<number, User>();
  const salespeopleList: User[] = [];
  for (const u of (usersRes.data || [])) {
    const cleanUser: User = {
      ...u,
      name: (u.name || '').replace(/[\r\n]+/g, ' ').trim(),
    };
    usersMap.set(u.user_id, cleanUser);
    if (u.user_role === 2) {
      salespeopleList.push(cleanUser);
    }
  }

  const destinationsMap = new Map<string, Destination>();
  const destinationsList: { name: string; code: string; flag?: string }[] = [];
  for (const d of (destsRes.data || [])) {
    if (d.destination_id) {
      destinationsMap.set(d.destination_id.toUpperCase(), d);
      if (d.is_active === 1 || destinationsList.length < 50) {
        destinationsList.push({
          name: d.destination_name,
          code: d.destination_id,
          flag: d.flag_path,
        });
      }
    }
  }

  // Deduplicate and sort destinations
  const uniqueDestMap = new Map<string, { name: string; code: string; flag?: string }>();
  for (const d of destinationsList) {
    if (!uniqueDestMap.has(d.name)) {
      uniqueDestMap.set(d.name, d);
    }
  }

  cachedReferenceData = {
    productsMap,
    usersMap,
    destinationsMap,
    salespeopleList: salespeopleList.sort((a, b) => a.name.localeCompare(b.name)),
    destinationsList: Array.from(uniqueDestMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    categoriesList: ['eSIM', 'Plastic SIM'],
  };

  return cachedReferenceData;
}

/**
 * Fetch all raw orders from Supabase (with range paging to support >1000 rows)
 */
export async function fetchAllOrders(): Promise<Order[]> {
  const pageSize = 1000;
  let allOrders: Order[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('order_date_time', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching orders:', error);
      throw new Error(`Failed to load sales orders: ${error.message}`);
    }

    if (data && data.length > 0) {
      allOrders = allOrders.concat(data as Order[]);
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    } else {
      hasMore = false;
    }
  }

  return allOrders;
}

/**
 * Enriches raw Order objects with related reference data
 */
export function enrichSalesRecords(orders: Order[], refData: ReferenceData): EnrichedSale[] {
  return orders.map((order) => {
    const product = refData.productsMap.get(order.product_id);
    const customer = refData.usersMap.get(order.user_id);
    const salesperson = refData.usersMap.get(order.created_by);

    let category: CategoryType = 'Other';
    if (product) {
      if (product.simMode === 2) category = 'eSIM';
      else if (product.simMode === 1) category = 'Plastic SIM';
    }

    // Destination lookup
    let destCode = 'GLOBAL';
    let destName = 'Global / International';
    let destFlag: string | undefined = undefined;

    if (product && product.coverageDestinations) {
      const firstCode = product.coverageDestinations.split(',')[0].trim().toUpperCase();
      destCode = firstCode;
      const dest = refData.destinationsMap.get(firstCode);
      if (dest) {
        destName = dest.destination_name;
        destFlag = dest.flag_path;
      } else {
        destName = firstCode;
      }
    }

    const amount = Number(order.amount) || 0;
    const discount = Number(order.discount_amount) || 0;
    const dateStr = order.order_date_time || '2026-01-01';

    return {
      order_no: order.order_no,
      order_date_time: dateStr,
      parsed_date: parseISO(dateStr),
      amount: Math.round(amount * 100) / 100,
      discount_amount: Math.round(discount * 100) / 100,
      net_amount: Math.round((amount - discount) * 100) / 100,
      
      user_id: order.user_id,
      customer_name: customer ? customer.name : `Customer #${order.user_id}`,
      customer_mobile: customer && customer.mobile ? customer.mobile : 'N/A',
      
      product_id: order.product_id,
      product_name: product ? product.productName : `Product #${order.product_id}`,
      category,
      sim_mode: product ? product.simMode : 0,
      validity: product ? product.validity : undefined,
      
      salesperson_id: order.created_by,
      salesperson_name: salesperson ? salesperson.name : `Staff #${order.created_by}`,
      
      destination_code: destCode,
      destination_name: destName,
      destination_flag: destFlag,
    };
  });
}

/**
 * Setup Supabase Realtime channel for live updates
 */
export function subscribeToOrders(
  onInsert: (newOrder: Order) => void,
  onUpdate: (updatedOrder: Order) => void,
  onDelete: (oldOrder: Partial<Order>) => void
) {
  const channel = supabase
    .channel('realtime_orders_dashboard')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        console.log('[Realtime] Order inserted:', payload.new);
        onInsert(payload.new as Order);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload) => {
        console.log('[Realtime] Order updated:', payload.new);
        onUpdate(payload.new as Order);
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'orders' },
      (payload) => {
        console.log('[Realtime] Order deleted:', payload.old);
        onDelete(payload.old as Partial<Order>);
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] Subscription status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Helper to insert a sale into Supabase (for testing realtime functionality)
 */
export async function createOrder(order: Omit<Order, 'order_no'>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }
  return data as Order;
}
