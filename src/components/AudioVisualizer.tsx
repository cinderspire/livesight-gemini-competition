import React, { memo, useMemo } from 'react';
import { useLiveSight } from '../contexts/LiveSightContext';
import type { AudioVisualizerProps } from '../types';
import { UI_CONFIG } from '../constants';

/**
 * Audio Visualizer Component
 * Displays a reactive waveform based on audio volume
 */
const AudioVisualizer: React.FC<AudioVisualizerProps> = memo(({ isActive }) => {
  const { volume, status, isMicMuted } = useLiveSight();

  // Generate bar heights
  const bars = useMemo(() => {
    return Array.from({ length: UI_CONFIG.VISUALIZER_BAR_COUNT }).map((_, i) => {
      // Calculate sensitivity based on distance from center
      const centerOffset = Math.abs(i - UI_CONFIG.VISUALIZER_BAR_COUNT / 2);
      const sensitivity = 1 - centerOffset * 0.1;

      let height = 10; // minimum height %

      if (isActive && !isMicMuted) {
        // Active: respond to volume with some randomness
        height = 15 + volume * 100 * sensitivity + Math.random() * 10;
        height = Math.min(100, height);
      } else if (status === 'connecting') {
        // Connecting: wave animation
        height = 30 + Math.sin(Date.now() / 200 + i) * 20;
      }

      return { height, index: i };
    });
  }, [isActive, isMicMuted, volume, status]);

  // Determine color class
  const getColorClass = useMemo(() => {
    if (isMicMuted) {
      return 'bg-gray-600';
    }
    if (volume > UI_CONFIG.VOLUME_THRESHOLD_HIGH) {
      return 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]';
    }
    return 'bg-sky-400 shadow-[0_0_4px_rgba(56,189,248,0.4)]';
  }, [isMicMuted, volume]);

  return (
    <div
      className="flex items-center justify-center gap-[3px] h-10 w-full px-4"
      role="img"
      aria-label={
        isMicMuted
          ? 'Microphone muted'
          : isActive
          ? `Audio visualizer showing ${Math.round(volume * 100)}% volume`
          : 'Audio visualizer inactive'
      }
    >
      {bars.map(({ height, index }) => (
        <div
          key={index}
          className={`w-1.5 rounded-full transition-all duration-75 ease-out ${getColorClass}`}
          style={{
            height: `${height}%`,
            opacity: isActive ? 1 : 0.3,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Screen reader status */}
      <span className="sr-only" role="status" aria-live="polite">
        {isMicMuted
          ? 'Microphone is muted'
          : isActive
          ? 'Microphone active'
          : 'Microphone inactive'}
      </span>
    </div>
  );
});

AudioVisualizer.displayName = 'AudioVisualizer';

export default AudioVisualizer;
