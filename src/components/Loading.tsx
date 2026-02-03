import React, { memo } from 'react';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Loading Component
 * Displays a loading spinner with optional message
 */
const Loading: React.FC<LoadingProps> = memo(({ message = 'Loading...', size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Spinner */}
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 border-2 border-gray-800 rounded-full" />
        <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin" />
      </div>

      {/* Message */}
      <p className="font-mono text-xs text-cyan-500/80 uppercase tracking-[0.2em]">
        {message}
      </p>

      {/* Screen reader text */}
      <span className="sr-only">{message}</span>
    </div>
  );
});

Loading.displayName = 'Loading';

export default Loading;
