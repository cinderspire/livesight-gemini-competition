# LiveSight Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        LIVESIGHT APP                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Camera    │  │  Microphone │  │    Device Sensors       │  │
│  │   Feed      │  │   Input     │  │  (Accelerometer/Gyro)   │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│         ▼                ▼                      ▼                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   REACT APPLICATION                          ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐││
│  │  │   App.tsx   │ │  Components │ │         Hooks           │││
│  │  │  (Main UI)  │ │  (CameraFeed│ │  - useHaptic           │││
│  │  │             │ │   Settings) │ │  - useFallDetection    │││
│  │  └──────┬──────┘ └─────────────┘ │  - usePermissions      │││
│  │         │                        │  - useNativePlugins    │││
│  │         ▼                        └─────────────────────────┘││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │              LiveSightService                           │││
│  │  │  - Audio streaming (PCM 16-bit @ 16kHz)                │││
│  │  │  - Video streaming (JPEG @ 2 FPS)                      │││
│  │  │  - Command detection                                    │││
│  │  │  - Hazard detection                                     │││
│  │  │  - Auto-reconnect (3 attempts)                         │││
│  │  └──────────────────────┬──────────────────────────────────┘││
│  └─────────────────────────┼────────────────────────────────────┘│
│                            │                                     │
│  ┌─────────────────────────┼────────────────────────────────────┐│
│  │      CAPACITOR NATIVE BRIDGE                                 ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐││
│  │  │ Camera  │ │ Haptics │ │ GeoLoc  │ │  Share  │ │StatusBar│││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE GEMINI LIVE API                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Model: gemini-2.5-flash-native-audio-preview                ││
│  │  API Version: v1alpha                                        ││
│  │  Modalities: AUDIO (bidirectional)                          ││
│  │  Voice: Configurable (Kore/Puck/Aoede)                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Audio Pipeline

```
Microphone → AudioContext (16kHz) → ScriptProcessor → PCM Blob → Gemini
                                                                    │
Speaker ← AudioContext (24kHz) ← decodeAudioData ← Base64 Audio ←──┘
```

### 2. Video Pipeline

```
Camera → <video> element → Canvas (640x360) → JPEG (50%) → Base64 → Gemini
                                    ↓
                              2 FPS interval
```

### 3. Hazard Detection Pipeline

```
Gemini Response → Transcript Parser → Keyword Matcher → Callback
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
              Vehicle Keywords          Obstacle Keywords         Urgent Keywords
              (araba, otobüs...)       (merdiven, çukur...)      (dur, dikkat...)
                    │                         │                         │
                    ▼                         ▼                         ▼
              onVehicleDanger            onHazard                  onHazard
                    │                         │                         │
                    ▼                         ▼                         ▼
              Haptic Alert              Haptic Alert              Voice Alert
```

## Module Structure

### Core Services

| Module | Responsibility |
|--------|---------------|
| `liveSightService.ts` | Gemini API connection, streaming |
| `weatherService.ts` | Weather context for surface conditions |
| `audioUtils.ts` | PCM encoding/decoding |

### React Hooks

| Hook | Purpose |
|------|---------|
| `useHaptic` | Native vibration patterns |
| `useFallDetection` | Accelerometer-based fall detection |
| `usePermissions` | Camera, mic, location permissions |
| `useNativePlugins` | Capacitor plugin access (optional) |

### Feature Modules

| Feature | Location | Status |
|---------|----------|--------|
| Obstacle Detection | `features/obstacle-detection/` | Active |
| Traffic Light | `features/traffic-light/` | Active |
| Color Detection | `features/color-detection/` | Active |
| Expiration Reader | `features/expiration/` | Active |
| SOS System | `features/sos/` | Active |
| Gamification | `features/gamification/` | Active |

## State Management

```typescript
// App-level state
interface AppState {
  isLive: boolean;
  status: ConnectionStatus;
  transcript: string;
  settings: UserSettings;
  logs: HazardLog[];
  isMicMuted: boolean;
  volume: number;
}

// Connection status flow
disconnected → connecting → connected → (error | disconnected)
                    ↑                          │
                    └──────── reconnect ───────┘
```

## Configuration Constants

```typescript
// Audio
INPUT_SAMPLE_RATE: 16000    // Microphone
OUTPUT_SAMPLE_RATE: 24000   // Speaker
BUFFER_SIZE: 2048           // Fast processing

// Video
FPS: 4                      // Frames per second (improved)
WIDTH: 800                  // Frame width (higher)
HEIGHT: 450                 // Frame height (higher)
JPEG_QUALITY: 0.7           // Better quality

// Connection
CONNECTION_TIMEOUT: 12000   // 12 seconds (fast)
RECONNECT_DELAY: 1000       // 1 second between retries
MAX_RECONNECT_ATTEMPTS: 5   // More attempts

// Fall Detection
FALL_THRESHOLD: 25          // m/s² acceleration
STILLNESS_DURATION: 3000    // 3 seconds
MAX_CHECK_INS: 3           // Before auto-SOS
```

## Error Handling

```
Error Type              → Handler              → User Feedback
─────────────────────────────────────────────────────────────
Connection Timeout      → stop() + retry       → "Bağlantı zaman aşımı"
API Key Invalid         → stop()               → "API anahtarını kontrol edin"
Mic Permission Denied   → stop()               → "Mikrofon izni gerekli"
Network Error           → reconnect()          → "Yeniden bağlanılıyor..."
Session Closed          → reconnect()          → "Bağlantı koptu"
```

## Security Considerations

1. **API Key**: Stored in `.env.local`, never committed
2. **Permissions**: Requested only when needed
3. **Data**: No server-side storage, real-time only
4. **Location**: Shared only on explicit user action

---

*Architecture designed for Gemini Live API integration*
