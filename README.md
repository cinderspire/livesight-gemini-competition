# LiveSight - See Beyond Barriers

<div align="center">

**AI-Powered Real-Time Navigation Assistant for the Visually Impaired**

*Built with Google Gemini 3 Flash & Gemini Live API*

[![Gemini 3 Flash](https://img.shields.io/badge/AI-Gemini%203%20Flash-blue.svg)](https://ai.google.dev/gemini-api/docs/models)
[![Live API](https://img.shields.io/badge/API-Gemini%20Live-green.svg)](https://ai.google.dev/gemini-api/docs/live)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android%20%7C%20iOS-orange.svg)](package.json)

</div>

---

## Overview

LiveSight is a **real-time AI navigation assistant** that empowers visually impaired users to explore the world safely and independently. Using **Google Gemini 3 Flash's multimodal Live API with native thinking capabilities**, LiveSight streams live camera video and audio to Gemini, receiving instant spoken responses that guide users through their environment.

This is not just another chatbot. LiveSight is a **life-changing accessibility tool** that acts as "AI Eyes" - continuously analyzing the user's surroundings and proactively warning about dangers, describing environments, reading text, and providing voice-guided navigation.

## Gemini 3 Flash Integration

LiveSight leverages the **Gemini 3 Flash** model and its ecosystem extensively:

### Gemini Live API (Core Engine)
- **Real-time multimodal streaming**: Continuous video frames + audio sent to Gemini for instant analysis
- **Native audio output**: Gemini responds with natural speech, no TTS needed
- **Bidirectional communication**: Users can speak commands while receiving AI guidance
- **Context-aware responses**: System instructions dynamically change based on active feature mode
- **Thinking Budget**: Adaptive `thinkingConfig` per feature mode - higher reasoning for exploration, faster for traffic lights

### How We Use Gemini 3's Capabilities

LiveSight is one of the most demanding real-time applications for Gemini's Live API. Here's how we push the boundaries:

**Multimodal Real-Time Processing**: We stream camera frames at 2-7 FPS (adaptive per mode) alongside continuous microphone audio to Gemini 3 Flash via the Live API. The model analyzes both modalities simultaneously - detecting obstacles in video while processing voice commands in audio. This isn't batch processing; it's continuous, real-time understanding of a dynamic environment.

**Native Thinking for Safety-Critical Decisions**: Gemini 3's thinking capabilities are essential for navigation safety. When a user approaches a complex intersection, the model needs to reason about traffic patterns, pedestrian signals, vehicle trajectories, and safe crossing paths - all within milliseconds. We configure `thinkingConfig` budgets dynamically: traffic mode uses low budgets (512 tokens) for split-second light detection, while explore mode uses high budgets (2048 tokens) for rich scene descriptions.

**Function Calling for Structured Actions**: Rather than relying solely on text parsing, we define 4 Gemini function declarations (`reportObstacle`, `switchMode`, `triggerEmergency`, `announceEnvironment`) that allow the AI to trigger precise app actions. When Gemini detects a vehicle approaching from the left, it calls `reportObstacle` with clock direction, distance, and severity - triggering the exact haptic pattern the user needs.

**Voice-First Interaction**: The Live API's native audio output eliminates TTS latency. Users hear Gemini's voice directly, making the experience feel like having a human guide. The bidirectional audio stream allows natural interruptions - a user can say "what's that on my right?" mid-guidance and receive an immediate contextual response.

### Key Gemini Features Used
| Feature | How It's Used |
|---------|--------------|
| **Multimodal Input** | Live camera frames (JPEG) + microphone audio streamed simultaneously |
| **Native Audio Output** | Gemini generates natural speech responses directly |
| **Thinking Config** | Adaptive reasoning budgets (512-2048 tokens) per feature mode |
| **System Instructions** | Dynamic prompts for 6 different AI modes (Navigation, Traffic, Color, etc.) |
| **Function Calling** | 4 tool declarations enabling AI-to-app structured actions |
| **Real-time Processing** | 2-7 FPS video analysis for obstacle/vehicle/traffic light detection |
| **Voice Commands** | Natural language command detection from user speech transcripts |
| **Context Switching** | Seamless mode changes via `sendClientContent` without reconnection |

## What Makes LiveSight Different

LiveSight stands apart from competitors like Be My Eyes, Seeing AI, and Envision AI:

| Feature | LiveSight | Competitors |
|---------|-----------|-------------|
| **Real-Time Processing** | ✅ Continuous video + audio streaming (2-7 FPS) | ❌ Static image analysis or manual helper calls |
| **Adaptive AI Thinking** | ✅ Gemini 3 thinking budgets per feature mode | ❌ Fixed model responses |
| **Smart Route Suggestions** | ✅ "Turn right 45°, walk 5m" directional guidance | ❌ Only obstacle warnings, no navigation |
| **Context Persistence** | ✅ AI remembers recent detections for smarter responses | ❌ Each query is isolated |
| **Offline Fallback** | ✅ Sensor-based compass navigation when connection lost | ❌ Requires constant internet |
| **Function Calling** | ✅ AI triggers app actions (SOS, mode switch, haptics) | ❌ Text-only responses |
| **Open Source** | ✅ MIT License, free forever | ❌ Proprietary, subscription models |
| **Multi-Feature Modes** | ✅ 6 specialized modes (Navigation, Traffic, Color, etc.) | ❌ Single-purpose or limited modes |

**Key Innovations:**
- **Directional Guidance**: Not just "there's a pole" but "turn right 45 degrees, walk 5 meters to avoid it"
- **Memory**: AI tracks recent detections (last 5 events) for contextual understanding
- **Graceful Degradation**: Falls back to compass/sensor navigation when internet fails
- **Safety-First**: Function calling enables instant haptic alerts and emergency triggers

## Features

### 1. Real-Time AI Navigation
- Continuous camera analysis with spoken guidance
- **Smart route suggestions** with specific directions and distances
- Clock-direction system (12 o'clock = ahead, 3 = right, 9 = left)
- Obstacle detection (stairs, poles, curbs, potholes)
- Weather-aware surface warnings
- **Context-aware responses** - AI remembers recent detections

### 2. Vehicle Danger Detection
- 3-tier alert system: Critical / Warning / Awareness
- Distinct haptic patterns for each danger level
- Proactive voice alerts for approaching vehicles

### 3. Traffic Light Detection
- Real-time traffic light state recognition (Red/Green/Yellow/Flashing)
- Pedestrian signal detection with countdown reading
- HUD overlay showing current state

### 4. Color & Pattern Recognition
- Clothing color identification
- Pattern detection (striped, plaid, floral)
- Outfit matching suggestions

### 5. Expiration Date Reader
- OCR-like date detection on product packaging
- Status classification (Expired / Expiring Soon / Fresh)
- Product identification

### 6. Emergency SOS System
- 3-second hold to activate
- 10-second countdown with cancel option
- Emergency contact notification
- Fall detection with auto-SOS

### 7. Explore Mode
- Detailed environment narration
- Sign and label reading
- Place identification (cafes, pharmacies, bus stops)

### 8. Offline Fallback Mode
- **Sensor-based navigation** when internet connection lost
- Compass heading announcements every 10 seconds
- Cardinal direction guidance (North, East, South, West)
- Graceful degradation - never leaves user stranded
- Auto-switches back to AI mode when connection restored

## Architecture

```
┌─────────────────────────────────────────────┐
│                 LiveSight App               │
├─────────────┬───────────┬───────────────────┤
│  Camera     │  Audio    │  Feature Modes    │
│  Feed       │  I/O      │  (6 modes)        │
├─────────────┴───────────┴───────────────────┤
│           LiveSightService                  │
│  ┌─────────────────────────────────────┐    │
│  │  Gemini 3 Flash Live API            │    │
│  │  - Video frame streaming (JPEG)     │    │
│  │  - Audio streaming (PCM 16-bit)     │    │
│  │  - Adaptive thinking budgets        │    │
│  │  - Response audio playback          │    │
│  │  - Transcript processing            │    │
│  │  - Command detection                │    │
│  │  - Vehicle danger analysis          │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  Feature Services                           │
│  - Traffic Light Parser                     │
│  - Color Detection Parser                   │
│  - Expiration Date Parser                   │
│  - SOS Service                              │
│  - Gamification Engine                      │
├─────────────────────────────────────────────┤
│  Native Capabilities (Capacitor)            │
│  - Haptic Feedback                          │
│  - Fall Detection (Accelerometer)           │
│  - Geolocation                              │
│  - Battery Monitoring                       │
└─────────────────────────────────────────────┘
```

## Tech Stack

| Category | Technology |
|----------|------------|
| **AI Engine** | Google Gemini 3 Flash + Live API |
| **Frontend** | React 19, TypeScript 5.8 |
| **Build** | Vite 6 |
| **Mobile** | Capacitor 8 (Android + iOS) |
| **Audio** | Web Audio API, PCM 16-bit @ 16kHz/24kHz |
| **Haptics** | Capacitor Haptics Plugin |
| **Weather** | Open-Meteo API |
| **UI** | Tailwind CSS, Custom Glassmorphism HUD |

## Quick Start

### Prerequisites
- Node.js 18+
- Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation

```bash
npm install
npm run dev
```

### Environment Setup

Create `.env.local`:
```env
GEMINI_API_KEY=your_api_key_here
```

### Production Build

```bash
npm run build
npm run preview
```

### Mobile Build (Android)

```bash
npm run build:mobile
npm run android
```

## How Gemini Powers LiveSight

1. **User starts the app** - Camera and microphone permissions are requested
2. **Gemini Live API connection** - WebSocket session established with system instructions and thinking config
3. **Continuous streaming** - Video frames (2-7 FPS) and audio sent to Gemini in real-time
4. **AI analysis** - Gemini 3 Flash analyzes the scene with adaptive thinking, detects hazards, generates spoken responses
5. **Audio playback** - Native audio from Gemini played through speakers with 2.5x volume boost
6. **Feature parsing** - AI responses parsed for traffic lights, colors, dates, vehicle dangers
7. **Haptic feedback** - Capacitor vibration patterns triggered for different alert types
8. **Voice commands** - User speech transcribed and matched against command keywords

## Project Structure

```
src/
├── components/      # React UI components (Camera, HUD, Modals)
├── constants/       # App configuration & AI prompts
├── contexts/        # React context for global state
├── features/        # Feature-specific services
│   ├── color-detection/
│   ├── expiration/
│   ├── gamification/
│   ├── obstacle-detection/
│   ├── sos/
│   └── traffic-light/
├── hooks/           # Custom hooks (haptic, permissions, fall detection)
├── services/        # Core services (LiveSight, Weather)
├── types/           # TypeScript definitions
└── utils/           # Audio utilities
```

## Setup & Installation

### Web (Quick Start)

```bash
# 1. Clone the repository
git clone https://github.com/cinderspire/livesight-gemini-competition.git
cd livesight-gemini-competition

# 2. Install dependencies
npm install

# 3. Create environment file
echo GEMINI_API_KEY=your_api_key_here > .env.local

# 4. Start development server
npm run dev
```

Get your free Gemini API key at [Google AI Studio](https://aistudio.google.com/apikey).

### Android (APK Build)

```bash
# 1. Build for production
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open in Android Studio (or build from CLI)
npx cap open android

# CLI build (requires Android SDK):
cd android && ./gradlew assembleDebug
# APK output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Android (Install via ADB)

```bash
# USB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# WiFi (pair first, then connect)
adb pair <device-ip>:<pair-port>    # enter pairing code
adb connect <device-ip>:<connect-port>
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS

```bash
npm run build
npx cap sync ios
npx cap open ios
# Build and run from Xcode
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |

### System Requirements

| Platform | Requirement |
|----------|-------------|
| **Web** | Modern browser with camera & microphone (Chrome, Edge, Firefox) |
| **Android** | Android 7.0+ (API 24), Camera, Microphone, Location |
| **iOS** | iOS 14+, Camera, Microphone, Location |
| **Build** | Node.js 18+, npm 9+ |

## Public Benefit & Open Source

LiveSight is built **for the public good**. This project is completely free and open source - anyone can use, modify, and distribute it for any purpose. We believe AI-powered accessibility tools should be available to everyone, everywhere, without barriers.

### **💯 100% Free - No Strings Attached**

**We claim NO rights, NO ownership, NO royalties on this project.**

- ✅ **Completely FREE** - No subscription, no paywall, no ads, no hidden costs
- ✅ **MIT License** - Use it however you want, commercially or non-commercially
- ✅ **No Attribution Required** - You don't even need to credit us (though it's appreciated!)
- ✅ **No Contributor Agreement** - Your contributions belong to you
- ✅ **No Patents** - We will never patent any part of this technology
- ✅ **No Profit Motive** - Built purely to help people, not to make money
- ✅ **Community-Driven** - Contributions, translations, and forks are encouraged
- ✅ **Public Domain Spirit** - If we could legally place it in public domain, we would

**This is a gift to humanity.** Use it to help people. Improve lives. Make the world more accessible. That's all we ask.

> *"Technology should serve humanity. LiveSight exists to give independence back to those who need it most. We claim no ownership — this belongs to everyone who needs it."*

## License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with Google Gemini 3 Flash**

*Empowering independence through AI innovation*

*LiveSight - See Beyond Barriers*

</div>
