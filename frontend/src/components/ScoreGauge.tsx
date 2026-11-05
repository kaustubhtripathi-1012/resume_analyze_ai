import React from 'react';

export interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  title?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score = 0,
  size = 140,
  strokeWidth = 12,
  title = 'ATS Score'
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  let color = '#EF4444'; // danger
  let label = 'Needs Work';
  if (clampedScore >= 70) {
    color = '#10B981'; // accent
    label = 'Excellent';
  } else if (clampedScore >= 45) {
    color = '#F59E0B'; // warning
    label = 'Moderate';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-text">{clampedScore}</span>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</span>
        </div>
      </div>
      {title && <span className="mt-2 text-sm font-medium text-slate-700">{title}</span>}
    </div>
  );
};

