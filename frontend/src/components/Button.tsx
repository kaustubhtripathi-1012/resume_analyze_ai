import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  let variantClasses = 'bg-primary text-white hover:bg-primary-dark focus:ring-primary';
  if (variant === 'secondary') {
    variantClasses = 'bg-white text-text border border-slate-300 hover:bg-slate-50 focus:ring-slate-400';
  } else if (variant === 'danger') {
    variantClasses = 'bg-danger text-white hover:bg-red-600 focus:ring-danger';
  }

  return (
    <button
      disabled={disabled || loading}
      className={`h-10 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

