# Known Issues & Solutions

## Active Issues

### 1. Slow Connection Time

**Problem**: Connection takes 2-4 seconds

**Root Cause**:
- Audio context initialization is sequential
- Microphone permission request adds delay
- Gemini API WebSocket handshake time

**Current Mitigations** (v1.2.1):
```typescript
// Parallel initialization
const [, , audioStream] = await Promise.all([
  inputAudioContext.resume(),
  outputAudioContext.resume(),
  navigator.mediaDevices.getUserMedia({ audio: true })
]);

// Fast connection settings
CONNECTION_TIMEOUT: 12000  // 12 seconds
RECONNECT_DELAY: 1000      // 1 second
MAX_RECONNECT_ATTEMPTS: 5  // More retries
```

**Status**: Improved - connection now 1-2 seconds faster

---

### 2. Insufficient Perception / Understanding

**Problem**: AI sometimes misunderstands or gives irrelevant responses

**Root Cause**:
- Video quality was reduced for bandwidth
- Low FPS sent to API
- System prompt not specific enough

**Current Mitigations** (v1.2.1):
```typescript
// Improved video quality
FPS: 4              // Was 2
WIDTH: 800          // Was 640
HEIGHT: 450         // Was 360
JPEG_QUALITY: 0.7   // Was 0.5

// Better system instruction with priority order:
// 1. TEHLİKE (Danger) - vehicles, bikes
// 2. ENGEL (Obstacles) - stairs, holes
// 3. YOL (Path) - clear or blocked
// 4. ÇEVRE (Environment) - people, doors
```

**Status**: Improved - better perception with higher quality frames

---

### 3. Limited User Control

**Problem**: User has few ways to control AI behavior

**Current Controls**:
- Proactive/Reactive mode toggle
- Microphone mute
- Settings panel

**Planned Solutions**:
- [ ] "Tekrar söyle" (repeat) command
- [ ] "Daha detaylı" (more detail) command
- [ ] "Sessiz" (quiet) command
- [ ] Adjustable verbosity levels
- [ ] Custom alert thresholds

---

### 4. Connection Drops

**Problem**: Connection occasionally drops and requires reconnect

**Root Cause**:
- Network instability
- Gemini API session limits
- Mobile network transitions

**Current Mitigations**:
```typescript
// Auto-reconnect (v1.2.0)
maxReconnectAttempts: 3
reconnectDelay: 2000ms
```

**Planned Solutions**:
- [ ] Detect network quality before connecting
- [ ] Graceful degradation (audio-only mode)
- [ ] Session persistence across network changes

---

### 5. Audio Playback Issues

**Problem**: Occasional audio crackling or gaps

**Root Cause**:
- ScriptProcessorNode is deprecated
- Buffer underruns on slow devices
- Audio context state management

**Planned Solutions**:
- [ ] Migrate to AudioWorklet API
- [ ] Implement audio buffering queue
- [ ] Better audio context lifecycle management

---

## Resolved Issues

### ✅ Haptic Feedback Not Working (Fixed v1.2.0)

**Problem**: Vibration not working on mobile

**Solution**: Switched from `navigator.vibrate()` to Capacitor Haptics plugin
```typescript
// Before (broken)
navigator.vibrate(200);

// After (working)
import { Haptics } from '@capacitor/haptics';
await Haptics.vibrate({ duration: 200 });
```

---

### ✅ Duplicate Connections (Fixed v1.2.0)

**Problem**: Two AI sessions running simultaneously

**Solution**: Added connection guards
```typescript
const isStartingRef = useRef(false);

if (isLive || isStartingRef.current || serviceRef.current) {
  return; // Prevent duplicate
}
isStartingRef.current = true;
```

---

### ✅ App Stopping Automatically (Fixed v1.2.0)

**Problem**: App would stop after network hiccup

**Solution**: Implemented auto-reconnect
```typescript
if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
  reconnectAttempts++;
  setTimeout(() => reconnect(), 2000);
}
```

---

## Workarounds

### Slow Connection Workaround

If connection is slow:
1. Ensure good WiFi/mobile signal
2. Close other apps using internet
3. Restart the app
4. Check API key validity

### Understanding Issues Workaround

If AI doesn't understand:
1. Speak clearly and slowly
2. Use simple Turkish phrases
3. Point camera directly at object
4. Try in proactive mode first

### Control Issues Workaround

For more control:
1. Use mute button during AI speech
2. Toggle proactive/reactive as needed
3. Tap screen to get AI attention

---

## Reporting Issues

When reporting issues, include:
1. Device model
2. Android/iOS version
3. App version (1.2.0)
4. Steps to reproduce
5. Expected vs actual behavior

---

*Issue tracking for Gemini-powered LiveSight*
