import React from 'react';
import { formatCurrency } from '@/utils/formatters';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export const GoalCard = ({ goal, onEdit, onDelete }) => {
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
          <p className="text-sm text-gray-500">{goal.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(goal)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 rounded-full h-2"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <span className={`font-medium ${daysLeft > 7 ? 'text-gray-600' : 'text-red-600'}`}>
          {daysLeft} days left
        </span>
        <span className={`font-medium ${
          goal.status === 'completed' ? 'text-green-600' : 
          goal.status === 'failed' ? 'text-red-600' : 'text-indigo-600'
        }`}>
          {goal.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
    </div>
  );
}; 