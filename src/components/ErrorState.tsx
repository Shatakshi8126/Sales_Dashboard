import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-sm p-12 text-center max-w-lg mx-auto my-12 transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Unable to load sales data</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        There was an issue retrieving data from Supabase. Please check your network connection or Supabase settings and try again.
      </p>
      <div className="p-3 bg-rose-50/50 dark:bg-rose-950/40 rounded-lg border border-rose-100 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300 font-mono mb-6 text-left overflow-auto max-h-24">
        {error}
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-sm transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
};
