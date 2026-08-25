import React from 'react';
import { RefreshCw, Plus, Moon, Sun, Bell, Zap } from 'lucide-react';

interface HeaderProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenNewSaleModal: () => void;
  totalOrdersCount: number;
  filteredOrdersCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  realtimeNotification?: { id: number; message: string } | null;
}

const NAV_TABS = ['Dashboard', 'Reports', 'Analytics', 'History', 'Contacts'];

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onOpenNewSaleModal,
  isDark,
  onToggleTheme,
  isRefreshing,
  realtimeNotification,
}) => (
  <header className="flex items-center gap-4 px-4 py-4">
    {/* Logo wordmark */}
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-8 h-8 bg-green-800 rounded-xl flex items-center justify-center shadow-sm">
        <span className="text-white font-black text-xs tracking-tight">SD</span>
      </div>
      <span className="hidden sm:block font-bold text-slate-800 dark:text-white text-sm">SalesDash</span>
    </div>

    {/* Center nav tabs */}
    <nav className="hidden lg:flex items-center bg-white dark:bg-slate-900 rounded-full px-1.5 py-1.5 gap-0.5 shadow-pill mx-2">
      {NAV_TABS.map((tab, i) => (
        <button
          key={tab}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            i === 0
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>

    {/* Right actions */}
    <div className="ml-auto flex items-center gap-2.5">
      {/* Live toast */}
      {realtimeNotification && (
        <span
          key={realtimeNotification.id}
          className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full"
        >
          <Zap className="w-3 h-3 text-green-500" />
          {realtimeNotification.message}
        </span>
      )}

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="w-9 h-9 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-pill text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        title="Toggle theme"
      >
        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Bell */}
      <button className="relative w-9 h-9 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-pill text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
      </button>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="w-9 h-9 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-pill text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        title="Refresh data"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      {/* New Sale CTA */}
      <button
        onClick={onOpenNewSaleModal}
        className="flex items-center gap-1.5 bg-green-800 hover:bg-green-900 text-white rounded-full pl-3 pr-4 py-2 text-xs font-bold shadow-green transition-colors"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
        <span className="hidden sm:inline">Add New Sale</span>
      </button>

      {/* Avatar */}
      <div className="w-9 h-9 bg-gradient-to-br from-green-700 to-green-900 rounded-full flex items-center justify-center text-white text-xs font-black shadow-pill shrink-0">
        AD
      </div>
    </div>
  </header>
);
