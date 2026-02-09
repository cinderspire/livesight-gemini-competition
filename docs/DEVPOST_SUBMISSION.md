# LiveSight - Devpost Submission

## Project Title
**LiveSight: Real-Time AI Navigation for the Visually Impaired**

## Tagline
*See the world through AI — navigate safely, independently, and confidently.*

---

## Description (~200 words)

LiveSight is a real-time AI navigation assistant that empowers visually impaired users to explore the world safely and independently. Using **Gemini 2.5 Flash Live API**, it streams live camera video and audio bidirectionally, providing instant spoken guidance about obstacles, traffic signals, colors, and surroundings.

**Gemini 3 Features Used:**
- **Live API** — Real-time bidirectional video+audio streaming at 4 FPS with sub-second AI response
- **Function Calling** — 4 autonomous tools (reportObstacle, switchMode, triggerEmergency, announceEnvironment) that let the AI actively navigate, not just describe
- **Native Audio** — Natural speech output directly from Gemini, no TTS middleware
- **Multimodal Processing** — Simultaneous video frames + user speech analyzed in a single session

**6 AI Modes:** Navigation (obstacle detection with clock-direction guidance), Traffic Light Detection, Color & Pattern Recognition, Expiration Date Reader, Explore Mode (environment narration), and SOS Emergency System with fall detection.

**Built with:** React 19 + TypeScript + Capacitor 8 (Android/iOS) + Tailwind CSS. Features haptic feedback (11 patterns), voice commands (15+), gamification, 8-language support, and emergency contact system with auto-SOS.

285 million people worldwide are visually impaired. LiveSight gives them an AI co-pilot for the real world.

---

## How We Built It

LiveSight connects to Gemini's Live API via WebSocket, streaming camera frames (512x288 JPEG @ 4 FPS) and microphone audio (PCM 16-bit @ 16kHz) simultaneously. The AI processes both streams in real-time, using Function Calling to trigger structured actions like obstacle alerts with distance/direction data, mode switching, and emergency protocols.

Each of 6 modes has a specialized system prompt that transforms Gemini's behavior — from a careful navigator detecting vehicles at 3 threat levels, to a color expert suggesting outfit combinations, to an environment narrator reading signs and identifying landmarks.

The mobile app uses Capacitor 8 to bridge native APIs (haptics, camera, geolocation, SMS) with the React frontend, enabling features like pattern-based vibration alerts and fall detection via accelerometer data.

## Challenges We Ran Into

- Balancing video frame rate (quality vs. latency) — settled on 4 FPS at 512x288 as optimal
- Designing audio processing pipeline for real-time bidirectional speech
- Creating 6 distinct AI personalities via system prompts while maintaining safety consistency
- Implementing fall detection with accelerometer thresholds that minimize false positives

## What We Learned

- Gemini Live API's native audio output is dramatically more natural than any TTS
- Function Calling transforms AI from passive observer to active navigator
- Accessibility-first design actually improves UX for ALL users
- Real-time multimodal AI changes what's possible in mobile applications

## What's Next

- Community route sharing with accessibility ratings
- Helper network connecting sighted volunteers with users
- Offline mode with cached area data
- Wearable device integration (smart glasses)

---

## Built With
`gemini-api` `gemini-live-api` `function-calling` `react` `typescript` `capacitor` `tailwindcss` `vite` `web-audio-api` `accessibility`

## Try It Out
- **GitHub:** https://github.com/cinderspire/livesight-gemini-competition
- **Demo Video:** [link]
