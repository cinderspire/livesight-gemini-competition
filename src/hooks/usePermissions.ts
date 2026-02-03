import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

export interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  location: boolean;
  allGranted: boolean;
  checking: boolean;
}

/**
 * Permission Management Hook
 * Handles native permission requests for Capacitor apps
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    microphone: false,
    location: false,
    allGranted: false,
    checking: true,
  });

  const isNative = Capacitor.isNativePlatform();

  // Check current permissions
  const checkPermissions = useCallback(async () => {
    setPermissions(prev => ({ ...prev, checking: true }));

    try {
      if (isNative) {
        // Check camera permission (wrap in try/catch to handle errors gracefully)
        let cameraGranted = false;
        try {
          const cameraStatus = await Camera.checkPermissions();
          cameraGranted = cameraStatus.camera === 'granted';
        } catch (e) {
          console.warn('[Permissions] Camera check failed:', e);
          cameraGranted = false;
        }

        // Check location permission (wrap in try/catch - location services might be disabled)
        let locationGranted = false;
        try {
          const locationStatus = await Geolocation.checkPermissions();
          locationGranted = locationStatus.location === 'granted';
        } catch (e) {
          // Location services might be disabled - this is OK, just mark as not granted
          console.warn('[Permissions] Geolocation check failed (services may be disabled):', e);
          locationGranted = false;
        }

        // For microphone, we check via browser API since Capacitor doesn't have direct microphone plugin
        let microphoneGranted = false;
        try {
          const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          microphoneGranted = micStatus.state === 'granted';
        } catch {
          // Fallback: assume not granted
          microphoneGranted = false;
        }

        setPermissions({
          camera: cameraGranted,
          microphone: microphoneGranted,
          location: locationGranted,
          allGranted: cameraGranted && microphoneGranted,
          checking: false,
        });
      } else {
        // Web browser - check via Permissions API
        try {
          const [cameraResult, micResult] = await Promise.all([
            navigator.permissions.query({ name: 'camera' as PermissionName }),
            navigator.permissions.query({ name: 'microphone' as PermissionName }),
          ]);

          const cameraGranted = cameraResult.state === 'granted';
          const microphoneGranted = micResult.state === 'granted';

          setPermissions({
            camera: cameraGranted,
            microphone: microphoneGranted,
            location: false,
            allGranted: cameraGranted && microphoneGranted,
            checking: false,
          });
        } catch {
          // Browser doesn't support permissions API, assume not granted
          setPermissions({
            camera: false,
            microphone: false,
            location: false,
            allGranted: false,
            checking: false,
          });
        }
      }
    } catch (error) {
      console.error('[Permissions] Check failed:', error);
      setPermissions({
        camera: false,
        microphone: false,
        location: false,
        allGranted: false,
        checking: false,
      });
    }
  }, [isNative]);

  // Request all permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (isNative) {
        // Request camera permission via Capacitor
        let cameraGranted = false;
        try {
          const cameraResult = await Camera.requestPermissions({ permissions: ['camera'] });
          cameraGranted = cameraResult.camera === 'granted';
        } catch (e) {
          console.warn('[Permissions] Camera request failed:', e);
          cameraGranted = false;
        }

        // Request location permission via Capacitor (wrap in try/catch - location services might be disabled)
        let locationGranted = false;
        try {
          const locationResult = await Geolocation.requestPermissions();
          locationGranted = locationResult.location === 'granted';
        } catch (e) {
          console.warn('[Permissions] Geolocation request failed (services may be disabled):', e);
          locationGranted = false;
        }

        // Request microphone via browser API (Capacitor doesn't have direct API)
        let microphoneGranted = false;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          microphoneGranted = true;
        } catch {
          microphoneGranted = false;
        }

        setPermissions({
          camera: cameraGranted,
          microphone: microphoneGranted,
          location: locationGranted,
          allGranted: cameraGranted && microphoneGranted,
          checking: false,
        });

        return cameraGranted && microphoneGranted;
      } else {
        // Web browser - request via getUserMedia
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          stream.getTracks().forEach(track => track.stop());

          setPermissions({
            camera: true,
            microphone: true,
            location: false,
            allGranted: true,
            checking: false,
          });

          return true;
        } catch {
          setPermissions({
            camera: false,
            microphone: false,
            location: false,
            allGranted: false,
            checking: false,
          });
          return false;
        }
      }
    } catch (error) {
      console.error('[Permissions] Request failed:', error);
      return false;
    }
  }, [isNative]);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissions,
    requestPermissions,
    checkPermissions,
    isNative,
  };
}

export default usePermissions;
