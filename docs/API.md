# API Documentation

## Gemini Live API Integration

### Connection Setup

```typescript
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: 'YOUR_API_KEY',
  apiVersion: 'v1alpha'  // Required for Live API
});

const session = await ai.live.connect({
  model: 'gemini-2.0-flash-exp',
  config: {
    systemInstruction: '...',
    responseModalities: [Modality.AUDIO],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Kore' }
      }
    }
  },
  callbacks: {
    onopen: () => console.log('Connected'),
    onmessage: (msg) => handleMessage(msg),
    onclose: (e) => handleClose(e),
    onerror: (e) => handleError(e)
  }
});
```

### Sending Audio

```typescript
// PCM 16-bit audio at 16kHz
session.sendRealtimeInput({
  audio: {
    data: base64AudioData,
    mimeType: 'audio/pcm;rate=16000'
  }
});
```

### Sending Video

```typescript
// JPEG image frames
session.sendRealtimeInput({
  media: {
    mimeType: 'image/jpeg',
    data: base64ImageData
  }
});
```

### Receiving Messages

```typescript
interface LiveServerMessage {
  serverContent?: {
    modelTurn?: {
      parts?: Array<{
        inlineData?: {
          data: string;  // Base64 audio
          mimeType: string;
        }
      }>
    };
    outputTranscription?: {
      text: string;  // AI response text
    };
    inputTranscription?: {
      text: string;  // User speech text
    };
  };
}
```

---

## Internal APIs

### LiveSightService

```typescript
class LiveSightService {
  constructor(
    apiKey: string,
    videoElement: HTMLVideoElement,
    settings: UserSettings,
    weather: WeatherContext,
    callbacks: LiveSightCallbacks
  );

  // Start the service
  async start(): Promise<void>;

  // Stop the service
  stop(): void;

  // Mute/unmute microphone
  setMute(muted: boolean): void;

  // Update settings
  async updateSettings(newSettings: UserSettings): Promise<void>;

  // Update weather context
  async updateWeather(newWeather: WeatherContext): Promise<void>;
}
```

### Callbacks Interface

```typescript
interface LiveSightCallbacks {
  // Called when AI speaks or transcribes
  onTranscript: (text: string, isUser: boolean) => void;

  // Called on connection status change
  onStatusChange: (status: ConnectionStatus) => void;

  // Called when hazard detected
  onHazard: (text: string) => void;

  // Called with audio volume level
  onVolume: (level: number) => void;

  // Called when voice command detected
  onCommand: (command: VoiceCommand) => void;

  // Called on vehicle danger detection
  onVehicleDanger?: (level: VehicleDangerLevel, description: string) => void;

  // Called on fall detection
  onFallDetected?: () => void;
}
```

---

## Hooks API

### useHaptic

```typescript
const {
  vibrate,           // (duration?: number) => void
  hazardAlert,       // () => void
  successFeedback,   // () => void
  startFeedback,     // () => void
  sosAlert,          // () => void
  directionCue,      // (direction: 'left' | 'right' | 'forward' | 'stop') => void
  vehicleCritical,   // () => void
  vehicleWarning,    // () => void
  vehicleAwareness,  // () => void
  fallDetected,      // () => void
  fallCheckIn,       // () => void
  isSupported        // boolean
} = useHaptic();
```

### useFallDetection

```typescript
const {
  state: {
    isFallDetected: boolean;
    isMonitoring: boolean;
    awaitingResponse: boolean;
    checkInCount: number;
  },
  startMonitoring,   // () => void
  stopMonitoring,    // () => void
  confirmOkay,       // () => void
  onFallDetected,    // (callback: () => void) => void
  onAutoSOS          // (callback: () => void) => void
} = useFallDetection();
```

### usePermissions

```typescript
const {
  permissions: {
    camera: boolean;
    microphone: boolean;
    location: boolean;
    allGranted: boolean;
    checking: boolean;
  },
  requestPermissions,  // () => Promise<boolean>
  checkPermissions,    // () => Promise<void>
  isNative            // boolean
} = usePermissions();
```

### useNativePlugins

```typescript
const {
  isNative,           // boolean
  platform,           // string
  takePhoto,          // () => Promise<string | null>
  getCurrentPosition, // () => Promise<Position | null>
  watchPosition,      // (callback) => Promise<string | null>
  clearWatch,         // (watchId: string) => Promise<void>
  vibrate,            // () => Promise<void>
  vibrateWarning,     // () => Promise<void>
  vibrateError,       // () => Promise<void>
  shareLocation,      // (lat, lon, message?) => Promise<void>
  setStatusBarDark,   // () => Promise<void>
  hideSplash          // () => Promise<void>
} = useNativePlugins();
```

---

## Types Reference

### UserSettings

```typescript
interface UserSettings {
  mobilityAid: 'none' | 'cane' | 'guide_dog' | 'wheelchair';
  voiceSpeed: 'slow' | 'normal' | 'fast';
  contrastMode: 'high' | 'normal';
  proactiveMode: boolean;
  voiceType: 'male' | 'female' | 'neutral';
  language: 'en' | 'tr' | 'es' | 'de' | 'fr' | 'ar' | 'zh' | 'ja';
  hapticFeedback: boolean;
  spatialAudio: boolean;
  offlineMode: boolean;
  autoSOS: boolean;
  batteryAlert: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
}
```

### ConnectionStatus

```typescript
type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'offline';
```

### VehicleDangerLevel

```typescript
type VehicleDangerLevel = 'critical' | 'warning' | 'awareness';
```

### VoiceCommand

```typescript
type VoiceCommand =
  | 'OPEN_SETTINGS'
  | 'CLOSE_SETTINGS'
  | 'MUTE'
  | 'UNMUTE'
  | 'MODE_PROACTIVE'
  | 'MODE_PASSIVE'
  | 'SEND_SOS'
  | 'CANCEL_SOS'
  // ... more commands
```

---

## Constants Reference

### Audio Configuration

```typescript
AUDIO_CONFIG = {
  INPUT_SAMPLE_RATE: 16000,   // Hz
  OUTPUT_SAMPLE_RATE: 24000,  // Hz
  BUFFER_SIZE: 2048,          // Fast processing
  CHANNELS: 1
}
```

### Video Configuration

```typescript
VIDEO_CONFIG = {
  FPS: 4,                     // Better perception
  WIDTH: 800,                 // Higher resolution
  HEIGHT: 450,                // Higher resolution
  JPEG_QUALITY: 0.7           // Better quality
}
```

### AI Configuration

```typescript
AI_CONFIG = {
  MODEL_NAME: 'gemini-2.0-flash-exp',
  VOICE_NAME: 'Kore',
  API_VERSION: 'v1alpha'
}
```

---

*API documentation for Gemini-powered LiveSight*
