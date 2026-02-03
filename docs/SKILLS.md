# LiveSight Skills & Capabilities

## AI Skills

### Scene Understanding

| Skill | Description | Accuracy |
|-------|-------------|----------|
| Object Detection | Identify objects in camera view | High |
| Distance Estimation | Estimate distance in meters | Medium |
| Direction Indication | Left/Right/Forward/Behind | High |
| Person Detection | Identify people and their position | High |
| Vehicle Detection | Identify cars, buses, motorcycles | High |
| Text Reading | Read signs and labels | Medium |

### Navigation Assistance

| Skill | Description | Status |
|-------|-------------|--------|
| Path Clear Check | Verify walking path is safe | Active |
| Obstacle Warning | Alert about obstacles | Active |
| Step Detection | Detect stairs and curbs | Active |
| Door Finding | Help locate doors | Active |
| Indoor Navigation | Navigate inside buildings | Planned |
| Outdoor Navigation | Street-level guidance | Active |

### Safety Features

| Skill | Description | Status |
|-------|-------------|--------|
| Vehicle Danger Alert | 3-level alert system | Active |
| Fall Detection | Accelerometer-based | Active |
| Auto-SOS | After unresponsive fall | Active |
| Hazard Warning | Immediate danger alerts | Active |
| Surface Detection | Wet/slippery surfaces | Planned |

---

## Voice Interaction Skills

### Commands (Turkish)

| Command | Trigger Phrases | Action |
|---------|-----------------|--------|
| Scene Description | "Ne var önümde?", "Etrafımda ne var?" | Describe visible scene |
| Object Identification | "Bu ne?", "Şu nesne ne?" | Identify pointed object |
| Navigation Help | "Nereye gideyim?", "Yol tarifi" | Provide direction |
| Mode Switch | "Proaktif mod", "Sessiz mod" | Change AI behavior |
| Repeat Last | "Tekrar söyle" | Repeat last response |
| Emergency | "Yardım", "Acil" | Trigger SOS mode |
| Mute | "Sessiz", "Sus" | Mute microphone |
| Unmute | "Konuş", "Dinle" | Unmute microphone |

### Response Patterns

```
Hazard Response:
  "DURUN!" → Immediate stop required
  "DİKKAT!" → Be careful, danger nearby
  "UYARI!" → Awareness needed

Direction Response:
  "Sağınızda" → To your right
  "Solunuzda" → To your left
  "Önünüzde" → In front of you
  "Arkanızda" → Behind you

Distance Response:
  "X metre uzakta" → X meters away
  "Yakın" → Close (< 1m)
  "Uzak" → Far (> 10m)
```

---

## Haptic Skills

### Vibration Patterns

| Pattern | Meaning | When Used |
|---------|---------|-----------|
| Long-Short-Long | Critical danger | Vehicle < 3m |
| Medium pulses | Warning | Vehicle approaching |
| Single tap | Awareness | Vehicle detected |
| SOS pattern | Emergency | Fall detected |
| Success buzz | Confirmation | Action completed |
| Direction tap | Navigation | Turn guidance |

### Direction Cues

```
Left Turn:  Light impact (subtle)
Right Turn: Heavy impact (strong)
Forward:    Medium impact
Stop:       Error notification (urgent)
```

---

## Sensor Skills

### Fall Detection Algorithm

```
Inputs:
  - DeviceMotionEvent.acceleration
  - DeviceMotionEvent.accelerationIncludingGravity

Detection Logic:
  1. Calculate total acceleration magnitude
  2. Detect sudden spike (> 25 m/s²)
  3. Monitor for stillness after spike
  4. If still for > 3 seconds → Fall confirmed

Response:
  1. Haptic alert
  2. Voice: "Düştünüz mü? İyi misiniz?"
  3. Wait for response (5 seconds)
  4. If no response → Repeat (max 3 times)
  5. If still no response → Auto-SOS
```

### Location Skills

| Skill | Plugin | Purpose |
|-------|--------|---------|
| Current Position | @capacitor/geolocation | Get coordinates |
| Watch Position | @capacitor/geolocation | Track movement |
| Share Location | @capacitor/share | SOS location sharing |

---

## Planned Skills

### Phase 2

- [ ] **Traffic Light Reading**
  - Detect light color (red/yellow/green)
  - Read countdown timers
  - Provide crossing guidance

- [ ] **Color Description**
  - Identify clothing colors
  - Suggest matching combinations
  - Describe patterns

- [ ] **Expiration Date Reading**
  - Detect date labels on products
  - Calculate days remaining
  - Warn about expired items

### Phase 3

- [ ] **Indoor Mapping**
  - Learn room layouts
  - Remember furniture positions
  - Navigate to specific locations

- [ ] **Face Recognition**
  - Identify known people
  - Announce who is nearby
  - Privacy-conscious implementation

- [ ] **Currency Identification**
  - Identify banknote denominations
  - Count total amount
  - Verify payment amounts

---

## Skill Configuration

### Sensitivity Levels

```typescript
// Vehicle detection thresholds
CRITICAL_DISTANCE: 3,    // meters
WARNING_DISTANCE: 8,     // meters
AWARENESS_DISTANCE: 15,  // meters

// Fall detection thresholds
FALL_THRESHOLD: 25,      // m/s²
STILLNESS_THRESHOLD: 2,  // m/s²
```

### Adjustable Parameters

| Parameter | Range | Default |
|-----------|-------|---------|
| Proactive Mode | On/Off | On |
| Haptic Feedback | On/Off | On |
| Voice Speed | Slow/Normal/Fast | Normal |
| Alert Volume | 0-100% | 100% |

---

## Skill Accuracy Metrics

| Skill | Accuracy | False Positives | False Negatives |
|-------|----------|-----------------|-----------------|
| Vehicle Detection | 90% | 5% | 5% |
| Obstacle Warning | 85% | 10% | 5% |
| Distance Estimation | 75% | N/A | N/A |
| Fall Detection | 80% | 15% | 5% |
| Voice Recognition | 85% | 10% | 5% |

---

*Skills powered by Google Gemini AI*
