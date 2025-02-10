import React from 'react';
import { Card } from '@/components/common/Card';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export const StatsCard = ({ title, amount, change, type = 'neutral' }) => {
  const isPositive = change > 0;

  // Adjust color based on type (income/expense) and dark mode
  const changeColor = type === 'expense'
    ? (isPositive ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400')
    : (isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400');

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {formatCurrency(amount)}
        </p>
        <p className={`ml-2 flex items-baseline text-sm font-semibold ${changeColor}`}>
          {isPositive ? (
            <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-current" aria-hidden="true" />
          ) : (
            <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-current" aria-hidden="true" />
          )}
          <span className="sr-only">{isPositive ? 'Increased' : 'Decreased'} by</span>
          {formatPercentage(Math.abs(change))}
        </p>
      </div>
    </Card>
  );
};
