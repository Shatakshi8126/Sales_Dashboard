import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Filter bar skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 h-28 flex flex-col justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div>
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-[380px] flex flex-col justify-between">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-[380px] flex flex-col justify-between">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-48 h-48 rounded-full bg-slate-100 dark:bg-slate-800/60 mx-auto" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
        </div>
      </div>

      {/* Leaderboards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-[380px] space-y-3">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
            ))}
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-80 space-y-4">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};
