import React, { useEffect, useState, useCallback, memo } from 'react';
import type { SystemToastProps } from '../types';
import { UI_CONFIG } from '../constants';

/**
 * System Toast Component
 * Displays command feedback notifications
 */
const SystemToast: React.FC<SystemToastProps> = memo(({ message, onClear }) => {
  const [visible, setVisible] = useState(false);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onClear, UI_CONFIG.TOAST_EXIT_DELAY);
  }, [onClear]);

  useEffect(() => {
    if (message) {
      setVisible(true);

      const timer = setTimeout(() => {
        handleDismiss();
      }, UI_CONFIG.TOAST_DURATION);

      return () => clearTimeout(timer);
    }
  }, [message, handleDismiss]);

  if (!message && !visible) return null;

  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="bg-black/90 border border-cyan-500/50 text-cyan-400 px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.3)] backdrop-blur-md flex items-center gap-4 min-w-[300px]">
        {/* Icon */}
        <div
          className="w-10 h-10 border border-cyan-500/30 flex items-center justify-center bg-cyan-950/30 rounded flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-xl">⚡</span>
        </div>

        {/* Content */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-600">
            Command Executed
          </span>
          <span className="font-mono font-bold text-sm tracking-wide typing-effect truncate">
            {message}
          </span>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="ml-auto text-gray-500 hover:text-cyan-400 transition flex-shrink-0"
          aria-label="Dismiss notification"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Decorative corners */}
        <div
          className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"
          aria-hidden="true"
        />
      </div>
    </div>
  );
});

SystemToast.displayName = 'SystemToast';

export default SystemToast;
