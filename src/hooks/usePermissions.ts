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

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    microphone: false,
    location: false,
    allGranted: false,
    checking: true,
  });

  const isNative = Capacitor.isNativePlatform();

  const checkPermissions = useCallback(async () => {
    setPermissions(prev => ({ ...prev, checking: true }));
    try {
      if (isNative) {
        let cameraGranted = false;
        try {
          const s = await Camera.checkPermissions();
          cameraGranted = s.camera === 'granted';
        } catch { /* ignore */ }

        let microphoneGranted = false;
        try {
          const s = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          microphoneGranted = s.state === 'granted';
        } catch { /* ignore */ }

        let locationGranted = false;
        try {
          const s = await Geolocation.checkPermissions();
          locationGranted = s.location === 'granted';
        } catch { /* ignore */ }

        setPermissions({
          camera: cameraGranted,
          microphone: microphoneGranted,
          location: locationGranted,
          allGranted: cameraGranted && microphoneGranted,
          checking: false,
        });
      } else {
        // Web: just check, don't request
        try {
          const [cam, mic] = await Promise.all([
            navigator.permissions.query({ name: 'camera' as PermissionName }),
            navigator.permissions.query({ name: 'microphone' as PermissionName }),
          ]);
          setPermissions({
            camera: cam.state === 'granted',
            microphone: mic.state === 'granted',
            location: false,
            allGranted: cam.state === 'granted' && mic.state === 'granted',
            checking: false,
          });
        } catch {
          setPermissions({ camera: false, microphone: false, location: false, allGranted: false, checking: false });
        }
      }
    } catch {
      setPermissions({ camera: false, microphone: false, location: false, allGranted: false, checking: false });
    }
  }, [isNative]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (isNative) {
        // Step 1: Camera — with delay to avoid dialog collision
        let cameraGranted = false;
        try {
          const r = await Camera.requestPermissions({ permissions: ['camera'] });
          cameraGranted = r.camera === 'granted';
        } catch (e) {
          console.warn('[Permissions] Camera request failed:', e);
        }

        // Small delay between permission dialogs to prevent crash
        await new Promise(r => setTimeout(r, 500));

        // Step 2: Microphone
        let microphoneGranted = false;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
          microphoneGranted = true;
        } catch (e) {
          console.warn('[Permissions] Microphone request failed:', e);
        }

        await new Promise(r => setTimeout(r, 500));

        // Step 3: Location (optional, non-blocking)
        let locationGranted = false;
        try {
          const r = await Geolocation.requestPermissions();
          locationGranted = r.location === 'granted';
        } catch {
          // Location is optional
        }

        const allGranted = cameraGranted && microphoneGranted;
        setPermissions({ camera: cameraGranted, microphone: microphoneGranted, location: locationGranted, allGranted, checking: false });
        return allGranted;
      } else {
        // Web: single getUserMedia triggers both camera + mic dialog
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          stream.getTracks().forEach(t => t.stop());
          setPermissions({ camera: true, microphone: true, location: false, allGranted: true, checking: false });
          return true;
        } catch (e) {
          console.warn('[Permissions] getUserMedia failed:', e);
          // Try camera only
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(t => t.stop());
            setPermissions({ camera: true, microphone: false, location: false, allGranted: false, checking: false });
          } catch {
            setPermissions({ camera: false, microphone: false, location: false, allGranted: false, checking: false });
          }
          return false;
        }
      }
    } catch (e) {
      console.error('[Permissions] Unexpected error:', e);
      return false;
    }
  }, [isNative]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return { permissions, requestPermissions, checkPermissions, isNative };
}

export default usePermissions;
