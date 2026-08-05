import React from 'react';

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
      <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
      <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardSkeleton;
