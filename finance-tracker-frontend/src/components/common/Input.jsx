import React from 'react';
import { classNames } from '@/utils/classNames';

export const Input = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <input
        className={classNames(
          'input',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}; 