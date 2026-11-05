import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action
}) => {
  return (
    <div className={`bg-surface rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-lg font-semibold text-text">{title}</h3>}
            {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

