import { useState, useEffect, useCallback, useRef } from 'react';
import { FALL_DETECTION_CONFIG } from '../constants';

export interface FallDetectionState {
  isFallDetected: boolean;
  isMonitoring: boolean;
  awaitingResponse: boolean;
  checkInCount: number;
}

export interface UseFallDetectionReturn {
  state: FallDetectionState;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  confirmOkay: () => void;
  onFallDetected: (callback: () => void) => void;
  onAutoSOS: (callback: () => void) => void;
}

/**
 * Fall Detection Hook
 * Uses device motion sensors to detect potential falls
 * Triggers alerts and auto-SOS if user doesn't respond
 */
export function useFallDetection(): UseFallDetectionReturn {
  const [state, setState] = useState<FallDetectionState>({
    isFallDetected: false,
    isMonitoring: false,
    awaitingResponse: false,
    checkInCount: 0,
  });

  const fallCallbackRef = useRef<(() => void) | null>(null);
  const sosCallbackRef = useRef<(() => void) | null>(null);
  const checkInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAccelerationRef = useRef<number>(0);
  const stillnessStartRef = useRef<number | null>(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (checkInTimerRef.current) {
      clearTimeout(checkInTimerRef.current);
      checkInTimerRef.current = null;
    }
  }, []);

  // Start check-in process after fall detected
  const startCheckIn = useCallback(() => {
    setState(prev => ({
      ...prev,
      awaitingResponse: true,
      checkInCount: prev.checkInCount + 1,
    }));

    // If max check-ins reached, trigger auto-SOS
    if (state.checkInCount >= FALL_DETECTION_CONFIG.MAX_CHECK_INS) {
      console.log('[FallDetection] Max check-ins reached, triggering SOS');
      sosCallbackRef.current?.();
      setState(prev => ({
        ...prev,
        isFallDetected: false,
        awaitingResponse: false,
        checkInCount: 0,
      }));
      return;
    }

    // Schedule next check-in
    checkInTimerRef.current = setTimeout(() => {
      startCheckIn();
    }, FALL_DETECTION_CONFIG.CHECK_IN_INTERVAL);
  }, [state.checkInCount]);

  // Handle motion event
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    if (!state.isMonitoring || state.awaitingResponse) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    if (x === null || y === null || z === null) return;

    // Calculate total acceleration magnitude
    const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

    // Detect sudden high acceleration (fall)
    const accelerationDelta = Math.abs(totalAcceleration - lastAccelerationRef.current);
    lastAccelerationRef.current = totalAcceleration;

    // Check for fall pattern: high acceleration followed by stillness
    if (accelerationDelta > FALL_DETECTION_CONFIG.FALL_THRESHOLD) {

      stillnessStartRef.current = Date.now();
    }

    // Check for stillness after fall
    if (stillnessStartRef.current) {
      if (totalAcceleration < FALL_DETECTION_CONFIG.STILLNESS_THRESHOLD + 9.8) {
        // Person is still (accounting for gravity ~9.8)
        const stillnessDuration = Date.now() - stillnessStartRef.current;

        if (stillnessDuration > FALL_DETECTION_CONFIG.STILLNESS_DURATION) {
          // Fall confirmed!
          console.log('[FallDetection] Fall detected!');
          setState(prev => ({ ...prev, isFallDetected: true }));
          fallCallbackRef.current?.();
          stillnessStartRef.current = null;
          startCheckIn();
        }
      } else {
        // Person is moving, reset stillness timer
        stillnessStartRef.current = null;
      }
    }
  }, [state.isMonitoring, state.awaitingResponse, startCheckIn]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (typeof DeviceMotionEvent === 'undefined') {
      console.warn('[FallDetection] DeviceMotionEvent not supported');
      return;
    }

    // Request permission on iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
            setState(prev => ({ ...prev, isMonitoring: true }));

          }
        })
        .catch(console.error);
    } else {
      // Non-iOS or older iOS
      window.addEventListener('devicemotion', handleMotion);
      setState(prev => ({ ...prev, isMonitoring: true }));

    }
  }, [handleMotion]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    clearTimers();
    setState({
      isFallDetected: false,
      isMonitoring: false,
      awaitingResponse: false,
      checkInCount: 0,
    });

  }, [handleMotion, clearTimers]);

  // User confirms they're okay
  const confirmOkay = useCallback(() => {
    clearTimers();
    setState(prev => ({
      ...prev,
      isFallDetected: false,
      awaitingResponse: false,
      checkInCount: 0,
    }));

  }, [clearTimers]);

  // Register callbacks
  const onFallDetected = useCallback((callback: () => void) => {
    fallCallbackRef.current = callback;
  }, []);

  const onAutoSOS = useCallback((callback: () => void) => {
    sosCallbackRef.current = callback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      clearTimers();
    };
  }, [handleMotion, clearTimers]);

  return {
    state,
    startMonitoring,
    stopMonitoring,
    confirmOkay,
    onFallDetected,
    onAutoSOS,
  };
}

export default useFallDetection;
