import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
    <p className="text-emerald-700 font-medium animate-pulse">Loading prayer times...</p>
  </div>
);
