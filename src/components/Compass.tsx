import React, { useEffect, useState, useMemo, memo } from 'react';
import { UI_CONFIG } from '../constants';

// Extended DeviceOrientationEvent for iOS
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

// Cardinal directions
const CARDINAL_DIRECTIONS: Record<number, string> = {
  0: 'N',
  45: 'NE',
  90: 'E',
  135: 'SE',
  180: 'S',
  225: 'SW',
  270: 'W',
  315: 'NW',
};

/**
 * Compass Component
 * Displays device orientation with scrolling compass ruler
 */
const Compass: React.FC = memo(() => {
  const [heading, setHeading] = useState(0);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const iosEvent = event as DeviceOrientationEventiOS;

      if (typeof iosEvent.webkitCompassHeading === 'number') {
        // iOS specific
        setHeading(iosEvent.webkitCompassHeading);
      } else if (event.alpha !== null) {
        // Android/Standard - alpha is 0-360, but we need to invert
        setHeading((360 - event.alpha) % 360);
      }
    };

    // Check if we need to request permission (iOS 13+)
    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          } else {
            setHasPermission(false);
          }
        } catch (error) {
          console.warn('[Compass] Permission request failed:', error);
          setHasPermission(false);
        }
      } else {
        // No permission required
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Calculate pixel offset for scrolling
  const offset = -(heading * UI_CONFIG.COMPASS_PIXELS_PER_DEGREE);

  // Generate compass ticks
  const ticks = useMemo(() => {
    const result: React.JSX.Element[] = [];

    for (let i = 0; i < 360; i += 5) {
      const isMajor = i % 45 === 0;
      const isMid = i % 15 === 0 && !isMajor;
      const label = CARDINAL_DIRECTIONS[i] || '';

      // Generate tick for current position and duplicate for infinite scroll
      [0, 360].forEach(offsetDeg => {
        result.push(
          <div
            key={`${i}-${offsetDeg}`}
            className="absolute top-0 flex flex-col items-center"
            style={{
              left: `${(i + offsetDeg) * UI_CONFIG.COMPASS_PIXELS_PER_DEGREE}px`,
              transform: 'translateX(50vw)',
            }}
          >
            <div
              className={`w-[1px] bg-cyan-400/50 ${
                isMajor ? 'h-4' : isMid ? 'h-2' : 'h-1'
              }`}
            />
            {isMajor && label && (
              <span className="mt-1 text-[10px] font-mono font-bold text-cyan-400 drop-shadow-md">
                {label}
              </span>
            )}
          </div>
        );
      });
    }

    return result;
  }, []);

  if (!hasPermission) {
    return (
      <div className="w-full h-12 flex items-center justify-center">
        <span className="text-xs font-mono text-gray-500">
          Compass unavailable
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-12 overflow-hidden pointer-events-none z-10 select-none mask-fade-sides"
      role="img"
      aria-label={`Compass heading: ${Math.round(heading)} degrees`}
    >
      {/* Center Indicator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500 z-20 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-red-500/20 z-10"
        aria-hidden="true"
      />

      {/* Current Value Display */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-200 bg-black/50 px-1 rounded"
        aria-hidden="true"
      >
        {Math.round(heading)}°
      </div>

      {/* Scrolling Ruler */}
      <div
        className="absolute top-2 left-0 h-full transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `translateX(${offset}px)`,
          width: `${360 * UI_CONFIG.COMPASS_PIXELS_PER_DEGREE * 2}px`,
        }}
        aria-hidden="true"
      >
        {ticks}
      </div>
    </div>
  );
});

Compass.displayName = 'Compass';

export default Compass;
