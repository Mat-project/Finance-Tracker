import React, { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { api } from '@/services/api';
import { XCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '',
    deadline: '',
    description: '',
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await api.goals.getAll();
      setGoals(response.data || []);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
      setError('Failed to load financial goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
      };

      console.log('Submitting goal:', dataToSubmit);

      if (selectedGoal) {
        await api.goals.update(selectedGoal.id, dataToSubmit);
      } else {
        await api.goals.create(dataToSubmit);
      }
      setShowForm(false);
      setSelectedGoal(null);
      setFormData({
        title: '',
        target_amount: '',
        deadline: '',
        description: '',
      });
      fetchGoals();
    } catch (err) {
      console.error('Error saving goal:', err);
      setError(err.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleEdit = (goal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title,
      target_amount: goal.target_amount.toString(),
      deadline: goal.deadline,
      description: goal.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this financial goal?')) {
      try {
        await api.goals.delete(id);
        fetchGoals();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete goal');
      }
    }
  };

  const calculateProgress = (goal) => {
    return goal.progress_percentage || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Financial Goals</h1>
        <Button onClick={() => setShowForm(true)}>Add Goal</Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 relative">
          <button
            onClick={() => {
              setShowForm(false);
              setSelectedGoal(null);
              setFormData({
                title: '',
                target_amount: '',
                deadline: '',
                description: '',
              });
            }}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-medium mb-4 pr-12">
            {selectedGoal ? 'Edit' : 'Add'} Financial Goal
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Goal Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="Target Amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              required
            />
            <Input
              label="Target Date"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                rows="3"
              />
            </div>
            <Button type="submit" className="w-full">
              {selectedGoal ? 'Update' : 'Add'} Goal
            </Button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
            No financial goals yet. Create one to start tracking your progress!
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Target: {formatCurrency(goal.target_amount)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current: {formatCurrency(goal.current_amount)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {goal.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                )}
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:text-blue-400 dark:bg-blue-900/20">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                        {calculateProgress(goal)}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-blue-900/20">
                    <div
                      style={{ width: `${calculateProgress(goal)}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-400"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}