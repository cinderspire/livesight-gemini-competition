<div align="center">

# LiveSight

### *Free for All. Built for Good.*

**A social purpose project: AI-powered real-time navigation for visually impaired people**

[![Gemini API](https://img.shields.io/badge/Powered%20by-Google%20Gemini%202.0%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Hackathon](https://img.shields.io/badge/Google%20AI-Hackathon%202026-EA4335?style=for-the-badge&logo=google&logoColor=white)](https://googleai.devpost.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![Free Forever](https://img.shields.io/badge/Cost-Free%20Forever-00C853?style=for-the-badge)](#-usage-terms--free-for-all-built-for-good)

<br/>

> **285 million** people worldwide live with visual impairments.
> LiveSight exists for one reason: **to give them eyes that speak.**

<br/>

[Try LiveSight in Your Browser](#-web-version) | [Watch Demo](#-demo) | [Quick Start](#-quick-start) | [Features](#-features) | [Architecture](#-architecture) | [Hackathon](#-hackathon-submission)

<br/>

<img src="https://img.shields.io/badge/Status-Live-00C853?style=flat-square" /> <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blueviolet?style=flat-square" /> <img src="https://img.shields.io/badge/AI%20Model-Gemini%202.0%20Flash-FF6F00?style=flat-square" />

</div>

---

## Our Mission

LiveSight is a **social purpose project**. It was not built to make money. It was built because navigating the world without sight is dangerous, exhausting, and unnecessarily difficult -- and because a smartphone and modern AI can change that.

Current assistive devices cost $3,000 or more for smart canes, are limited in what they can detect, or require constant human help. LiveSight takes a different approach: **turn the phone someone already carries into an intelligent seeing companion.** No special hardware. No subscription. No cost. Just open the app and go.

Every design decision in LiveSight starts with one question: *does this help a visually impaired person move through the world more safely and independently?*

---

## Usage Terms -- Free for All, Built for Good

LiveSight is released under a simple, human-friendly principle:

- **FREE** to use, forever, for any purpose.
- **OPEN** for anyone to study, modify, fork, and redistribute.
- **WELCOME** in personal projects, research, nonprofits, education, government work, and community initiatives.
- **ONE CONDITION**: No person or organization other than the original creators ([cinderspire](https://github.com/cinderspire)) may monetize LiveSight commercially. You may not sell it, wrap it in a paid product, or charge users for access to it. LiveSight was built as a public good and must remain one.

If you want to build on top of LiveSight to help people, you are encouraged to do so. If you want to profit from it, please reach out to the creators first.

> The formal license text is in [LICENSE](LICENSE). This section describes the spirit of the project.

---

## Web Version

You can use LiveSight directly in your browser without installing anything:

**[https://cinderspire.github.io/livesight-gemini-competition/](https://cinderspire.github.io/livesight-gemini-competition/)**

The web version provides the full LiveSight experience -- real-time camera analysis, voice guidance, traffic light detection, and all navigation modes -- right from your phone or desktop browser. No app store required. Just open the link, allow camera access, enter your Gemini API key, and go.

This is especially useful for:
- Trying LiveSight before installing the mobile app
- Using LiveSight on devices where you cannot install apps
- Sharing LiveSight with someone who needs it immediately

---

## The Problem

Every day, visually impaired people face life-threatening challenges:

- **Vehicles** they cannot see approaching
- **Traffic lights** they cannot read
- **Obstacles** on sidewalks they cannot detect
- **Navigation** without visual landmarks

These are not inconveniences. They are barriers to independence, safety, and dignity.

## The Solution

**LiveSight** turns any smartphone into an intelligent navigation companion that:

1. **Sees** through the phone camera using Gemini 2.0 Flash Vision AI
2. **Understands** the environment in real-time
3. **Speaks** clear, actionable guidance to the user
4. **Adapts** to different scenarios automatically

**No special hardware. No expensive devices. Just a phone.**

---

## Demo

<div align="center">

### 5 Real-World Scenarios

| Scenario | Description | What LiveSight Does |
|:--------:|:------------|:-------------------|
| **Obstacle Detection** | Walking on NYC sidewalk | Detects parked cars, tree pits, stop signs |
| **Traffic Light** | Approaching a crosswalk | Reads pedestrian signals, guides safe crossing |
| **Crowd Navigation** | Busy Tokyo intersection | Counts pedestrians, finds clear path |
| **Danger Alert** | Narrow sidewalk with vehicles | Warns about blocked paths, checks before crossing |
| **Explore Mode** | Shopping district | Identifies nearby restaurants, shops, transit stops |

</div>

> **[Watch Full Demo on YouTube](https://youtube.com/shorts/t-8CzLcFolU)**

---

## Features

### AI-Powered Vision (Gemini 2.0 Flash)
- **Real-time scene analysis** at 2-4 FPS
- Object detection and classification
- Text recognition (signs, menus, labels)
- Spatial awareness and distance estimation

### Traffic Light Detection
- Red / Yellow / Green state recognition
- Pedestrian signal detection
- Countdown timer estimation
- Safe crossing guidance

### Smart Navigation
- Turn-by-turn voice directions
- Obstacle avoidance routing
- Landmark-based orientation
- Indoor/outdoor seamless transition

### Explore Mode
- Nearby place discovery
- Restaurant and shop identification
- Public transit information
- Points of interest description

### Danger Detection
- Fast-approaching vehicle alerts
- Construction zone warnings
- Uneven surface detection
- Fall risk assessment with auto-emergency call

### Accessibility-First Design
- **100% voice-controlled** interface
- High-contrast UI with large touch targets
- Haptic feedback for alerts
- Screen reader compatible
- Works offline for basic features

---

## Architecture

```
+---------------------------------------------+
|                 LiveSight App                |
+---------------------------------------------+
|                                             |
|  Camera Feed --> Gemini 2.0 Flash Vision AI |
|       |                    |                |
|       |              Scene Analysis         |
|       |              Object Detection       |
|       |              Text Recognition       |
|       |                    |                |
|       v                    v                |
|  HUD Overlay         TTS Engine             |
|  - Traffic state    - Voice guidance        |
|  - Danger alerts    - Spatial audio         |
|  - Navigation       - Priority alerts       |
|  - Explore info     - Natural language      |
|                                             |
+---------------------------------------------+
|  Capacitor (iOS + Android + Web)            |
|  React 19 + TypeScript + TailwindCSS        |
|  Battery-optimized with adaptive FPS        |
+---------------------------------------------+
```

### Tech Stack

| Layer | Technology |
|:------|:-----------|
| **AI Engine** | Google Gemini 2.0 Flash Vision API |
| **Frontend** | React 19 + TypeScript + TailwindCSS |
| **Mobile** | Capacitor 8 (iOS and Android) |
| **Build** | Vite 6 |
| **TTS** | Web Speech API + native fallback |
| **Sensors** | Camera, Accelerometer, Geolocation, Compass |

---

## Quick Start

### Prerequisites
- Node.js 18+
- iOS: Xcode 16+ / Android: Android Studio

### Installation

```bash
# Clone
git clone https://github.com/cinderspire/livesight-gemini-competition.git
cd livesight-gemini-competition

# Install
npm install

# Get your Gemini API key at https://ai.google.dev
# The app will prompt for it on first launch

# Run on web
npm run dev

# Build for mobile
npm run build:mobile

# Deploy to iOS simulator
npx cap run ios

# Deploy to Android
npx cap run android
```

### Demo Mode

Try LiveSight without an API key:
```bash
# Open in browser with demo mode
# Add ?demo=demo1.mp4 to URL for obstacle detection
# ?demo=demo2.mp4 for traffic light
# ?demo=demo3.mp4 for crowd navigation
# ?demo=demo4.mp4 for danger alert
# ?demo=demo5.mp4 for explore mode
```

---

## Impact

<div align="center">

| Metric | Value |
|:-------|:------|
| Potential users | **285 million** visually impaired people worldwide |
| Cost | **$0** -- uses existing smartphone |
| Response time | **< 2 seconds** scene-to-speech |
| Battery usage | **< 15%/hour** with adaptive FPS |
| Languages | English (expandable via Gemini) |
| Platforms | iOS, Android, Web |

</div>

---

## Hackathon Submission

### Google AI Hackathon 2026

**LiveSight** is our submission for the Google AI Hackathon, competing in multiple categories:

- **Most Potential for Community Impact** -- Empowering 285M visually impaired people
- **Most Creative and Original** -- Turning any phone into an AI seeing companion
- **Most Impressive Technical Implementation** -- Real-time vision + spatial audio + multi-sensor fusion
- **Best Use of Responsible AI** -- Accessibility-first, privacy-respecting, life-saving technology

### Why LiveSight Matters

> *"The best technology is the one that disappears. LiveSight doesn't ask users to learn a new device -- it transforms the phone they already carry into eyes that speak."*

### Gemini API Usage

- **Gemini 2.0 Flash Vision** -- Real-time camera frame analysis
- **Multi-modal understanding** -- Combines visual + spatial + contextual data
- **Streaming responses** -- Low-latency scene descriptions
- **Safety filters** -- Responsible AI for vulnerable users

---

## Roadmap

- [x] Real-time camera analysis with Gemini Vision
- [x] Traffic light detection and crossing guidance
- [x] Obstacle detection and avoidance
- [x] Explore mode for nearby places
- [x] Danger/vehicle alert system
- [x] Fall detection with emergency response
- [ ] Multi-language support (50+ languages via Gemini)
- [ ] Smart glasses integration (Meta, Ray-Ban)
- [ ] Community-sourced obstacle mapping
- [ ] Public transit real-time integration
- [ ] Indoor navigation (malls, airports, hospitals)

---

## Contributing

LiveSight is a social purpose project and contributions are welcome. Whether it is:

- Bug reports
- Feature requests
- Translations
- Accessibility improvements
- Documentation

Please open an issue or submit a PR. Every improvement makes the world a little more navigable for someone who needs it.

---

## License

See [LICENSE](LICENSE) for the formal license text. The spirit of this project is described in [Usage Terms](#-usage-terms--free-for-all-built-for-good) above: free for everyone, built for good, not for commercial profit by anyone other than the original creators.

---

<div align="center">

### Built with purpose by [cinderspire](https://github.com/cinderspire)

*Empowering independence through intelligent vision*

**LiveSight is and always will be free.**

<br/>

[![Google Gemini](https://img.shields.io/badge/Built%20with-Google%20Gemini%202.0%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)

</div>
