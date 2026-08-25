import React from 'react';
import { DestinationBreakdown } from '../types/sales';
import { formatCompactINR, formatPercent, formatNumber } from '../utils/currencyUtils';
import { Globe, MapPin } from 'lucide-react';

interface RegionChartProps {
  data: DestinationBreakdown[];
  totalRevenue: number;
}

export const RegionChart: React.FC<RegionChartProps> = ({ data }) => {
  const top = data.slice(0, 7);
  const max = top[0]?.revenue || 1;

  return (
    <div className="ui-card p-5 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-green-700 dark:text-green-400" />
          Top Destinations
        </h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 ml-6">By revenue share</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {top.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600 py-8">
            <Globe className="w-7 h-7" />
            <span className="text-xs">No destination data</span>
          </div>
        ) : (
          top.map((dest, i) => (
            <div key={dest.name} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-green-50/60 dark:hover:bg-green-950/20 transition-colors group">
              {/* Rank */}
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 text-white ${
                i === 0 ? 'bg-green-800' : i === 1 ? 'bg-green-600' : i === 2 ? 'bg-green-400' : 'bg-slate-300 dark:bg-slate-700 !text-slate-600 dark:!text-slate-300'
              }`}>
                {i + 1}
              </span>

              {/* Flag */}
              {dest.flag ? (
                <img src={dest.flag} alt={dest.name} className="w-6 h-4 object-cover rounded shrink-0 shadow-sm"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              ) : (
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              )}

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate pr-2">{dest.name}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white shrink-0">{formatCompactINR(dest.revenue)}</span>
                </div>
                <div className="h-1.5 bg-green-100 dark:bg-green-950/40 rounded-full overflow-hidden">
                  <div className="h-full bg-green-700 rounded-full transition-all duration-700"
                    style={{ width: `${(dest.revenue / max) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                  <span>{formatNumber(dest.ordersCount)} orders</span>
                  <span className="text-green-700 dark:text-green-400 font-semibold">{formatPercent(dest.percentage)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
