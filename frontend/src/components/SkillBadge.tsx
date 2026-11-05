import React from 'react';
import { Check, X } from 'lucide-react';

export interface SkillBadgeProps {
  name: string;
  variant?: 'matched' | 'missing' | 'neutral';
  onRemove?: () => void;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  variant = 'neutral',
  onRemove
}) => {
  let badgeStyle = 'bg-slate-100 text-slate-800 border-slate-200';
  let icon = null;

  if (variant === 'matched') {
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    icon = <Check className="w-3.5 h-3.5 text-emerald-600" />;
  } else if (variant === 'missing') {
    badgeStyle = 'bg-red-50 text-red-800 border-red-200';
    icon = <X className="w-3.5 h-3.5 text-red-600" />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${badgeStyle}`}>
      {icon}
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

