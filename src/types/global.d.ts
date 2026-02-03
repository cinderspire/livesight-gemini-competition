/**
 * Global Type Declarations
 */

// AI Studio API Types
interface AIStudioAPI {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
  getApiKey?: () => Promise<string>;
}

// Extend Window interface
declare global {
  interface Window {
    aistudio?: AIStudioAPI;
    webkitAudioContext?: typeof AudioContext;
  }
}

// Environment Variables
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY?: string;
    GEMINI_API_KEY?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

// iOS Device Orientation Event Extension
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

export {};
