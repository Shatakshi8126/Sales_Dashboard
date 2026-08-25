import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { SalesTrendPoint } from '../types/sales';
import { formatINR, formatCompactINR, formatNumber } from '../utils/currencyUtils';

interface SalesTrendChartProps {
  data: SalesTrendPoint[];
  granularity: 'day' | 'month';
  dateRangeLabel: string;
}

type ViewMode = 'revenue' | 'orders';

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  data,
  granularity,
  dateRangeLabel,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('revenue');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: SalesTrendPoint = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-dropdown text-xs space-y-1.5 min-w-[160px] border border-slate-100 dark:border-slate-800">
          <p className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            {item.label} ({granularity === 'month' ? 'Month' : 'Day'})
          </p>
          <div className="flex justify-between">
            <span className="text-slate-500">Revenue</span>
            <strong className="text-slate-900 dark:text-white">{formatINR(item.revenue)}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Orders</span>
            <strong className="text-slate-900 dark:text-white">{formatNumber(item.ordersCount)}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">AOV</span>
            <strong className="text-slate-900 dark:text-white">{formatINR(item.aov)}</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  const gridColor = 'rgba(148,163,184,0.1)';
  const axisColor = '#94a3b8';

  // Compute max bar to highlight
  const maxRevenue = Math.max(...(data.map(d => d.revenue)), 1);
  const maxOrders  = Math.max(...(data.map(d => d.ordersCount)), 1);

  return (
    <div className="ui-card p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-950/60 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-green-700 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l4-4 4 4 4-5 4 3" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Sales Trend</h2>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 ml-9">{dateRangeLabel}</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 gap-0.5">
          <button
            onClick={() => setViewMode('revenue')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'revenue'
                ? 'bg-green-800 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setViewMode('orders')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'orders'
                ? 'bg-green-800 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0" style={{ height: 280 }}>
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-600">
            No data for this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'orders' ? (
              <BarChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} tickFormatter={v => formatNumber(v)} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar
                  dataKey="ordersCount"
                  radius={[8, 8, 4, 4]}
                  maxBarSize={40}
                  // colour each bar: max bar = green-800, others = green-200
                  fill="#bbf7d0"
                >
                  {data.map((entry, index) => (
                    <rect
                      key={index}
                      fill={entry.ordersCount >= maxOrders * 0.9 ? '#166534' : '#bbf7d0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} tickFormatter={v => formatCompactINR(v)} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar
                  dataKey="revenue"
                  radius={[8, 8, 4, 4]}
                  maxBarSize={40}
                  fill="#bbf7d0"
                >
                  {data.map((entry, index) => (
                    <rect
                      key={index}
                      fill={entry.revenue >= maxRevenue * 0.85 ? '#166534' : '#bbf7d0'}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
