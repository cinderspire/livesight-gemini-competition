import React, { memo } from 'react';
import type { UserBadge } from '../types';

interface BadgeDisplayProps {
  badge: UserBadge;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

/**
 * Badge Display Component
 * Shows a single achievement badge with optional progress
 */
const BadgeDisplay: React.FC<BadgeDisplayProps> = memo(({
  badge,
  size = 'medium',
  showProgress = false,
}) => {
  const isEarned = !!badge.earnedAt;
  const progress = badge.progress && badge.target
    ? Math.min((badge.progress / badge.target) * 100, 100)
    : 0;

  const sizeClasses = {
    small: 'w-12 h-12 text-xl',
    medium: 'w-16 h-16 text-2xl',
    large: 'w-20 h-20 text-3xl',
  };

  const containerSize = sizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Badge Icon */}
      <div
        className={`${containerSize} rounded-full flex items-center justify-center relative ${
          isEarned
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
            : 'bg-gray-800 border-2 border-gray-700'
        }`}
        role="img"
        aria-label={`${badge.name} badge${isEarned ? ' - earned' : ' - locked'}`}
      >
        {/* Icon */}
        <span className={isEarned ? '' : 'opacity-30 grayscale'}>
          {badge.icon}
        </span>

        {/* Lock overlay for unearned badges */}
        {!isEarned && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs opacity-60">🔒</span>
          </div>
        )}

        {/* Progress ring for in-progress badges */}
        {!isEarned && showProgress && progress > 0 && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(34,211,238,0.2)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.89} 289`}
            />
          </svg>
        )}
      </div>

      {/* Badge Name */}
      <div className="text-center">
        <p className={`font-bold text-xs ${isEarned ? 'text-white' : 'text-gray-500'}`}>
          {badge.name}
        </p>

        {/* Progress text */}
        {!isEarned && showProgress && badge.progress !== undefined && badge.target && (
          <p className="text-[10px] text-gray-600 font-mono">
            {badge.progress}/{badge.target}
          </p>
        )}

        {/* Earned date */}
        {isEarned && badge.earnedAt && (
          <p className="text-[10px] text-gray-500 font-mono">
            {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
});

BadgeDisplay.displayName = 'BadgeDisplay';

export default BadgeDisplay;
