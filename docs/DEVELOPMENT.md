# Development Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Gemini API Key

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd livesight
npm install
```

### 2. Environment Configuration

Create `.env.local`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/).

### 3. Development Server

```bash
npm run dev
```

Open http://localhost:5173 in Chrome (best WebRTC support).

## Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run type-check` | TypeScript validation |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Prettier formatting |
| `npm run cap:sync` | Sync with Capacitor |
| `npm run android` | Open in Android Studio |
| `npm run android:run` | Build and run on device |

## Code Structure

### Adding a New Hook

```typescript
// src/hooks/useMyHook.ts
import { useCallback, useState } from 'react';

export function useMyHook() {
  const [state, setState] = useState(initialValue);

  const action = useCallback(() => {
    // implementation
  }, []);

  return { state, action };
}

export default useMyHook;
```

### Adding a New Feature Module

```
src/features/my-feature/
├── myFeatureService.ts    # Business logic
├── useMyFeature.ts        # React hook (optional)
├── MyFeatureComponent.tsx # UI component (optional)
└── index.ts               # Exports
```

### Modifying LiveSightService

Key methods:

```typescript
// Start connection
async start(): Promise<void>

// Handle AI responses
private handleServerMessage(message: LiveServerMessage): void

// Detect hazards from transcript
private detectVehicleDanger(text: string): VehicleDangerLevel | null

// Send video frames
private startVideoStreaming(): void

// Send audio
private startAudioStreaming(stream: MediaStream): void
```

## Adding New Haptic Patterns

1. Define pattern in constants:

```typescript
// src/constants/index.ts
export const HAPTIC_PATTERNS = {
  // ... existing patterns
  MY_NEW_PATTERN: [100, 50, 100, 50, 200] as const,
};
```

2. Add to useHaptic hook:

```typescript
// src/hooks/useHaptic.ts
const myNewAlert = useCallback(async () => {
  await Haptics.notification({ type: NotificationType.Warning });
  await vibratePattern([100, 50, 100, 50, 200]);
}, [vibratePattern]);

return {
  // ... existing returns
  myNewAlert,
};
```

## Adding New Voice Commands

1. Add keywords to constants:

```typescript
// src/constants/index.ts
export const COMMAND_KEYWORDS = {
  // ... existing commands
  MY_COMMAND: ['my keyword', 'benim komutum'],
};
```

2. Add to VoiceCommand type:

```typescript
// src/types/index.ts
export type VoiceCommand =
  // ... existing commands
  | 'MY_COMMAND';
```

3. Handle in App.tsx:

```typescript
const handleCommand = (command: VoiceCommand) => {
  switch (command) {
    case 'MY_COMMAND':
      // handle command
      break;
  }
};
```

## Testing on Device

### Android

```bash
# Build and sync
npm run build:mobile

# Open in Android Studio
npm run android

# Or run directly on connected device
npm run android:run
```

### Enable USB Debugging

1. Enable Developer Options on device
2. Enable USB Debugging
3. Connect via USB or WiFi ADB

### Debugging

Chrome DevTools:
1. Open `chrome://inspect` in Chrome
2. Find your device/app
3. Click "Inspect"

Android Studio Logcat:
```bash
adb logcat | grep -i livesight
```

## Common Issues

### Build Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Capacitor Sync Issues

```bash
# Full sync
npx cap sync
npx cap update
```

### Type Errors

```bash
# Check types
npm run type-check

# Fix common issues
npm run lint:fix
```

## Code Style

- TypeScript strict mode
- Functional components with hooks
- Named exports preferred
- Async/await over promises
- Descriptive variable names

## Performance Tips

1. Use `useCallback` for functions passed as props
2. Use `useMemo` for expensive calculations
3. Avoid inline function definitions in JSX
4. Keep component re-renders minimal
5. Profile with React DevTools

## Deployment

### Production Build

```bash
npm run build
npm run cap:sync
```

### Android Release

1. Generate signed APK in Android Studio
2. Or use Gradle:
```bash
cd android
./gradlew assembleRelease
```

---

*Development guide for Gemini-powered LiveSight*
