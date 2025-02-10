import React from 'react';

export const LoadingSpinner = ({ fullScreen = false }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center min-h-[400px]";

  return (
    <div className={containerClasses}>
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <div className="animate-ping absolute inset-0 rounded-full border-4 border-blue-500 opacity-20"></div>
      </div>
    </div>
  );
};
