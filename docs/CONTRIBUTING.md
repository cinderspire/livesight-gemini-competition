# Contributing to LiveSight

## Project Goal

LiveSight aims to empower visually impaired users with AI-powered navigation assistance. Every contribution should prioritize:

1. **Accessibility** - Voice-first, haptic feedback, high contrast
2. **Safety** - Reliable hazard detection, fail-safe behaviors
3. **Privacy** - No data storage, minimal permissions
4. **Performance** - Fast responses, low battery usage

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Android Studio (for mobile)
- Gemini API Key

### Setup

```bash
# Clone repository
git clone <repo-url>
cd livesight

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Add your VITE_GEMINI_API_KEY

# Start development
npm run dev
```

---

## Code Standards

### TypeScript

- Strict mode enabled
- Explicit return types on functions
- No `any` type (use `unknown` if needed)
- Prefer interfaces over types

```typescript
// Good
interface UserSettings {
  proactiveMode: boolean;
}

function getSettings(): UserSettings {
  return { proactiveMode: true };
}

// Avoid
const getSettings = () => ({ proactiveMode: true });
```

### React

- Functional components only
- Custom hooks for logic reuse
- Named exports preferred
- Co-locate tests with components

```typescript
// Good
export function MyComponent({ prop }: Props) {
  const { state, action } = useMyHook();
  return <div>{state}</div>;
}

// Avoid
export default class MyComponent extends React.Component {}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CameraFeed.tsx` |
| Hooks | camelCase with `use` | `useHaptic.ts` |
| Services | camelCase | `liveSightService.ts` |
| Constants | UPPER_SNAKE_CASE | `AUDIO_CONFIG` |
| Types | PascalCase | `UserSettings` |

---

## Pull Request Process

### Before Submitting

1. **Type Check**: `npm run type-check`
2. **Lint**: `npm run lint`
3. **Format**: `npm run format`
4. **Test on Device**: Verify on Android/iOS

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Documentation

## Testing
- [ ] Tested on Android device
- [ ] Tested on iOS device
- [ ] Tested on web browser

## Accessibility Impact
- [ ] Voice interaction verified
- [ ] Haptic feedback working
- [ ] No visual-only information

## Screenshots/Videos
(if applicable)
```

---

## Priority Areas

### High Priority

1. **Connection Speed** - Reduce time to first response
2. **Perception Accuracy** - Better object/distance detection
3. **User Control** - More voice commands
4. **Reliability** - Fewer disconnections

### Medium Priority

1. Traffic light detection
2. Offline mode basics
3. Better Turkish language support
4. Battery optimization

### Low Priority

1. Gamification features
2. Community routes
3. Multi-language support

---

## Testing Guidelines

### Manual Testing Checklist

- [ ] App starts without errors
- [ ] Camera permission requested and works
- [ ] Microphone permission requested and works
- [ ] Connection establishes within 5 seconds
- [ ] AI responds to voice input
- [ ] Haptic feedback works on alerts
- [ ] Auto-reconnect works after disconnect
- [ ] Fall detection triggers correctly
- [ ] Mute/unmute works

### Device Testing

Test on:
- [ ] Android phone (latest)
- [ ] Android phone (older model)
- [ ] Chrome browser
- [ ] iOS device (if available)

---

## Architecture Decisions

### Why Capacitor?

- Single codebase for web/mobile
- Native plugin access
- React-friendly
- Active community

### Why Gemini Live API?

- Real-time audio/video processing
- Low latency responses
- Turkish language support
- Multimodal capabilities

### Why React 19?

- Latest features
- Better performance
- Concurrent rendering
- Server components (future)

---

## Contact

For questions:
- Open an issue on GitHub
- Tag with `question` label

For urgent issues:
- Tag with `urgent` label
- Describe impact on users

---

*Contributing to accessibility through AI innovation*
