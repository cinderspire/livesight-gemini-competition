import React, { memo } from 'react';
import { useLiveSight } from '../contexts/LiveSightContext';

/**
 * Status Bar Component
 * Shows battery, network, and other system status indicators
 */
const StatusBar: React.FC = memo(() => {
  const { batteryLevel, isOffline, status, settings } = useLiveSight();

  // Battery icon based on level
  const getBatteryIcon = () => {
    if (batteryLevel > 50) return '🔋';
    return '🪫';
  };

  // Battery color based on level
  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-green-400';
    if (batteryLevel > 25) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      {/* Offline indicator */}
      {isOffline && (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-lg">
          <span className="text-yellow-400">📴</span>
          <span className="text-yellow-400">OFFLINE</span>
        </div>
      )}

      {/* Offline mode enabled */}
      {settings.offlineMode && !isOffline && (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-lg">
          <span className="text-blue-400">💾</span>
          <span className="text-blue-400 text-[10px]">CACHED</span>
        </div>
      )}

      {/* Connection status */}
      <div className="flex items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'connected'
              ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]'
              : status === 'connecting'
              ? 'bg-yellow-400 animate-pulse'
              : status === 'error'
              ? 'bg-red-400'
              : 'bg-gray-600'
          }`}
        />
        <span className="text-gray-500 text-[10px] uppercase">
          {status}
        </span>
      </div>

      {/* Battery indicator */}
      <div className={`flex items-center gap-1 ${getBatteryColor()}`}>
        <span>{getBatteryIcon()}</span>
        <span className="text-[10px]">{batteryLevel}%</span>
      </div>

      {/* Low battery warning */}
      {batteryLevel <= 20 && settings.batteryAlert && (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-lg animate-pulse">
          <span className="text-red-400 text-[10px]">LOW BATTERY</span>
        </div>
      )}
    </div>
  );
});

StatusBar.displayName = 'StatusBar';

export default StatusBar;
