import React, { useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { api } from "@/services/api";
import { XCircleIcon } from "@heroicons/react/24/outline";

export const TransactionForm = ({
  transaction,
  categories,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    date: transaction?.date || new Date().toISOString().split("T")[0],
    description: transaction?.description || "",
    amount: transaction?.amount || "",
    type: transaction?.type || "expense",
    category: transaction?.category?.id || "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date || "",
        description: transaction.description || "",
        category: transaction.category ? String(transaction.category.id) : "", // Ensure it's a string
        amount: transaction.amount || "",
        type: transaction.type || "expense",
      });
    } else {
      setFormData({
        date: "",
        description: "",
        category: "",
        amount: "",
        type: "expense",
      });
    }
  }, [transaction]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setLoading(true);
      setError("");
      setSuccess("");

      const dataToSubmit = {
        ...formData,
        amount: parseFloat(formData.amount),
        category: formData.category ? parseInt(formData.category) : null,
      };

      if (transaction) {
        await api.transactions.update(transaction.id, dataToSubmit);
        setSuccess("Transaction updated successfully");
      } else {
        await api.transactions.create(dataToSubmit);
        setSuccess("Transaction created successfully");
      }

      // Reset form and notify parent
      await onSubmit(dataToSubmit);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (transaction
            ? "Failed to update transaction"
            : "Failed to create transaction")
      );
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {transaction ? "Edit Transaction" : "Add Transaction"}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          disabled={isSubmitting}
        >
          <XCircleIcon className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/50">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 rounded-md bg-green-50 dark:bg-green-900/50">
          <p className="text-sm text-green-800 dark:text-green-200">
            {success}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="expense"
                checked={formData.type === "expense"}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Expense</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="income"
                checked={formData.type === "income"}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Income</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : transaction ? "Update" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
};
