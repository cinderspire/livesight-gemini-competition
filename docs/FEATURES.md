# LiveSight Features

## Core Features

### 1. Real-Time Scene Description

**Technology**: Gemini 2.0 Flash Live API

The AI continuously analyzes camera frames and describes the environment:

```
User sees → Camera captures → Gemini analyzes → Voice describes
```

**Capabilities**:
- Object identification (people, vehicles, furniture)
- Distance estimation in meters
- Direction using simple terms (sağ, sol, ileri, geri)
- Obstacle detection and warning

**Example Outputs**:
- "Önünüzde 3 metre merdiven var"
- "Sağınızda bir masa, solunuzda duvar"
- "İleri gidin, yol açık"

---

### 2. Vehicle Danger Detection

**Levels**:

| Level | Distance | Haptic Pattern | Voice Alert |
|-------|----------|----------------|-------------|
| Critical | < 3m | Strong, rapid | "DURUN! Araba!" |
| Warning | 3-8m | Medium, pulsing | "DİKKAT! Araç geliyor" |
| Awareness | 8-15m | Light, single | "Araç var" |

**Detection Keywords**:
```typescript
VEHICLE_TYPES: ['car', 'bus', 'truck', 'motorcycle', 'araba', 'otobüs', 'kamyon', 'motor']
CRITICAL: ['durun', 'dur!', 'tehlike', 'çok yakın']
WARNING: ['yaklaşıyor', 'geliyor', 'dikkat']
```

---

### 3. Fall Detection

**Algorithm**:
```
1. Monitor accelerometer continuously
2. Detect sudden high acceleration (> 25 m/s²)
3. Check for stillness after impact (< 2 m/s² for 3 seconds)
4. If both conditions met → Fall detected
```

**Response Flow**:
```
Fall Detected
    ↓
Haptic Alert + "Düştünüz mü? İyi misiniz?"
    ↓
Wait 5 seconds for response
    ↓
No response? → Repeat (max 3 times)
    ↓
Still no response? → Auto-trigger SOS
```

**Configuration**:
```typescript
FALL_THRESHOLD: 25          // m/s²
STILLNESS_THRESHOLD: 2      // m/s²
STILLNESS_DURATION: 3000    // ms
CHECK_IN_INTERVAL: 5000     // ms
MAX_CHECK_INS: 3
AUTO_SOS_DELAY: 30000       // ms
```

---

### 4. Haptic Feedback System

**Native Integration**: `@capacitor/haptics`

**Patterns**:

| Alert Type | Pattern (ms) | Description |
|------------|--------------|-------------|
| Vehicle Critical | 400-100-400-100-400-100-400 | Very intense, rapid |
| Vehicle Warning | 200-100-200-100-200 | Moderate pulsing |
| Vehicle Awareness | Single impact | Light notification |
| Fall Detected | 500-200-500-200-500 | Long attention-grabbing |
| SOS Alert | 300-100-300-100-300-200-500 | Urgent, SOS pattern |
| Direction Left | Light impact | Quick tap |
| Direction Right | Heavy impact | Strong tap |
| Success | Success notification | Positive feedback |

---

### 5. Voice Interaction

**Bidirectional Audio**:
- Input: 16kHz PCM, mono
- Output: 24kHz PCM, decoded via Web Audio API

**Supported Commands** (Turkish):
```
"Ne var önümde?" → Scene description
"Bu ne?" → Object identification
"Nereye gideyim?" → Navigation guidance
"Yardım" → Help/SOS mode
"Sessiz" → Mute microphone
"Konuş" → Unmute microphone
```

---

### 6. Proactive vs Reactive Modes

**Proactive Mode**:
- AI continuously describes the environment
- Automatic hazard announcements
- Best for unfamiliar environments

**Reactive Mode**:
- AI responds only when asked
- Quieter experience
- Best for familiar environments

**Toggle**: Settings panel or voice command

---

### 7. Auto-Reconnect

**Behavior**:
```
Connection Lost
    ↓
Attempt 1: Wait 2s → Reconnect
    ↓
Failed? → Attempt 2: Wait 2s → Reconnect
    ↓
Failed? → Attempt 3: Wait 2s → Reconnect
    ↓
Failed? → Stop and notify user
```

**Implementation**:
```typescript
maxReconnectAttempts: 3
reconnectDelay: 2000 // ms
shouldReconnect: true // Disabled on manual stop
```

---

## Planned Features

### Phase 2
- [ ] Traffic light detection
- [ ] Color description for clothing
- [ ] Expiration date reader
- [ ] Offline mode with cached routes

### Phase 3
- [ ] Community routes sharing
- [ ] Gamification (badges, points)
- [ ] Multi-language support
- [ ] Helper network integration

---

## Accessibility Compliance

| Criterion | Implementation |
|-----------|----------------|
| Voice-first | All functions accessible via voice |
| Large touch targets | Buttons minimum 48x48dp |
| High contrast | Black/white/cyan color scheme |
| Haptic feedback | All alerts have vibration |
| No visual-only info | Everything announced |

---

*Features powered by Google Gemini AI*
