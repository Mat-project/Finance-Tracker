import React, { useState, useEffect } from 'react';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { api } from '@/services/api';
import { XCircleIcon } from '@heroicons/react/24/outline';

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.transactions.getAll();
      console.log("API Response:", response.data);
      setTransactions(Array.isArray(response.data?.results) ? response.data.results : []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions. Please try again.');
      setTransactions([]); // Ensure transactions state is set to an array
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.categories.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories. Please try again.');
      setCategories([]);
    }
  };

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchCategories()]);
  }, []);

  const handleTransactionUpdate = async (updatedTransaction) => {
    try {
      await api.transactions.update(updatedTransaction.id, updatedTransaction);
      await fetchTransactions(); // Refresh the list after update
    } catch (err) {
      console.error('Failed to update transaction:', err);
      setError('Failed to update transaction. Please try again.');
    }
  };

  // Handle Edit Transaction
  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setShowForm(true);
  };

  // Handle Delete Transaction
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await api.transactions.delete(id);
      await fetchTransactions(); // Refresh transaction list after deletion
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      setError('Failed to delete transaction. Please try again.');
    }
  };

  // Handle Create or Update Transaction
  const handleSubmit = async (data) => {
    try {
      setError(null);
      if (selectedTransaction) {
        // Update transaction
        await api.transactions.update(selectedTransaction.id, data);
      } else {
        // Create new transaction
        await api.transactions.create(data);
      }
      setShowForm(false);
      setSelectedTransaction(null);
      await fetchTransactions(); // Refresh the transaction list
    } catch (err) {
      console.error('Failed to save transaction:', err);
      setError('Failed to save transaction. Please try again.');
    }
  };

  // Handle Form Cancel
  const handleCancel = () => {
    setShowForm(false);
    setSelectedTransaction(null);
  };

  if (loading && !transactions.length) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Transaction Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Transactions
        </h1>
        <Button
          onClick={() => {
            setSelectedTransaction(null);
            setShowForm(true);
          }}
          variant="primary"
        >
          Add Transaction
        </Button>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Form */}
      {showForm && (
        <TransactionForm
          transaction={selectedTransaction}
          categories={categories} // Pass categories to form
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        categories={categories} // Pass categories to list
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTransactionUpdated={handleTransactionUpdate}
      />
    </div>
  );
};

export default TransactionsPage;
