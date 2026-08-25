import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onClearFilters }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center max-w-lg mx-auto my-12 transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-4">
        <SearchX className="w-7 h-7" />
      </div>
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">No sales data found</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
        Try selecting a different date range or clearing your filters to see transactions.
      </p>
      <button
        onClick={onClearFilters}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 rounded-xl transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Clear All Filters</span>
      </button>
    </div>
  );
};
