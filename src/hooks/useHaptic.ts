import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Haptic Feedback Hook
 * Uses Capacitor Haptics plugin for native vibration support
 */

interface UseHapticReturn {
  vibrate: (duration?: number) => void;
  hazardAlert: () => void;
  successFeedback: () => void;
  startFeedback: () => void;
  sosAlert: () => void;
  directionCue: (direction: 'left' | 'right' | 'forward' | 'stop') => void;
  // New vehicle danger feedback
  vehicleCritical: () => void;
  vehicleWarning: () => void;
  vehicleAwareness: () => void;
  // Fall detection feedback
  fallDetected: () => void;
  fallCheckIn: () => void;
  isSupported: boolean;
}

/**
 * Custom hook for haptic feedback using Capacitor
 */
export function useHaptic(): UseHapticReturn {
  const isSupported = true; // Capacitor handles this

  // Basic vibration with duration
  const vibrate = useCallback(async (duration: number = 200) => {
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.warn('[Haptic] Vibration failed:', error);
      // Fallback to browser API
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(duration);
      }
    }
  }, []);

  // Helper for sequential vibration pattern
  const vibratePattern = useCallback(async (pattern: number[]) => {
    for (let i = 0; i < pattern.length; i++) {
      const duration = pattern[i] ?? 100;
      if (i % 2 === 0) {
        // Vibrate
        await Haptics.vibrate({ duration });
      } else {
        // Pause
        await new Promise(resolve => setTimeout(resolve, duration));
      }
    }
  }, []);

  const hazardAlert = useCallback(async () => {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
      await vibratePattern([100, 50, 100, 50, 100]);
    } catch (e) {
      console.warn('[Haptic] hazardAlert failed:', e);
    }
  }, [vibratePattern]);

  const successFeedback = useCallback(async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      console.warn('[Haptic] successFeedback failed:', e);
    }
  }, []);

  const startFeedback = useCallback(async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      console.warn('[Haptic] startFeedback failed:', e);
    }
  }, []);

  const sosAlert = useCallback(async () => {
    try {
      // Urgent repeating pattern for SOS
      await Haptics.notification({ type: NotificationType.Error });
      await vibratePattern([300, 100, 300, 100, 300, 200, 500, 200, 500]);
    } catch (e) {
      console.warn('[Haptic] sosAlert failed:', e);
    }
  }, [vibratePattern]);

  const directionCue = useCallback(async (direction: 'left' | 'right' | 'forward' | 'stop') => {
    try {
      switch (direction) {
        case 'left':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'right':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'forward':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'stop':
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } catch (e) {
      console.warn('[Haptic] directionCue failed:', e);
    }
  }, []);

  // Vehicle danger feedback - critical (immediate danger)
  const vehicleCritical = useCallback(async () => {
    try {
      // Very strong alert for critical danger
      await Haptics.notification({ type: NotificationType.Error });
      await vibratePattern([400, 100, 400, 100, 400, 100, 400]);
    } catch (e) {
      console.warn('[Haptic] vehicleCritical failed:', e);
    }
  }, [vibratePattern]);

  // Vehicle danger feedback - warning (approaching)
  const vehicleWarning = useCallback(async () => {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
      await vibratePattern([200, 100, 200, 100, 200]);
    } catch (e) {
      console.warn('[Haptic] vehicleWarning failed:', e);
    }
  }, [vibratePattern]);

  // Vehicle danger feedback - awareness (detected nearby)
  const vehicleAwareness = useCallback(async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      console.warn('[Haptic] vehicleAwareness failed:', e);
    }
  }, []);

  // Fall detected - urgent pattern
  const fallDetected = useCallback(async () => {
    try {
      await Haptics.notification({ type: NotificationType.Error });
      await vibratePattern([500, 200, 500, 200, 500]);
    } catch (e) {
      console.warn('[Haptic] fallDetected failed:', e);
    }
  }, [vibratePattern]);

  // Fall check-in - "Are you okay?" prompt
  const fallCheckIn = useCallback(async () => {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {
      console.warn('[Haptic] fallCheckIn failed:', e);
    }
  }, []);

  return {
    vibrate,
    hazardAlert,
    successFeedback,
    startFeedback,
    sosAlert,
    directionCue,
    vehicleCritical,
    vehicleWarning,
    vehicleAwareness,
    fallDetected,
    fallCheckIn,
    isSupported,
  };
}

export default useHaptic;
