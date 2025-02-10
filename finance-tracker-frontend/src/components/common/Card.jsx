import React from 'react';
import { classNames } from '@/utils/classNames';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={classNames('card', className)} {...props}>
      {children}
    </div>
  );
}; 