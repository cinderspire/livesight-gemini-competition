import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { useLiveSight } from '../contexts/LiveSightContext';
import { useHaptic } from '../hooks/useHaptic';
import { SOS_CONFIG } from '../constants';
import type { SOSEvent } from '../types';

interface SOSButtonProps {
  onTrigger: (event: SOSEvent) => void;
  isActive: boolean;
}

/**
 * Emergency SOS Button Component
 * Hold to activate, with countdown and cancel options
 */
const SOSButton: React.FC<SOSButtonProps> = memo(({ onTrigger, isActive }) => {
  const { location, emergencyContacts, batteryLevel } = useLiveSight();
  const { hazardAlert, sosAlert } = useHaptic();

  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sosTriggered, setSosTriggered] = useState(false);

  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef<number>(0);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // Start hold detection
  const handleHoldStart = useCallback(() => {
    if (sosTriggered) return;

    setIsHolding(true);
    holdStartRef.current = Date.now();
    hazardAlert();

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min((elapsed / SOS_CONFIG.HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        clearTimers();
        setIsHolding(false);
        setHoldProgress(0);
        startCountdown();
      }
    }, 50);
  }, [sosTriggered, hazardAlert, clearTimers]);

  // End hold detection
  const handleHoldEnd = useCallback(() => {
    if (isHolding && !countdown) {
      clearTimers();
      setIsHolding(false);
      setHoldProgress(0);
    }
  }, [isHolding, countdown, clearTimers]);

  // Start countdown before sending SOS
  const startCountdown = useCallback(() => {
    setCountdown(Math.ceil(SOS_CONFIG.COUNTDOWN_DURATION / 1000));
    sosAlert();

    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearTimers();
          triggerSOS();
          return null;
        }
        sosAlert();
        return prev - 1;
      });
    }, 1000);
  }, [sosAlert, clearTimers]);

  // Trigger the SOS event
  const triggerSOS = useCallback(() => {
    setSosTriggered(true);

    const sosEvent: SOSEvent = {
      id: `sos-${Date.now()}`,
      timestamp: Date.now(),
      location: location || { lat: 0, lon: 0 },
      batteryLevel,
      status: 'active',
      contacts: emergencyContacts.map(c => c.id),
      message: 'Emergency SOS triggered via LiveSight app',
    };

    onTrigger(sosEvent);
  }, [location, batteryLevel, emergencyContacts, onTrigger]);

  // Cancel SOS during countdown
  const cancelSOS = useCallback(() => {
    clearTimers();
    setCountdown(null);
    setIsHolding(false);
    setHoldProgress(0);
  }, [clearTimers]);

  // Reset SOS after resolution
  const resetSOS = useCallback(() => {
    setSosTriggered(false);
    setCountdown(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // If SOS is active, show cancel/resolved UI
  if (sosTriggered) {
    return (
      <div className="fixed inset-0 z-50 bg-red-900/95 flex flex-col items-center justify-center p-6">
        <div className="animate-pulse mb-8">
          <div className="w-32 h-32 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.8)]">
            <span className="text-6xl" aria-hidden="true">!</span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white mb-4 tracking-wider">
          SOS ACTIVE
        </h1>

        <p className="text-red-200 text-center mb-8 max-w-xs">
          Emergency contacts have been notified with your location.
        </p>

        <div className="space-y-4 w-full max-w-xs">
          <button
            onClick={resetSOS}
            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition"
            aria-label="Mark as resolved"
          >
            I'M SAFE - CANCEL ALERT
          </button>
        </div>
      </div>
    );
  }

  // Countdown UI
  if (countdown !== null) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6">
        <div className="mb-8">
          <div className="w-40 h-40 rounded-full border-4 border-red-500 flex items-center justify-center relative">
            <span className="text-7xl font-black text-red-500">{countdown}</span>
            <div
              className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-30"
              aria-hidden="true"
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          SENDING SOS IN {countdown}...
        </h2>

        <p className="text-gray-400 text-center mb-8">
          Tap cancel if this was a mistake
        </p>

        <button
          onClick={cancelSOS}
          className="px-12 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition border border-gray-600"
          aria-label="Cancel SOS"
        >
          CANCEL
        </button>
      </div>
    );
  }

  // Regular SOS button
  return (
    <button
      onMouseDown={handleHoldStart}
      onMouseUp={handleHoldEnd}
      onMouseLeave={handleHoldEnd}
      onTouchStart={handleHoldStart}
      onTouchEnd={handleHoldEnd}
      disabled={!isActive}
      className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
        isHolding
          ? 'bg-red-600 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.8)]'
          : 'bg-red-600/20 border-2 border-red-500 hover:bg-red-600/40'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
      aria-label="Hold for Emergency SOS"
    >
      {/* Progress ring */}
      {isHolding && (
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
            stroke="rgba(239,68,68,0.3)"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#ef4444"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${holdProgress * 2.89} 289`}
          />
        </svg>
      )}

      <span className="text-red-500 font-black text-lg z-10">SOS</span>
    </button>
  );
});

SOSButton.displayName = 'SOSButton';

export default SOSButton;
