import React from 'react';
import { ProductLeaderboardItem } from '../types/sales';
import { formatINR, formatPercent, formatNumber } from '../utils/currencyUtils';
import { Award, PackageCheck, Wifi, Smartphone } from 'lucide-react';

interface ProductRankingProps {
  products: ProductLeaderboardItem[];
}

export const ProductRanking: React.FC<ProductRankingProps> = ({ products }) => {
  const max = products[0]?.revenue || 1;

  return (
    <div className="ui-card p-5 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-green-700 dark:text-green-400" />
          Top Products
        </h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 ml-6">By revenue generated</p>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600 py-8">
            <Award className="w-7 h-7" />
            <span className="text-xs">No products in this period</span>
          </div>
        ) : (
          products.map((item, i) => (
            <div key={item.productId} className="flex items-center gap-3 px-2.5 py-2 rounded-2xl hover:bg-green-50/60 dark:hover:bg-green-950/20 transition-colors">
              {/* Rank badge */}
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                i === 0 ? 'bg-green-800 text-white' :
                i === 1 ? 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-300' :
                i === 2 ? 'bg-green-600 text-white' :
                'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {i + 1}
              </span>

              {/* Category icon */}
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                item.category === 'eSIM'
                  ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400'
                  : 'bg-green-200/60 dark:bg-green-900/40 text-green-600 dark:text-green-300'
              }`}>
                {item.category === 'eSIM' ? <Wifi className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-0.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate pr-1" title={item.name}>{item.name}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white shrink-0">{formatINR(item.revenue)}</span>
                </div>
                <div className="h-1.5 bg-green-100 dark:bg-green-950/40 rounded-full overflow-hidden mb-0.5">
                  <div className={`h-full rounded-full transition-all duration-700 ${i === 0 ? 'bg-green-800' : i === 1 ? 'bg-green-600' : 'bg-green-400'}`}
                    style={{ width: `${(item.revenue / max) * 100}%` }} />
                </div>
                <div className="flex gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                  <PackageCheck className="w-3 h-3 shrink-0" />
                  <span>{formatNumber(item.unitsSold)} sold</span>
                  <span className="text-green-700 dark:text-green-400 font-semibold">{formatPercent(item.percentageOfTotal)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
