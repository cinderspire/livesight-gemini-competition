import React, { memo } from 'react';
import { useLiveSight } from '../contexts/LiveSightContext';

/**
 * Status Bar Component
 * Shows battery, network, and other system status indicators
 */
const StatusBar: React.FC = memo(() => {
  const { batteryLevel, isOffline, status, settings } = useLiveSight();

  // Battery color based on level
  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-emerald-400';
    if (batteryLevel > 25) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Offline indicator */}
      {isOffline && (
        <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829" />
          </svg>
          <span className="text-amber-400 text-[10px] font-medium">OFFLINE</span>
        </div>
      )}

      {/* Offline mode enabled */}
      {settings.offlineMode && !isOffline && (
        <div className="flex items-center gap-1 px-2 py-1 bg-sky-500/10 rounded-lg border border-sky-500/20">
          <svg className="w-3 h-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          <span className="text-sky-400 text-[10px] font-medium">CACHED</span>
        </div>
      )}

      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            status === 'connected'
              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
              : status === 'connecting'
              ? 'bg-amber-400 animate-pulse'
              : status === 'error'
              ? 'bg-rose-400'
              : 'bg-gray-600'
          }`}
        />
        <span className="text-gray-500 text-[10px] uppercase font-medium">
          {status}
        </span>
      </div>

      {/* Battery indicator */}
      <div className={`flex items-center gap-1 ${getBatteryColor()}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="2" y="7" width="18" height="10" rx="2" />
          <rect x="22" y="10" width="1" height="4" rx="0.5" fill="currentColor" />
          <rect x="4" y="9" width={Math.max(1, Math.round(batteryLevel / 100 * 14))} height="6" rx="1" fill="currentColor" opacity="0.6" />
        </svg>
        <span className="text-[10px] font-medium">{batteryLevel}%</span>
      </div>

      {/* Low battery warning */}
      {batteryLevel <= 20 && settings.batteryAlert && (
        <div className="flex items-center gap-1 px-2 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20 animate-pulse">
          <span className="text-rose-400 text-[10px] font-medium">LOW</span>
        </div>
      )}
    </div>
  );
});

StatusBar.displayName = 'StatusBar';

export default StatusBar;
