import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { api } from '@/services/api';

export const GoalForm = ({ onSuccess, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    target_amount: initialData?.target_amount || '',
    deadline: initialData?.deadline || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    // Validate target amount
    const amount = parseFloat(formData.target_amount);
    if (!formData.target_amount || isNaN(amount) || amount <= 0) {
      setError('Target amount must be greater than 0');
      return false;
    }
    // Check if amount is too large (max 999,999,999,999.99)
    if (amount > 999999999999.99) {
      setError('Target amount cannot exceed 999,999,999,999.99');
      return false;
    }
    
    if (!formData.deadline) {
      setError('Deadline is required');
      return false;
    }
    // Check if deadline is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate < today) {
      setError('Deadline cannot be in the past');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        target_amount: formData.target_amount.toString(),
      };

      if (initialData) {
        await api.goals.update(initialData.id, payload);
      } else {
        await api.goals.create(payload);
      }
      onSuccess();
    } catch (err) {
      console.error('Goal form error:', err);
      const errorMessage = 
        err.response?.data?.target_amount?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save goal. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user makes changes
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        required
        placeholder="Enter goal title"
      />
      
      <Input
        label="Description"
        name="description"
        type="textarea"
        value={formData.description}
        onChange={handleInputChange}
        placeholder="Enter goal description (optional)"
      />
      
      <Input
        label="Target Amount"
        name="target_amount"
        type="number"
        step="0.01"
        min="0.01"
        max="999999999999.99"
        value={formData.target_amount}
        onChange={handleInputChange}
        required
        placeholder="Enter target amount"
      />
      
      <Input
        label="Deadline"
        name="deadline"
        type="date"
        value={formData.deadline}
        onChange={handleInputChange}
        required
        min={new Date().toISOString().split('T')[0]}
      />

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      <Button
        type="submit"
        isLoading={loading}
        className="w-full"
      >
        {initialData ? 'Update' : 'Create'} Goal
      </Button>
    </form>
  );
}; 