# Changelog

All notable changes to LiveSight are documented here.

## [1.2.1] - 2025-01-17

### Improved
- Video quality increased (800x450 @ 4 FPS, 70% JPEG quality)
- Faster connection (12s timeout, 1s reconnect delay)
- More reconnect attempts (5 instead of 3)
- Smaller audio buffer (2048) for faster processing
- Better system instruction with priority order

### Changed
- AI now follows priority: DANGER → OBSTACLES → PATH → ENVIRONMENT
- Shorter responses (max 2 sentences)
- More specific distance warnings

---

## [1.2.0] - 2025-01-17

### Added
- Auto-reconnect feature (3 attempts with 2s delay)
- Vehicle danger detection with 3 levels (critical/warning/awareness)
- Fall detection using accelerometer
- Auto-SOS after 3 unanswered check-ins
- Native haptic feedback via Capacitor Haptics plugin
- Test panel for vehicle alerts (dev mode)
- Turkish status messages during connection
- New app icon with eye/world/sun design
- "See Beyond Barriers" branding

### Changed
- Reduced connection timeout from 30s to 15s
- Parallel audio/microphone initialization
- Removed 500ms delay before streaming
- Simplified Turkish system instruction
- Updated to React 19
- Updated to Capacitor 8

### Fixed
- Haptic vibrations not working on mobile (switched to Capacitor plugin)
- Duplicate AI sessions issue
- App stopping automatically on network hiccup

---

## [1.1.0] - 2025-01-15

### Added
- Proactive/Reactive mode toggle
- Settings panel
- Hazard logging system
- Voice command detection
- Weather context integration

### Changed
- Improved Turkish language prompts
- Better error messages

### Fixed
- Audio crackling issues
- Connection state management

---

## [1.0.0] - 2025-01-10

### Added
- Initial release
- Gemini Live API integration
- Real-time camera analysis
- Voice interaction in Turkish
- Basic hazard detection
- Android and iOS support

---

## Roadmap

### [1.3.0] - Planned
- Connection speed optimization
- Improved perception accuracy
- Enhanced user control
- Traffic light detection

### [1.4.0] - Planned
- Offline mode basics
- Color description
- Expiration date reader

### [2.0.0] - Planned
- Community features
- Gamification
- Helper network

---

*Powered by Google Gemini AI*
