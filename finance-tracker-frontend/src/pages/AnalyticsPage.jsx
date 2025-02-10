import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    spendingTrends: [],
    categoryBreakdown: [],
    summary: null,
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [trendsResponse, categoryResponse] = await Promise.all([
          api.transactions.getTrends(),
          api.transactions.getExpensesByCategory(),
        ]);

        setAnalyticsData({
          spendingTrends: trendsResponse.data || [],
          categoryBreakdown: categoryResponse.data || [],
          summary: {
            totalIncome: trendsResponse.data?.reduce((sum, item) => sum + item.income, 0) || 0,
            totalExpenses: trendsResponse.data?.reduce((sum, item) => sum + item.expense, 0) || 0,
          },
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">Error Loading Analytics</div>
          <div className="text-red-500 dark:text-red-300">{error}</div>
        </div>
      </div>
    );
  }

  const totalExpenses = analyticsData.categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = analyticsData.summary.totalIncome - analyticsData.summary.totalExpenses;

  // Format dates to be more readable
  const formattedTrends = analyticsData.spendingTrends.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(analyticsData.summary.totalIncome)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(analyticsData.summary.totalExpenses)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Net Income</h3>
          <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(netIncome)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monthly Income vs Expenses</h2>
          <div className="h-80">
            <Bar
              data={{
                labels: formattedTrends.map(item => item.date),
                datasets: [
                  {
                    label: 'Income',
                    data: formattedTrends.map(item => item.income),
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1,
                  },
                  {
                    label: 'Expenses',
                    data: formattedTrends.map(item => item.expense),
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: value => formatCurrency(value),
                    },
                    grid: {
                      color: 'rgba(156, 163, 175, 0.1)',
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: context => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Expense Categories</h2>
          <div className="h-80">
            <Doughnut
              data={{
                labels: analyticsData.categoryBreakdown.map(item => item.name),
                datasets: [{
                  data: analyticsData.categoryBreakdown.map(item => item.amount),
                  backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',   // red
                    'rgba(34, 197, 94, 0.8)',   // green
                    'rgba(59, 130, 246, 0.8)',  // blue
                    'rgba(168, 85, 247, 0.8)',  // purple
                    'rgba(251, 146, 60, 0.8)',  // orange
                    'rgba(236, 72, 153, 0.8)',  // pink
                  ],
                  borderWidth: 1,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                      generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels.map((label, i) => {
                          const value = data.datasets[0].data[i];
                          const percentage = ((value / totalExpenses) * 100).toFixed(1);
                          return {
                            text: `${label}\n${formatCurrency(value)} (${percentage}%)`,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            index: i,
                          };
                        });
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.raw;
                        const percentage = ((value / totalExpenses) * 100).toFixed(1);
                        return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Net Income Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Net Income Trend</h2>
          <div className="h-80">
            <Line
              data={{
                labels: formattedTrends.map(item => item.date),
                datasets: [{
                  label: 'Net Income',
                  data: formattedTrends.map(item => item.income - item.expense),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointBackgroundColor: 'rgb(59, 130, 246)',
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    grid: {
                      color: 'rgba(156, 163, 175, 0.1)',
                    },
                    ticks: {
                      callback: value => formatCurrency(value),
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: context => `Net Income: ${formatCurrency(context.parsed.y)}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};