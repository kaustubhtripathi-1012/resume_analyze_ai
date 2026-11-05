import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  label = 'Loading...',
  size = 'md'
}) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-muted">
      <Loader2 className={`${iconSize} animate-spin text-primary`} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};

