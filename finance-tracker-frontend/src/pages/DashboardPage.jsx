import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import { useTheme } from '@/contexts/ThemeContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const DashboardPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    currentBalance: 0,
    monthlyChange: 0,
    incomeChange: 0,
    expenseChange: 0,
    monthlyChangePercent: 0,
    recentTransactions: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryResponse, transactionsResponse] = await Promise.all([
          api.transactions.getSummary(),
          api.transactions.getAll()
        ]);

        // Handle the case where response.data might be a URL
        const getSummaryData = async (response) => {
          if (typeof response.data === 'string') {
            const actualResponse = await fetch(response.data);
            return actualResponse.json();
          }
          return response.data;
        };

        const getTransactionsData = async (response) => {
          if (typeof response.data === 'string') {
            const actualResponse = await fetch(response.data);
            const data = await actualResponse.json();
            return data.results || [];
          }
          return response.data.results || [];
        };

        const [summary, transactions] = await Promise.all([
          getSummaryData(summaryResponse),
          getTransactionsData(transactionsResponse)
        ]);

        // Get recent transactions (last 5)
        const recentTransactions = transactions
          .slice(0, 5)
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setDashboardData({
          totalIncome: summary.total_income || 0,
          totalExpenses: summary.total_expenses || 0,
          currentBalance: summary.balance || 0,
          monthlyIncome: summary.monthly_income || 0,
          monthlyExpenses: summary.monthly_expenses || 0,
          monthlyChange: summary.monthly_change || 0,
          incomeChange: ((summary.monthly_income || 0) - (summary.previous_month?.total || 0)) / (summary.previous_month?.total || 1) * 100,
          expenseChange: ((summary.monthly_expenses || 0) - (summary.previous_month?.total || 0)) / (summary.previous_month?.total || 1) * 100,
          recentTransactions,
          loading: false,
          error: null
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (dashboardData.loading) {
    return <LoadingSpinner />;
  }

  if (dashboardData.error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 text-lg font-medium mt-6">
        {dashboardData.error}
      </div>
    );
  }

  return (
    <div /* className="space-y-6 p-6 max-w-6xl mx-auto" */>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Total Income
          </h2>
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-2xl md:text-xl font-extrabold text-gray-900 dark:text-white">
              {formatCurrency(dashboardData.totalIncome)}
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Total Expenses
          </h2>
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-2xl md:text-xl font-extrabold text-gray-900 dark:text-white">
              {formatCurrency(dashboardData.totalExpenses)}
            </span>
          </div>
        </div>

        {/* Current Balance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Current Balance
          </h2>
          <div className="mt-3 flex items-center space-x-2">
            <span className={`text-2xl md:text-xl font-extrabold ${
              dashboardData.currentBalance >= 0 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              {formatCurrency(dashboardData.currentBalance)}
            </span>
          </div>
        </div>

        {/* Monthly Change */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Monthly Change
          </h2>
          <div className="mt-3 flex items-center space-x-2">
            <span className={`text-2xl md:text-xl font-extrabold ${
              dashboardData.monthlyChange >= 0 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              {formatCurrency(dashboardData.monthlyChange)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h2>
        {dashboardData.recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'income'
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No recent transactions
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
