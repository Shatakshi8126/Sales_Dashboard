import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryBreakdown } from '../types/sales';
import { formatINR, formatCompactINR, formatPercent, formatNumber } from '../utils/currencyUtils';
import { Wifi, Smartphone } from 'lucide-react';

interface CategoryChartProps {
  data: CategoryBreakdown[];
  totalRevenue: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'eSIM':        '#166534',
  'Plastic SIM': '#4ade80',
};

export const CategoryChart: React.FC<CategoryChartProps> = ({ data, totalRevenue }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const item: CategoryBreakdown = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-dropdown text-xs space-y-1 border border-slate-100 dark:border-slate-800 min-w-[140px]">
          <p className="font-bold text-slate-800 dark:text-white">{item.category}</p>
          <div className="flex justify-between gap-4"><span className="text-slate-500">Revenue</span><strong>{formatINR(item.revenue)}</strong></div>
          <div className="flex justify-between gap-4"><span className="text-slate-500">Share</span><strong className="text-green-700 dark:text-green-400">{formatPercent(item.percentage)}</strong></div>
          <div className="flex justify-between gap-4"><span className="text-slate-500">Orders</span><strong>{formatNumber(item.ordersCount)}</strong></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ui-card p-5 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">Category Mix</h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">eSIM vs Plastic SIM</p>
      </div>

      {/* Donut */}
      <div className="relative flex-1 flex items-center justify-center" style={{ minHeight: 180 }}>
        {data.length === 0 ? (
          <span className="text-xs text-slate-400">No category data</span>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={5} dataKey="revenue" strokeWidth={0}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.category] ?? entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-medium">Total</span>
              <span className="text-sm font-black text-slate-800 dark:text-white">{formatCompactINR(totalRevenue)}</span>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        {data.map((item) => (
          <div key={item.category} className="flex items-center gap-2 p-2.5 rounded-2xl" style={{ background: (CATEGORY_COLORS[item.category] ?? item.color) + '12' }}>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: CATEGORY_COLORS[item.category] ?? item.color }}>
              {item.category === 'eSIM' ? <Wifi className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{item.category}</p>
              <p className="text-[10px] font-semibold" style={{ color: CATEGORY_COLORS[item.category] ?? item.color }}>{formatPercent(item.percentage)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
