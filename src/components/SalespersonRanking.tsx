import React from 'react';
import { SalespersonLeaderboardItem } from '../types/sales';
import { formatCompactINR, formatPercent, formatNumber, formatINR } from '../utils/currencyUtils';
import { UserCheck, Crown } from 'lucide-react';

interface SalespersonRankingProps {
  salespeople: SalespersonLeaderboardItem[];
}

const AVATAR_GRADIENTS = [
  'from-green-700 to-green-900',
  'from-emerald-500 to-green-700',
  'from-teal-500 to-emerald-700',
  'from-green-400 to-emerald-600',
  'from-lime-500 to-green-600',
];

export const SalespersonRanking: React.FC<SalespersonRankingProps> = ({ salespeople }) => {
  const max = salespeople[0]?.revenue || 1;

  return (
    <div className="ui-card p-5 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-green-700 dark:text-green-400" />
          Sales Reps
        </h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 ml-6">Revenue & deals per rep</p>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {salespeople.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600 py-8">
            <UserCheck className="w-7 h-7" />
            <span className="text-xs">No sales team data</span>
          </div>
        ) : (
          salespeople.map((sp, i) => {
            const initials = sp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={sp.id} className={`flex items-center gap-3 px-2.5 py-2.5 rounded-2xl transition-colors ${
                i === 0 ? 'bg-green-50 dark:bg-green-950/20' : 'hover:bg-green-50/60 dark:hover:bg-green-950/20'
              }`}>
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} flex items-center justify-center text-xs font-black text-white shadow-sm`}>
                    {initials || 'SR'}
                  </div>
                  {i === 0 && (
                    <Crown className="absolute -top-2 -right-1 w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate pr-2">{sp.name}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white shrink-0">{formatCompactINR(sp.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-green-100 dark:bg-green-950/40 rounded-full overflow-hidden mb-0.5">
                    <div className="h-full bg-green-700 rounded-full transition-all duration-700"
                      style={{ width: `${(sp.revenue / max) * 100}%` }} />
                  </div>
                  <div className="flex gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                    <span>{formatNumber(sp.ordersCount)} orders</span>
                    <span>·</span>
                    <span>AOV <strong className="text-slate-600 dark:text-slate-300">{formatINR(sp.averageOrderValue)}</strong></span>
                    <span className="text-green-700 dark:text-green-400 font-bold ml-auto">{formatPercent(sp.percentageOfTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
