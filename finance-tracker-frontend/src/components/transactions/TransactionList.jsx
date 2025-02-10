import React, { useState } from 'react';
import { formatDate, formatCurrency } from '@/utils/format';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const TransactionList = ({ transactions, categories, onEdit, onDelete, onTransactionUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onCategoryChange = async (transactionId, categoryId) => {
    try {
      setLoading(true);
      setError('');
      
      const transaction = transactions.find((t) => t.id === transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const selectedCategory = categories.find((cat) => cat.id === parseInt(categoryId));
      const updatedTransaction = {
        ...transaction,
        category: selectedCategory ? selectedCategory.id : null,
        category_name: selectedCategory ? selectedCategory.name : null
      };

      // Call the parent component's update handler
      await onTransactionUpdated(updatedTransaction);
    } catch (err) {
      console.error('Failed to update category:', err);
      setError('Failed to update category');
    } finally {
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {error && (
        <div className="text-red-500 text-sm mb-4">{error}</div>
      )}
      {Array.isArray(transactions) && transactions.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    value={transaction.category || ''}
                    onChange={(e) => onCategoryChange(transaction.id, e.target.value)}
                    className="px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium
                  ${transaction.type === 'expense'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                  }`}>
                  {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No transactions available.</div>
      )}
    </div>
  );
};
