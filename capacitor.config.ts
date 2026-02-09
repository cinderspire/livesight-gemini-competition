import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.livesight.app',
  appName: 'LiveSight',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: true,
      spinnerColor: '#22D3EE',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
    Camera: {
      // Camera permissions are required
    },
    Geolocation: {
      // Location permissions are required
    },
    Haptics: {
      // Haptic feedback
    },
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#000000',
  },
  ios: {
    backgroundColor: '#000000',
    contentInset: 'always',
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
  },
};

export default config;
