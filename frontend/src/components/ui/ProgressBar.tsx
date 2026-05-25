import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

const COLOR_MAP = {
  primary: 'from-accent to-accent-secondary',
  success: 'from-success to-green-400',
  warning: 'from-warning to-orange-400',
  error: 'from-error to-red-400',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  label,
  color = 'primary',
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-text-secondary">
            {label}
          </span>
          {showLabel && (
            <span className="text-xs text-text-muted">
              {current} / {max}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-bg-secondary rounded-full overflow-hidden border border-border-subtle">
        <div
          className={`h-full bg-gradient-to-r ${COLOR_MAP[color]} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
