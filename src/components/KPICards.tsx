import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wifi,
  Minus,
  ShoppingCart,
  CreditCard,
  Tag,
} from 'lucide-react';
import { KPIMetrics } from '../types/sales';
import { formatINR, formatCompactINR, formatNumber, formatGrowth } from '../utils/currencyUtils';

interface KPICardsProps {
  metrics: KPIMetrics;
}

const GrowthPill: React.FC<{ pct: number | null }> = ({ pct }) => {
  const g = formatGrowth(pct);
  if (g.isNeutral) return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" /> 0.0%
    </span>
  );
  if (g.isPositive) return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/60 px-2 py-0.5 rounded-full">
      <TrendingUp className="w-3 h-3" /> {g.text}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
      <TrendingDown className="w-3 h-3" /> {g.text}
    </span>
  );
};

/* ─── Left column: Revenue hero card ─── */
export const RevenueHeroCard: React.FC<KPICardsProps> = ({ metrics }) => (
  <div className="ui-card p-5 flex flex-col gap-5">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-bold text-slate-800 dark:text-white">Revenue Goal</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Total sales performance</p>
      </div>
      <button className="text-slate-300 dark:text-slate-600 hover:text-slate-500 transition-colors text-lg leading-none">↗</button>
    </div>

    {/* Credit-card style hero panel */}
    <div className="relative bg-gradient-to-br from-green-800 to-green-900 rounded-2xl p-5 text-white overflow-hidden">
      {/* Background circles decoration */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white/5" />

      {/* Card top row */}
      <div className="relative flex items-center justify-between mb-5">
        <span className="font-black text-base tracking-widest opacity-90">SALES</span>
        <Wifi className="w-5 h-5 opacity-60" />
      </div>

      {/* Revenue amount */}
      <div className="relative mb-4">
        <p className="text-[11px] text-green-300 font-medium mb-1 opacity-80">Total Revenue</p>
        <p className="text-2xl font-black tracking-tight">{formatINR(metrics.totalRevenue)}</p>
      </div>

      {/* Card footer */}
      <div className="relative flex items-center justify-between text-xs opacity-70">
        <span>Orders: <strong className="opacity-100">{formatNumber(metrics.totalOrders)}</strong></span>
        <span>Units: <strong className="opacity-100">{formatNumber(metrics.unitsSold)}</strong></span>
      </div>
    </div>

    {/* Growth stat row */}
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500">Revenue Growth</p>
        <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">
          {formatCompactINR(metrics.totalRevenue)}
        </p>
      </div>
      <GrowthPill pct={metrics.revenueGrowthPct} />
    </div>
  </div>
);

/* ─── Right column: stacked mini KPI cards ─── */
export const RightKPICards: React.FC<KPICardsProps> = ({ metrics }) => (
  <div className="flex flex-col gap-4">
    {/* Total Orders card — with mini area graphic placeholder */}
    <div className="ui-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-950/60 flex items-center justify-center">
          <ShoppingCart className="w-4 h-4 text-green-700 dark:text-green-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Total Orders</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Transaction count</p>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">
            {formatNumber(metrics.totalOrders)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <GrowthPill pct={metrics.ordersGrowthPct} />
            <span className="text-[11px] text-slate-400 dark:text-slate-500">vs prev</span>
          </div>
        </div>
        {/* mini sparkline bars */}
        <div className="flex items-end gap-0.5 h-10">
          {[40, 60, 45, 80, 55, 70, 90].map((h, i) => (
            <div
              key={i}
              className={`w-2 rounded-sm ${i === 6 ? 'bg-green-700' : 'bg-green-200 dark:bg-green-900/60'}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>

    {/* Avg Order Value */}
    <div className="ui-card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Avg Order Value</p>
        </div>
        <GrowthPill pct={null} />
      </div>
      <p className="text-2xl font-black text-slate-800 dark:text-white">
        {formatINR(metrics.averageOrderValue)}
      </p>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">per transaction</p>
    </div>

    {/* Discounts */}
    <div className="ui-card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center">
            <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Discounts Given</p>
        </div>
      </div>
      <p className="text-2xl font-black text-purple-700 dark:text-purple-300">
        {formatINR(metrics.totalDiscount)}
      </p>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
        Net: <strong className="text-slate-700 dark:text-slate-200 font-bold">{formatINR(metrics.netRevenue)}</strong>
      </p>
    </div>
  </div>
);

/* ─── Legacy export (kept for compatibility) ─── */
export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => (
  <div className="space-y-4">
    <RevenueHeroCard metrics={metrics} />
    <RightKPICards metrics={metrics} />
  </div>
);
