# LiveSight Development Roadmap

## Vision

**"See Beyond Barriers"** - Empowering visually impaired users to navigate the world independently with AI assistance.

---

## Current Version: 1.2.0

### Completed Features ✅

- [x] Real-time Gemini Live API integration
- [x] Turkish language voice interaction
- [x] Camera-based scene analysis
- [x] Vehicle danger detection (3 levels)
- [x] Native haptic feedback (Capacitor)
- [x] Fall detection with accelerometer
- [x] Auto-SOS after unresponsive fall
- [x] Auto-reconnect (3 attempts)
- [x] Proactive/Reactive mode toggle
- [x] Cross-platform (Android/iOS/Web)

---

## Version 1.3.0 - Performance & Reliability

**Target**: Faster connection, better perception

### Improvements
- [ ] Pre-initialize audio contexts on app start
- [ ] Connection pooling for faster reconnects
- [ ] Reduce video frame size for faster upload
- [ ] Optimize system prompt for quicker responses
- [ ] Add connection quality indicator
- [ ] Implement audio buffering for smoother playback

### Bug Fixes
- [ ] Fix occasional double connection issue
- [ ] Improve first-response latency
- [ ] Handle network transitions (WiFi → Mobile)
- [ ] Fix audio crackling on some devices

---

## Version 1.4.0 - Enhanced Perception

**Target**: Better understanding and control

### New Features
- [ ] Traffic light detection
  - Red/Yellow/Green state
  - Countdown timer reading
  - Audio guidance for crossing

- [ ] Obstacle categorization
  - Ground level (holes, curbs)
  - Overhead (signs, branches)
  - Moving (people, vehicles)

- [ ] Distance calibration
  - More accurate meter estimation
  - User-adjustable sensitivity

### Improvements
- [ ] Context-aware descriptions
- [ ] Prioritized hazard announcements
- [ ] Reduced false positive alerts

---

## Version 1.5.0 - User Control

**Target**: More user control and customization

### New Features
- [ ] Voice command expansion
  - "Tekrar söyle" (repeat last)
  - "Daha detaylı" (more detail)
  - "Kısalt" (shorter responses)
  - "Sessiz mod" (quiet mode)

- [ ] Custom alert preferences
  - Adjustable haptic intensity
  - Alert sound selection
  - Quiet hours setting

- [ ] Favorite locations
  - Save frequently visited places
  - Route memory

### Improvements
- [ ] Faster voice command recognition
- [ ] Reduced battery consumption
- [ ] Offline voice commands

---

## Version 2.0.0 - Community Features

**Target**: Social integration

### New Features
- [ ] Shared routes
  - Community-verified safe paths
  - User ratings and reviews
  - Hazard reporting

- [ ] Helper network
  - Request nearby help
  - Verified volunteer system
  - Voice/video call support

- [ ] Gamification
  - Points for navigation
  - Badges and achievements
  - Leaderboards

---

## Version 2.5.0 - Offline Mode

**Target**: Work without internet

### New Features
- [ ] Offline maps
  - Download areas for offline use
  - Basic navigation without AI

- [ ] Cached AI responses
  - Common scenario responses
  - Obstacle type recognition

- [ ] Local processing
  - On-device object detection
  - Reduced latency

---

## Technical Debt

### High Priority
- [ ] Replace ScriptProcessorNode with AudioWorklet
- [ ] Implement proper error boundaries
- [ ] Add comprehensive logging system
- [ ] Unit tests for critical paths

### Medium Priority
- [ ] Refactor service layer
- [ ] Improve TypeScript strict mode compliance
- [ ] Add E2E tests for user flows
- [ ] Performance monitoring integration

### Low Priority
- [ ] Code documentation
- [ ] Storybook for components
- [ ] Accessibility audit

---

## Success Metrics

| Metric | Current | Target v1.5 | Target v2.0 |
|--------|---------|-------------|-------------|
| Connection time | ~3s | <2s | <1s |
| First response | ~2s | <1s | <0.5s |
| Reconnect success | 80% | 95% | 99% |
| Battery usage/hr | 15% | 10% | 8% |
| User satisfaction | - | 4.0/5 | 4.5/5 |

---

## Competition Timeline

### Immediate (This Week)
1. Connection speed optimization
2. Perception accuracy improvements
3. User control enhancements

### Short-term (2 Weeks)
1. Traffic light detection
2. Enhanced obstacle detection
3. Voice command expansion

### Medium-term (1 Month)
1. Community features MVP
2. Offline mode basic
3. Performance optimization

---

*Roadmap powered by Gemini AI development*
