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
        // Step 1: Request camera via Capacitor (triggers native Android dialog)
        let cameraGranted = false;
        try {
          const r = await Camera.requestPermissions({ permissions: ['camera'] });
          cameraGranted = r.camera === 'granted';
        } catch { /* ignore */ }

        // Step 2: Request microphone via getUserMedia (triggers native Android dialog)
        let microphoneGranted = false;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
          microphoneGranted = true;
        } catch { /* ignore */ }

        // Step 3: Request location via Capacitor (non-blocking, ok if denied)
        let locationGranted = false;
        try {
          const r = await Geolocation.requestPermissions();
          locationGranted = r.location === 'granted';
        } catch { /* ignore */ }

        const allGranted = cameraGranted && microphoneGranted;
        setPermissions({ camera: cameraGranted, microphone: microphoneGranted, location: locationGranted, allGranted, checking: false });
        return allGranted;
      } else {
        // Web: single getUserMedia call triggers both camera + mic
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          stream.getTracks().forEach(t => t.stop());
          setPermissions({ camera: true, microphone: true, location: false, allGranted: true, checking: false });
          return true;
        } catch {
          setPermissions({ camera: false, microphone: false, location: false, allGranted: false, checking: false });
          return false;
        }
      }
    } catch {
      return false;
    }
  }, [isNative]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return { permissions, requestPermissions, checkPermissions, isNative };
}

export default usePermissions;
