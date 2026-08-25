import React, { useState } from 'react';
import { 
  Calendar, 
  X, 
  RotateCcw, 
  Globe, 
  UserCheck, 
  Smartphone,
  Search,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { FilterState, QuickDatePreset, User } from '../types/sales';
import { DatePickerCalendar } from './DatePickerCalendar';

interface FilterBarProps {
  filters: FilterState;
  dateRangeLabel: string;
  hasActiveFilters: boolean;
  availableSalespeople: User[];
  availableDestinations: { name: string; code: string; flag?: string }[];
  filteredCount: number;
  totalCount: number;
  onSetPreset: (preset: QuickDatePreset) => void;
  onSetSpecificDate: (date: string | null) => void;
  onSetCustomDateRange: (start: string, end: string) => void;
  onSetMonthYear: (month: number, year: number) => void;
  onSetCategory: (cat: string) => void;
  onSetDestination: (dest: string) => void;
  onSetSalespersonId: (id: number | 'ALL') => void;
  onSetSearchQuery: (query: string) => void;
  onClearFilters: () => void;
}

const PRESETS: { id: QuickDatePreset; label: string }[] = [
  { id: 'allTime',    label: 'All Time' },
  { id: 'today',      label: 'Today' },
  { id: 'yesterday',  label: 'Yesterday' },
  { id: 'last7days',  label: '7 Days' },
  { id: 'last30days', label: '30 Days' },
  { id: 'thisMonth',  label: 'This Month' },
  { id: 'lastMonth',  label: 'Last Month' },
  { id: 'thisQuarter',label: 'Quarter' },
  { id: 'thisYear',   label: 'This Year' },
];

const MONTHS = [
  { value: 1,  label: 'January'   },
  { value: 2,  label: 'February'  },
  { value: 3,  label: 'March'     },
  { value: 4,  label: 'April'     },
  { value: 5,  label: 'May'       },
  { value: 6,  label: 'June'      },
  { value: 7,  label: 'July'      },
  { value: 8,  label: 'August'    },
  { value: 9,  label: 'September' },
  { value: 10, label: 'October'   },
  { value: 11, label: 'November'  },
  { value: 12, label: 'December'  },
];

const YEARS = [2024, 2025, 2026, 2027];

const SelectControl: React.FC<{
  label: string;
  icon?: React.ReactNode;
  value: string | number;
  onChange: (val: string) => void;
  children: React.ReactNode;
  active?: boolean;
}> = ({ label, icon, value, onChange, children, active }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
      {icon}
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none text-xs py-2 pl-3 pr-8 rounded-xl border transition-all cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-600
          ${active
            ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 font-semibold'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
      >
        {children}
      </select>
      <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${active ? 'text-green-700' : 'text-slate-400'}`} />
    </div>
  </div>
);

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  dateRangeLabel,
  hasActiveFilters,
  availableSalespeople,
  availableDestinations,
  filteredCount,
  totalCount,
  onSetPreset,
  onSetSpecificDate,
  onSetCustomDateRange,
  onSetMonthYear,
  onSetCategory,
  onSetDestination,
  onSetSalespersonId,
  onSetSearchQuery,
  onClearFilters,
}) => {
  const [showCustomRange, setShowCustomRange] = useState(filters.preset === 'custom');
  const [customStart, setCustomStart] = useState(filters.startDate || '2026-01-01');
  const [customEnd, setCustomEnd]     = useState(filters.endDate   || '2026-03-31');
  const [selectedYear, setSelectedYear] = useState<number>(filters.selectedYear || 2026);

  const handleApplyCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      onSetCustomDateRange(customStart, customEnd);
      setShowCustomRange(false);
    }
  };

  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedYear(year);
    onSetMonthYear(month, year);
  };

  const activeCount = [
    filters.preset !== 'allTime' || filters.specificDate,
    filters.category !== 'ALL',
    filters.destination !== 'ALL',
    filters.salespersonId !== 'ALL',
    (filters.searchQuery || '').trim().length > 0,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Welcome and Date Preset Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-baseline gap-1">
            Welcome Back, <span className="text-slate-500 font-normal">Sujon</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overview · Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} orders
          </p>
        </div>

        {/* Date presets aligned in a capsule container */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-card shrink-0">
          {PRESETS.slice(0, 5).map((p) => {
            const isActive = filters.preset === p.id && !filters.specificDate;
            return (
              <button
                key={p.id}
                onClick={() => { setShowCustomRange(false); onSetPreset(p.id); }}
                className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-green-800 text-white shadow-sm shadow-green-800/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
          <button
            onClick={() => setShowCustomRange(!showCustomRange)}
            className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all shrink-0 ${
              filters.preset === 'custom' || showCustomRange
                ? 'bg-green-800 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* ── Custom Range Accordion ── */}
      {showCustomRange && (
        <form
          onSubmit={handleApplyCustomRange}
          className="flex flex-wrap items-center gap-3 px-5 py-4 bg-green-50/50 dark:bg-green-950/20 rounded-3xl border border-green-100/50 dark:border-green-900/50 text-xs"
        >
          <span className="font-bold text-green-800 dark:text-green-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Date Range
          </span>
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            From
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-green-500/25 focus:border-green-600 focus:outline-none"
              required
            />
          </label>
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            To
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-green-500/25 focus:border-green-600 focus:outline-none"
              required
            />
          </label>
          <button
            type="submit"
            className="px-4 py-1.5 bg-green-800 hover:bg-green-950 text-white rounded-xl font-bold transition-colors shadow-sm"
          >
            Apply
          </button>
        </form>
      )}

      {/* ── Main Filters Row ── */}
      <div className="ui-card p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Date picker */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Specific Date
          </label>
          <DatePickerCalendar
            selectedDate={filters.specificDate}
            onSelectDate={(date) => { setShowCustomRange(false); onSetSpecificDate(date); }}
          />
        </div>

        {/* Month */}
        <SelectControl
          label="Month"
          value={filters.preset === 'monthYear' && filters.selectedMonth ? filters.selectedMonth : ''}
          onChange={(val) => {
            const n = val ? Number(val) : null;
            if (n) handleMonthYearChange(n, selectedYear);
            else onSetPreset('allTime');
          }}
          active={filters.preset === 'monthYear' && !!filters.selectedMonth}
        >
          <option value="">All Months</option>
          {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </SelectControl>

        {/* Year */}
        <SelectControl
          label="Year"
          value={filters.selectedYear || selectedYear}
          onChange={(val) => {
            const n = Number(val);
            setSelectedYear(n);
            if (filters.preset === 'monthYear' && filters.selectedMonth) {
              handleMonthYearChange(filters.selectedMonth, n);
            }
          }}
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </SelectControl>

        {/* Category */}
        <SelectControl
          label="Category"
          icon={<Smartphone className="w-3 h-3" />}
          value={filters.category}
          onChange={onSetCategory}
          active={filters.category !== 'ALL'}
        >
          <option value="ALL">All Categories</option>
          <option value="eSIM">eSIM</option>
          <option value="Plastic SIM">Plastic SIM</option>
        </SelectControl>

        {/* Destination */}
        <SelectControl
          label="Destination"
          icon={<Globe className="w-3 h-3" />}
          value={filters.destination}
          onChange={onSetDestination}
          active={filters.destination !== 'ALL'}
        >
          <option value="ALL">All Destinations</option>
          {availableDestinations.map((d) => (
            <option key={d.code} value={d.name}>{d.name} ({d.code})</option>
          ))}
        </SelectControl>

        {/* Sales Rep */}
        <SelectControl
          label="Sales Rep"
          icon={<UserCheck className="w-3 h-3" />}
          value={filters.salespersonId === 'ALL' ? 'ALL' : filters.salespersonId}
          onChange={(val) => onSetSalespersonId(val === 'ALL' ? 'ALL' : Number(val))}
          active={filters.salespersonId !== 'ALL'}
        >
          <option value="ALL">All Reps</option>
          {availableSalespeople.map((sp) => (
            <option key={sp.user_id} value={sp.user_id}>{sp.name}</option>
          ))}
        </SelectControl>

        {/* Search */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Search className="w-3 h-3" /> Search
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Order, customer…"
              value={filters.searchQuery}
              onChange={(e) => onSetSearchQuery(e.target.value)}
              className={`w-full text-xs py-2 pl-8 pr-7 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-600
                ${filters.searchQuery
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
            />
            {filters.searchQuery && (
              <button
                onClick={() => onSetSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Active Chips Row ── */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            {activeCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-green-800 text-white text-[9px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
            :
          </span>

          {filters.specificDate ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-100 dark:border-green-900/60">
              📅 {dateRangeLabel}
              <button onClick={() => onSetSpecificDate(null)} className="hover:text-green-950 dark:hover:text-green-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : filters.preset !== 'allTime' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-100 dark:border-green-900/60">
              📅 {dateRangeLabel}
              <button onClick={() => onSetPreset('allTime')} className="hover:text-green-950 dark:hover:text-green-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : null}

          {filters.category !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-100 dark:border-green-900/60">
              📱 {filters.category}
              <button onClick={() => onSetCategory('ALL')} className="hover:text-green-950 dark:hover:text-green-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.destination !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-100 dark:border-green-900/60">
              🌍 {filters.destination}
              <button onClick={() => onSetDestination('ALL')} className="hover:text-green-950 dark:hover:text-green-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.salespersonId !== 'ALL' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-100 dark:border-green-900/60">
              👤 {availableSalespeople.find((s) => s.user_id === filters.salespersonId)?.name || `Rep #${filters.salespersonId}`}
              <button onClick={() => onSetSalespersonId('ALL')} className="hover:text-green-950 dark:hover:text-green-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-100 dark:border-green-900/60">
              🔍 "{filters.searchQuery}"
              <button onClick={() => onSetSearchQuery('')} className="hover:text-green-950 dark:hover:text-green-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onClearFilters}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/20 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        </div>
      )}
    </div>
  );
};
