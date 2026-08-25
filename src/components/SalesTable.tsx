import React, { useState, useMemo } from 'react';
import { EnrichedSale } from '../types/sales';
import { formatINR } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, ChevronLeft, ChevronRight, Search, MapPin, Layers } from 'lucide-react';

interface SalesTableProps { sales: EnrichedSale[]; }
type SortField = 'order_no' | 'order_date_time' | 'customer_name' | 'product_name' | 'category' | 'destination_name' | 'salesperson_name' | 'amount';
type SortDirection = 'asc' | 'desc';

export const SalesTable: React.FC<SalesTableProps> = ({ sales }) => {
  const [sortField, setSortField]       = useState<SortField>('order_no');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage]   = useState<number>(1);
  const [pageSize, setPageSize]         = useState<number>(15);
  const [tableSearch, setTableSearch]   = useState<string>('');

  const filteredSales = useMemo(() => {
    if (!tableSearch.trim()) return sales;
    const q = tableSearch.toLowerCase();
    return sales.filter(s =>
      s.order_no.toString().includes(q) ||
      s.customer_name.toLowerCase().includes(q) ||
      s.customer_mobile.toLowerCase().includes(q) ||
      s.product_name.toLowerCase().includes(q) ||
      s.salesperson_name.toLowerCase().includes(q) ||
      s.destination_name.toLowerCase().includes(q)
    );
  }, [sales, tableSearch]);

  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      let vA: any = a[sortField], vB: any = b[sortField];
      if (typeof vA === 'string') {
        vA = vA.toLowerCase(); vB = (vB || '').toLowerCase();
        return sortDirection === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      if (vA < vB) return sortDirection === 'asc' ? -1 : 1;
      if (vA > vB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSales, sortField, sortDirection]);

  const totalPages     = Math.max(1, Math.ceil(sortedSales.length / pageSize));
  const paginatedSales = useMemo(() => sortedSales.slice((currentPage - 1) * pageSize, currentPage * pageSize), [sortedSales, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (!sortedSales.length) return;
    const headers = ['Order No','Date','Customer Name','Customer Mobile','Product Name','Category','Destination','Salesperson','Amount (INR)','Discount (INR)','Net Amount (INR)'];
    const rows = sortedSales.map(s => [s.order_no, s.order_date_time, `"${s.customer_name.replace(/"/g,'""')}"`, `"${s.customer_mobile}"`, `"${s.product_name.replace(/"/g,'""')}"`, s.category, `"${s.destination_name}"`, `"${s.salesperson_name}"`, s.amount, s.discount_amount, s.net_amount]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `sales_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const COLS: { label: string; field: SortField | null }[] = [
    { label: 'Name',        field: 'customer_name'    },
    { label: 'Date',        field: 'order_date_time'  },
    { label: 'Product',     field: 'product_name'     },
    { label: 'Category',    field: 'category'         },
    { label: 'Destination', field: 'destination_name' },
    { label: 'Rep',         field: 'salesperson_name' },
    { label: 'Status',      field: null               },
    { label: 'Amount',      field: 'amount'           },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-card overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-green-700 dark:text-green-400" />
            Sales History
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Recent payment records from Supabase</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text" value={tableSearch} placeholder="Search transactions…"
              onChange={e => { setTableSearch(e.target.value); setCurrentPage(1); }}
              className="text-xs py-2 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 focus:outline-none w-44 sm:w-52 transition-all"
            />
          </div>
          <button onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              {COLS.map(({ label, field }) => (
                <th key={label}
                  className={`py-3.5 px-4 ${field ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-200' : ''} transition-colors`}
                  onClick={() => field && handleSort(field)}
                >
                  <div className={`flex items-center gap-1 ${label === 'Amount' ? 'justify-end' : ''}`}>
                    {label}
                    {field && (sortField === field
                      ? sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-green-600" /> : <ArrowDown className="w-3 h-3 text-green-600" />
                      : <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {paginatedSales.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">No transactions match your filters</td></tr>
            ) : paginatedSales.map(sale => (
              <tr key={sale.order_no} className="hover:bg-green-50/40 dark:hover:bg-green-950/10 transition-colors">
                {/* Customer */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center text-[10px] font-black text-green-800 dark:text-green-300 shrink-0">
                      {sale.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-white">{sale.customer_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sale.customer_mobile}</div>
                    </div>
                  </div>
                </td>
                {/* Date */}
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  <div>{formatDate(sale.order_date_time, 'dd MMM yyyy')}</div>
                  <div className="text-[10px] text-slate-400">{formatDate(sale.order_date_time, 'hh:mm a')}</div>
                </td>
                {/* Product */}
                <td className="py-3.5 px-4 max-w-[180px]">
                  <div className="font-medium text-slate-700 dark:text-slate-300 truncate" title={sale.product_name}>{sale.product_name}</div>
                  {sale.validity && <div className="text-[10px] text-slate-400">{sale.validity}d validity</div>}
                </td>
                {/* Category */}
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    sale.category === 'eSIM'
                      ? 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300'
                      : 'bg-green-200/60 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                  }`}>
                    {sale.category}
                  </span>
                </td>
                {/* Destination */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {sale.destination_flag
                      ? <img src={sale.destination_flag} alt="" className="w-4 h-3 object-cover rounded" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                      : <MapPin className="w-3 h-3 text-slate-400" />
                    }
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{sale.destination_name}</span>
                  </div>
                </td>
                {/* Rep */}
                <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{sale.salesperson_name}</td>
                {/* Status */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-700 dark:text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Completed
                  </span>
                </td>
                {/* Amount */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="font-bold text-slate-800 dark:text-white font-mono">{formatINR(sale.amount)}</div>
                  {sale.discount_amount > 0 && <div className="text-[10px] text-rose-500 dark:text-rose-400">-{formatINR(sale.discount_amount)}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span>Rows:</span>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-green-500 focus:outline-none">
            {[10,15,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>
            Showing <strong className="text-slate-700 dark:text-slate-200">{paginatedSales.length > 0 ? (currentPage-1)*pageSize+1 : 0}</strong>–<strong className="text-slate-700 dark:text-slate-200">{Math.min(currentPage*pageSize, sortedSales.length)}</strong> of <strong className="text-slate-700 dark:text-slate-200">{sortedSales.length}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-950/20 disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="px-3 py-1.5 text-slate-600 dark:text-slate-400 font-semibold">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-950/20 disabled:opacity-40 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
