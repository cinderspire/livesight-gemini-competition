import { useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Native Plugins Hook
 * Provides access to native device features via Capacitor
 */

export interface UseNativePluginsReturn {
  isNative: boolean;
  platform: string;
  // Camera
  takePhoto: () => Promise<string | null>;
  // Location
  getCurrentPosition: () => Promise<Position | null>;
  watchPosition: (callback: (position: Position) => void) => Promise<string | null>;
  clearWatch: (watchId: string) => Promise<void>;
  // Haptics
  vibrate: () => Promise<void>;
  vibrateLight: () => Promise<void>;
  vibrateHeavy: () => Promise<void>;
  vibrateWarning: () => Promise<void>;
  vibrateError: () => Promise<void>;
  vibrateSuccess: () => Promise<void>;
  // Share
  shareLocation: (lat: number, lon: number, message?: string) => Promise<void>;
  // Status Bar
  setStatusBarDark: () => Promise<void>;
  setStatusBarLight: () => Promise<void>;
  hideStatusBar: () => Promise<void>;
  showStatusBar: () => Promise<void>;
  // Splash Screen
  hideSplash: () => Promise<void>;
}

export function useNativePlugins(): UseNativePluginsReturn {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  // Hide splash screen on mount
  useEffect(() => {
    if (isNative) {
      SplashScreen.hide().catch(console.warn);
      StatusBar.setStyle({ style: Style.Dark }).catch(console.warn);
      StatusBar.setBackgroundColor({ color: '#000000' }).catch(console.warn);
    }
  }, [isNative]);

  // Camera
  const takePhoto = useCallback(async (): Promise<string | null> => {
    if (!isNative) return null;

    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });
      return image.base64String || null;
    } catch (error) {
      console.warn('[Native] Camera error:', error);
      return null;
    }
  }, [isNative]);

  // Geolocation
  const getCurrentPosition = useCallback(async (): Promise<Position | null> => {
    if (!isNative) return null;

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      return position;
    } catch (error) {
      console.warn('[Native] Geolocation error:', error);
      return null;
    }
  }, [isNative]);

  const watchPosition = useCallback(async (
    callback: (position: Position) => void
  ): Promise<string | null> => {
    if (!isNative) return null;

    try {
      const watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (position, err) => {
          if (position && !err) {
            callback(position);
          }
        }
      );
      return watchId;
    } catch (error) {
      console.warn('[Native] Watch position error:', error);
      return null;
    }
  }, [isNative]);

  const clearWatch = useCallback(async (watchId: string): Promise<void> => {
    if (!isNative) return;

    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      console.warn('[Native] Clear watch error:', error);
    }
  }, [isNative]);

  // Haptics
  const vibrate = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.warn('[Native] Haptics error:', error);
    }
  }, [isNative]);

  const vibrateLight = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.warn('[Native] Haptics error:', error);
    }
  }, [isNative]);

  const vibrateHeavy = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.warn('[Native] Haptics error:', error);
    }
  }, [isNative]);

  const vibrateWarning = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.warn('[Native] Haptics error:', error);
    }
  }, [isNative]);

  const vibrateError = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.warn('[Native] Haptics error:', error);
    }
  }, [isNative]);

  const vibrateSuccess = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.warn('[Native] Haptics error:', error);
    }
  }, [isNative]);

  // Share
  const shareLocation = useCallback(async (
    lat: number,
    lon: number,
    message?: string
  ): Promise<void> => {
    if (!isNative) return;

    try {
      const mapsUrl = `https://maps.google.com/?q=${lat},${lon}`;
      await Share.share({
        title: 'LiveSight Location',
        text: message || `My location: ${mapsUrl}`,
        url: mapsUrl,
        dialogTitle: 'Share Location',
      });
    } catch (error) {
      console.warn('[Native] Share error:', error);
    }
  }, [isNative]);

  // Status Bar
  const setStatusBarDark = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (error) {
      console.warn('[Native] StatusBar error:', error);
    }
  }, [isNative]);

  const setStatusBarLight = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await StatusBar.setStyle({ style: Style.Light });
    } catch (error) {
      console.warn('[Native] StatusBar error:', error);
    }
  }, [isNative]);

  const hideStatusBar = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await StatusBar.hide();
    } catch (error) {
      console.warn('[Native] StatusBar error:', error);
    }
  }, [isNative]);

  const showStatusBar = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await StatusBar.show();
    } catch (error) {
      console.warn('[Native] StatusBar error:', error);
    }
  }, [isNative]);

  // Splash Screen
  const hideSplash = useCallback(async (): Promise<void> => {
    if (!isNative) return;
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.warn('[Native] SplashScreen error:', error);
    }
  }, [isNative]);

  return {
    isNative,
    platform,
    takePhoto,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    vibrate,
    vibrateLight,
    vibrateHeavy,
    vibrateWarning,
    vibrateError,
    vibrateSuccess,
    shareLocation,
    setStatusBarDark,
    setStatusBarLight,
    hideStatusBar,
    showStatusBar,
    hideSplash,
  };
}

export default useNativePlugins;
