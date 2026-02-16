/**
 * Ad Service for LiveSight
 * - Mobile: AdMob interstitial via @capacitor-community/admob (if installed)
 * - Web: Simple modal interstitial
 * - RULES: Never during live navigation, never during SOS, only on session stop
 */

import { Capacitor } from '@capacitor/core';

// Test ad unit IDs (replace with real ones for production)
const ADMOB_INTERSTITIAL_ID = Capacitor.getPlatform() === 'android'
  ? 'ca-app-pub-3940256099942544/1033173712' // Android test
  : 'ca-app-pub-3940256099942544/4411468910'; // iOS test

let admobLoaded = false;
let admobInitialized = false;
let webInterstitialReady = false;

// Dynamic import helper for AdMob (may not be installed)
// Use a variable to prevent TypeScript from trying to resolve the module at compile time
const ADMOB_MODULE = '@capacitor-community/admob';
type AdMobApi = { initialize: (opts: unknown) => Promise<void>; prepareInterstitial: (opts: unknown) => Promise<void>; showInterstitial: () => Promise<void> };
async function getAdMob(): Promise<AdMobApi | null> {
  try {
    const mod = await import(/* @vite-ignore */ ADMOB_MODULE);
    return (mod as { AdMob?: AdMobApi })?.AdMob || null;
  } catch {
    return null;
  }
}

/**
 * Initialize the ad service
 */
export async function initialize(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      const AdMob = await getAdMob();
      if (!AdMob) return;
      await AdMob.initialize({ initializeForTesting: true });
      admobInitialized = true;
      await prepareInterstitial();
    } catch (err) {
      console.warn('[AdService] AdMob init failed:', err);
    }
  } else {
    webInterstitialReady = true;
  }
}

/**
 * Prepare the next interstitial ad (mobile only)
 */
export async function prepareInterstitial(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !admobInitialized) return;

  try {
    const AdMob = await getAdMob();
    if (!AdMob) return;
    await AdMob.prepareInterstitial({
      adId: ADMOB_INTERSTITIAL_ID,
      isTesting: true,
    });
    admobLoaded = true;
  } catch (err) {
    console.warn('[AdService] Failed to prepare interstitial:', err);
    admobLoaded = false;
  }
}

/**
 * Show interstitial ad after session ends
 */
export async function showInterstitial(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    if (!admobLoaded || !admobInitialized) return false;
    try {
      const AdMob = await getAdMob();
      if (!AdMob) return false;
      await AdMob.showInterstitial();
      admobLoaded = false;
      prepareInterstitial();
      return true;
    } catch (err) {
      console.warn('[AdService] Failed to show interstitial:', err);
      return false;
    }
  }

  return webInterstitialReady;
}

/**
 * Check if running on native platform
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
