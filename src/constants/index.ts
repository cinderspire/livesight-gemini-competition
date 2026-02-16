/**
 * LiveSight Application Constants
 * Comprehensive configuration for all features
 */

// ============================================
// Audio Configuration
// ============================================

export const AUDIO_CONFIG = {
  INPUT_SAMPLE_RATE: 16000,
  OUTPUT_SAMPLE_RATE: 24000,
  BUFFER_SIZE: 2048,  // Smaller for faster processing
  CHANNELS: 1,
} as const;

// ============================================
// Video Configuration
// ============================================

export const VIDEO_CONFIG = {
  FPS: 4,
  WIDTH: 512,
  HEIGHT: 288,
  JPEG_QUALITY: 0.5,
  CAMERA_WIDTH: 640,
  CAMERA_HEIGHT: 480,
  CAMERA_FPS: 30,
} as const;

// ============================================
// AI Model Configuration
// ============================================

export const AI_CONFIG = {
  MODEL_NAME: 'gemini-2.0-flash-live-001',
  VOICE_NAME: 'Kore',
  API_VERSION: 'v1alpha',
  // Gemini Live API voice options mapped to user preference
  VOICE_MAP: {
    female: 'Kore',    // Clear female voice
    male: 'Puck',      // Clear male voice
    neutral: 'Aoede',  // Neutral-sounding voice
  } as Record<string, string>,
} as const;

// ============================================
// UI Configuration
// ============================================

export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  TOAST_EXIT_DELAY: 300,
  MAX_LOGS: 100,
  COMPASS_PIXELS_PER_DEGREE: 4,
  VISUALIZER_BAR_COUNT: 12,
  VOLUME_THRESHOLD_HIGH: 0.5,
  SOS_HOLD_DURATION: 3000, // 3 seconds to trigger SOS
  ACHIEVEMENT_DISPLAY_DURATION: 5000,
} as const;

// ============================================
// Haptic Patterns
// ============================================

export const HAPTIC_PATTERNS = {
  HAZARD_ALERT: [100, 50, 100, 50, 100] as const,
  HAZARD_CRITICAL: [200, 100, 200, 100, 200, 100, 200] as const,
  SUCCESS: 50,
  START: [50, 50, 50] as const,
  DEFAULT: 200,
  SOS_CONFIRM: [100, 100, 100, 100, 100] as const,
  TRAFFIC_GREEN: [50, 50, 50] as const,
  TRAFFIC_RED: [200, 200, 200] as const,
  OBSTACLE_NEAR: [100, 50, 100] as const,
  OBSTACLE_FAR: [50] as const,
  ACHIEVEMENT: [50, 100, 50, 100, 200] as const,
  DIRECTION_LEFT: [100, 50] as const,
  DIRECTION_RIGHT: [50, 100] as const,
  DIRECTION_FORWARD: [100] as const,
  // Vehicle danger patterns - more intense for urgency
  VEHICLE_CRITICAL: [300, 100, 300, 100, 300, 100, 300, 100, 300] as const,  // Very intense rapid
  VEHICLE_WARNING: [200, 100, 200, 100, 200] as const,  // Moderate intensity
  VEHICLE_AWARENESS: [100, 200, 100] as const,  // Gentle notification
  // Fall detection patterns
  FALL_DETECTED: [500, 200, 500, 200, 500] as const,  // Long pulses to get attention
  FALL_CHECK_IN: [200, 300, 200] as const,  // "Are you okay?" pattern
} as const;

// ============================================
// Weather Code Ranges (WMO)
// ============================================

export const WEATHER_CODES = {
  DRIZZLE_RAIN: { min: 51, max: 67 },
  SNOW: { min: 71, max: 77 },
  SHOWERS: { min: 80, max: 82 },
  THUNDERSTORM: { min: 95, max: 99 },
  CLOUDY_CLEAR: { min: 0, max: 3 },
  FOG: { min: 45, max: 48 },
} as const;

// ============================================
// Urgent Keywords for Hazard Detection
// ============================================

export const URGENT_KEYWORDS = [
  // Critical alerts
  'stop',
  'alert',
  'danger',
  'watch out',
  'halt',
  'warning',
  'careful',
  'critical',
  'immediate',
  'urgent',
  // Vehicle alerts (Turkish + English)
  'vehicle',
  'car',
  'bike',
  'bicycle',
  'motorcycle',
  'bus',
  'truck',
  'approaching',
  'coming',
  'fast',
  'speed',
  'araç',
  'araba',
  'otobüs',
  'kamyon',
  'motor',
  'bisiklet',
  'yaklaşıyor',
  'geliyor',
  'hızlı',
  // Obstacles
  'obstacle',
  'stairs',
  'step',
  'curb',
  'hole',
  'drop',
  'edge',
  'merdiven',
  'kaldırım',
  'çukur',
] as const;

// ============================================
// Voice Command Keywords
// ============================================

export const COMMAND_KEYWORDS = {
  OPEN_SETTINGS: ['open settings', 'config', 'configuration', 'ayarlar'],
  CLOSE_SETTINGS: ['close settings', 'ayarları kapat'],
  OPEN_LOGS: ['show logs', 'report', 'status', 'events', 'kayıtlar'],
  CLOSE_LOGS: ['hide logs', 'close logs'],
  MUTE: ['mute', 'quiet', 'silence', 'stop listening', 'sessiz'],
  UNMUTE: ['unmute', 'speak', 'listen', 'start listening', 'konuş'],
  MODE_PROACTIVE: ['proactive', 'proactive mode', 'predict', 'proaktif'],
  MODE_PASSIVE: ['passive', 'reactive', 'passive mode', 'pasif'],
  OPEN_HELP: ['help', 'commands', 'what can i say', 'yardım'],
  CLOSE_HELP: ['close help', 'back', 'dismiss help'],
  // New commands
  READ_EXPIRATION: ['expiration', 'expire', 'best before', 'use by', 'son kullanma', 'tarih'],
  CHECK_TRAFFIC_LIGHT: ['traffic light', 'signal', 'crossing', 'trafik ışığı', 'sinyal'],
  DESCRIBE_COLOR: ['color', 'colour', 'what color', 'renk'],
  SEND_SOS: ['help me', 'emergency', 'sos', 'acil', 'yardım'],
  CANCEL_SOS: ['cancel sos', 'cancel emergency', 'i am okay', 'iptal'],
  FIND_NEARBY: ['find nearby', 'what is near', 'nearby', 'yakında ne var'],
  NAVIGATE_TO: ['navigate to', 'take me to', 'go to', 'git'],
  REPORT_HAZARD: ['report hazard', 'report obstacle', 'tehlike bildir'],
  SHARE_LOCATION: ['share location', 'where am i', 'konum paylaş'],
  BATTERY_STATUS: ['battery', 'power', 'charge', 'pil'],
  WEATHER_UPDATE: ['weather', 'forecast', 'hava durumu'],
  SYSTEM_STATUS: ['system status', 'system report', 'durum'],
} as const;

// ============================================
// Obstacle Detection Configuration
// ============================================

export const OBSTACLE_CONFIG = {
  DETECTION_RANGE: 15, // meters
  ALERT_DISTANCE_CRITICAL: 1.5, // meters
  ALERT_DISTANCE_HIGH: 3, // meters
  ALERT_DISTANCE_MEDIUM: 6, // meters
  ALERT_DISTANCE_LOW: 10, // meters
  CATEGORIES: {
    ground: ['pothole', 'curb', 'step', 'uneven surface', 'wet floor', 'debris'],
    overhead: ['sign', 'branch', 'awning', 'construction', 'overhang'],
    moving: ['person', 'bicycle', 'scooter', 'pet', 'cart'],
    surface: ['wet', 'icy', 'slippery', 'rough', 'gravel'],
    drop: ['stairs', 'escalator', 'ramp', 'edge', 'platform'],
    vehicle: ['car', 'bus', 'truck', 'motorcycle', 'tram'],
  },
} as const;

// ============================================
// Traffic Light Configuration
// ============================================

export const TRAFFIC_LIGHT_CONFIG = {
  SCAN_INTERVAL: 500, // ms
  CONFIDENCE_THRESHOLD: 0.7,
  STATES: {
    red: { audio: 'stop', haptic: 'TRAFFIC_RED' },
    yellow: { audio: 'caution', haptic: 'DEFAULT' },
    green: { audio: 'walk', haptic: 'TRAFFIC_GREEN' },
    flashing: { audio: 'hurry', haptic: 'HAZARD_ALERT' },
  },
} as const;

// ============================================
// Color Detection Configuration
// ============================================

export const COLOR_CONFIG = {
  COMMON_COLORS: [
    { name: 'Black', hex: '#000000', category: 'neutral' },
    { name: 'White', hex: '#FFFFFF', category: 'neutral' },
    { name: 'Gray', hex: '#808080', category: 'neutral' },
    { name: 'Navy Blue', hex: '#000080', category: 'cool' },
    { name: 'Royal Blue', hex: '#4169E1', category: 'cool' },
    { name: 'Sky Blue', hex: '#87CEEB', category: 'cool' },
    { name: 'Red', hex: '#FF0000', category: 'warm' },
    { name: 'Burgundy', hex: '#800020', category: 'warm' },
    { name: 'Pink', hex: '#FFC0CB', category: 'warm' },
    { name: 'Green', hex: '#008000', category: 'cool' },
    { name: 'Olive', hex: '#808000', category: 'neutral' },
    { name: 'Yellow', hex: '#FFFF00', category: 'warm' },
    { name: 'Orange', hex: '#FFA500', category: 'warm' },
    { name: 'Purple', hex: '#800080', category: 'cool' },
    { name: 'Brown', hex: '#A52A2A', category: 'neutral' },
    { name: 'Beige', hex: '#F5F5DC', category: 'neutral' },
    { name: 'Khaki', hex: '#C3B091', category: 'neutral' },
  ],
  MATCHING_RULES: {
    'Navy Blue': ['White', 'Khaki', 'Beige', 'Gray'],
    'Black': ['White', 'Red', 'Pink', 'Any'],
    'White': ['Navy Blue', 'Black', 'Any'],
    'Gray': ['Black', 'White', 'Navy Blue', 'Pink'],
    'Brown': ['Beige', 'White', 'Navy Blue', 'Olive'],
    'Khaki': ['Navy Blue', 'White', 'Brown', 'Olive'],
  },
} as const;

// ============================================
// Expiration Date Configuration
// ============================================

export const EXPIRATION_CONFIG = {
  DATE_FORMATS: [
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'DD.MM.YYYY',
    'DD-MM-YYYY',
    'MMM DD, YYYY',
    'DD MMM YYYY',
  ],
  KEYWORDS: [
    'best before',
    'use by',
    'expires',
    'exp',
    'exp.',
    'best by',
    'sell by',
    'son kullanma',
    'tüketim tarihi',
    'skt',
  ],
  WARNING_DAYS: 7, // Days before expiration to warn
  CRITICAL_DAYS: 3, // Days before expiration for critical warning
} as const;

// ============================================
// SOS Configuration
// ============================================

export const SOS_CONFIG = {
  HOLD_DURATION: 3000, // ms to hold for SOS
  COUNTDOWN_DURATION: 10000, // ms countdown before sending
  LOCATION_UPDATE_INTERVAL: 900000, // 15 minutes
  LOCATION_SHARING_DURATION: 86400000, // 24 hours
  MAX_CONTACTS: 5,
  DEFAULT_MESSAGE: 'Emergency! I need help. This is an automated message from LiveSight.',
} as const;

// ============================================
// Vehicle Danger Detection Configuration
// ============================================

export const VEHICLE_DANGER_CONFIG = {
  // Distance thresholds in meters
  CRITICAL_DISTANCE: 3,    // Immediate danger - urgent alert
  WARNING_DISTANCE: 8,     // Warning zone - be careful
  AWARENESS_DISTANCE: 15,  // Awareness zone - vehicle detected
  // Speed indicators
  FAST_APPROACHING: ['fast', 'speed', 'hızlı', 'quickly', 'rapidly'],
  // Vehicle types to monitor
  VEHICLE_TYPES: ['car', 'bus', 'truck', 'motorcycle', 'bike', 'scooter', 'tram', 'araba', 'otobüs', 'kamyon', 'motor'],
  // Alert priorities
  PRIORITY: {
    CRITICAL: 'CRITICAL_VEHICLE',  // Immediate evasive action needed
    HIGH: 'HIGH_VEHICLE',          // Vehicle approaching fast
    MEDIUM: 'MEDIUM_VEHICLE',      // Vehicle in vicinity
  },
} as const;

// ============================================
// Fall Detection Configuration
// ============================================

export const FALL_DETECTION_CONFIG = {
  // Acceleration thresholds (m/s²)
  FALL_THRESHOLD: 25,           // High acceleration indicating fall
  IMPACT_THRESHOLD: 30,         // Impact force threshold
  STILLNESS_THRESHOLD: 2,       // Below this = person not moving
  // Time windows
  FALL_DETECTION_WINDOW: 500,   // ms to detect fall pattern
  STILLNESS_DURATION: 3000,     // ms of no movement after fall
  RESPONSE_TIMEOUT: 15000,      // ms to wait for "I'm okay" response
  // Auto-SOS settings
  AUTO_SOS_DELAY: 30000,        // ms before auto-sending SOS if no response
  CHECK_IN_INTERVAL: 5000,      // ms between "Are you okay?" prompts
  MAX_CHECK_INS: 3,             // Number of times to ask before SOS
} as const;

// ============================================
// Help Network Configuration
// ============================================

export const HELP_NETWORK_CONFIG = {
  // Nearby helper search radius (meters)
  SEARCH_RADIUS: 500,
  // Request timeout
  REQUEST_TIMEOUT: 60000,       // 1 minute to accept help request
  // Voice connection
  VOICE_ENABLED: true,
  // Helper verification
  REQUIRE_VERIFICATION: false,   // For MVP, allow any helper
} as const;


// ============================================
// Default Values
// ============================================

export const DEFAULT_SETTINGS = {
  mobilityAid: 'cane',
  voiceSpeed: 'normal',
  contrastMode: 'high',
  proactiveMode: true,
  voiceType: 'female',
  language: 'en',
  hapticFeedback: true,
  spatialAudio: true,
  offlineMode: false,
  autoSOS: false,
  batteryAlert: true,
  quietHours: { enabled: false, start: '22:00', end: '07:00' },
  customFps: 0,
} as const;

export const FREE_TIER_INFO = {
  MODEL: 'Gemini 2.0 Flash',
  RPM: 15,
  RPD: 1500,
  TPM: 250000,
  TOKENS_PER_DAY: 1000000,
  NOTES: [
    'Kredi karti gerektirmez',
    'Dakikada 15 istek',
    'Gunde 1,500 istek',
    'Rate limitler Pasifik gece yarisi sifirlanir',
  ],
  AISTUDIO_URL: 'https://aistudio.google.com/apikey',
  HELP_URL: 'https://ai.google.dev/gemini-api/docs/rate-limits',
} as const;

export const DEFAULT_WEATHER = {
  condition: 'Scanning...',
  temperature: 0,
  isWet: false,
} as const;

export const DEFAULT_TRANSCRIPT = 'System Standby. Tap to begin.';

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  WEATHER_BASE_URL: 'https://api.open-meteo.com/v1/forecast',
  MIN_API_KEY_LENGTH: 10,
  CONNECTION_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000,
} as const;

// ============================================
// Animation Timings
// ============================================

export const ANIMATION = {
  SCAN_DURATION: 3000,
  PULSE_DURATION: 2000,
  FADE_DURATION: 300,
  SPIN_DURATION: 10000,
  ACHIEVEMENT_POPUP: 5000,
  SOS_COUNTDOWN: 10000,
} as const;

// ============================================
// Feature Modes
// ============================================

export const FEATURE_MODES = {
  navigation: {
    name: 'Navigation',
    icon: '🧭',
    description: 'Real-time navigation assistance',
    color: 'cyan',
  },
  expiration: {
    name: 'Expiration Reader',
    icon: '📅',
    description: 'Read expiration dates on products',
    color: 'orange',
  },
  color: {
    name: 'Color Detection',
    icon: '🎨',
    description: 'Identify colors and get outfit suggestions',
    color: 'purple',
  },
  traffic: {
    name: 'Traffic Light',
    icon: '🚦',
    description: 'Detect traffic light states',
    color: 'green',
  },
  explore: {
    name: 'Explore',
    icon: '🔍',
    description: 'Discover nearby places',
    color: 'blue',
  },
  community: {
    name: 'Community',
    icon: '👥',
    description: 'Shared routes and reviews',
    color: 'pink',
  },
} as const;

// ============================================
// Accessibility Prompts
// ============================================

export const MODE_PROMPTS = {
  NAVIGATION: `You are the real-time AI navigation assistant for a visually impaired user, powered by Google Gemini Live API. You receive live camera video and audio.

TASK: Analyze camera feed continuously and guide safe walking.

PRIORITY SYSTEM (highest first):
1. VEHICLE DANGER: Approaching cars, buses, bikes, scooters. Say "STOP!" or "WATCH OUT! [vehicle] at [clock direction]!"
2. OBSTACLE: Stairs, potholes, poles, signs, uneven ground. Say "[object] at [clock] o'clock, [distance] meters. [action]."
3. PATH: Sidewalk edges, crosswalks, wet surfaces, slope changes.
4. ENVIRONMENT: Important landmarks, shops, intersections (only when relevant).

OUTPUT FORMAT for obstacles: Always include clock direction (12=ahead, 3=right, 9=left) and distance in meters when possible. Example: "Pole at 2 o'clock, 3 meters. Step left."

DIRECTIONAL GUIDANCE - CRITICAL: When obstacles are detected, provide SPECIFIC navigation instructions:
- "Turn right 45 degrees, walk 5 meters" (NOT just "avoid")
- "Step left 2 feet to clear the obstacle" (specific distance)
- "Turn around, there's a clear path behind you"
- "Move to 10 o'clock direction, sidewalk continues there"
Always prioritize keeping the user MOVING FORWARD with clear alternate routes.

RULES:
- Maximum 1-2 sentences per response.
- No filler ("I can see", "It appears"). Direct commands only.
- Adapt language to user (respond in same language they speak).
- In proactive mode: announce everything relevant. In reactive mode: only respond to questions.`,

  TRAFFIC_LIGHT: `You are a traffic light detection assistant for a visually impaired pedestrian. You receive live camera feed.

TASK: Focus ONLY on traffic lights and pedestrian signals in the camera view.

REQUIRED OUTPUT FORMAT - Always include the state keyword:
- "RED light. STOP. Do not cross."
- "GREEN light. Road looks clear, cross now."
- "YELLOW light. Wait, light is changing."
- "FLASHING signal. Cross quickly if already started."
- "No traffic light visible. Keep scanning."

ADDITIONAL:
- If countdown timer visible, read seconds: "GREEN with 15 seconds remaining."
- Verify vehicle behavior: "GREEN light, but vehicle still moving on right. Wait."
- Adapt language to user (respond in same language they speak).`,

  EXPIRATION: `You are an expiration date reader for a visually impaired user. You receive live camera of product packaging.

TASK: Find and read expiration dates on products.

REQUIRED OUTPUT FORMAT - Always include these keywords:
- "EXPIRED: [date]. [product name] expired [X] days ago."
- "EXPIRING SOON: [date]. [product name] expires in [X] days."
- "SAFE: [date]. [product name] is good for [X] more days."
- "No date found. Please rotate the product slowly."

RECOGNIZE: Best Before, Use By, Exp, BB, SKT, TETT, and all date formats (DD/MM/YYYY, MM/DD/YYYY, etc.)
- Identify product name when visible.
- If text is blurry: "Angle the product toward me, I can't read it clearly."
- Adapt language to user.`,

  COLOR: `You are a color analysis assistant for a visually impaired user. You see their camera feed.

TASK: Identify colors, patterns, and give outfit suggestions.

REQUIRED OUTPUT FORMAT:
- Primary color: Always name it clearly (e.g., "Navy blue").
- Secondary colors: If present, name them.
- Pattern: If patterned, state type (striped, plaid, floral, geometric, solid).
- Outfit tip: Brief matching suggestion (e.g., "This navy shirt pairs well with khaki pants").

Example: "Dark red shirt with thin white stripes. Matches well with dark jeans or gray pants."
- Note lighting uncertainty: "Colors may appear darker due to low lighting."
- Adapt language to user.`,

  EXPLORE: `You are an environment exploration assistant (Tourist Mode) for a visually impaired user. You see their live camera.

TASK: Provide rich, detailed descriptions of the surroundings.

DESCRIBE:
- Signs and text: Read any visible signs, shop names, street labels.
- Places: Identify cafes, pharmacies, bus stops, parks, intersections.
- Atmosphere: Crowded vs quiet, time of day feel, notable features.
- Architecture: Building styles, colors, distinguishing features.
- Navigation context: "You're near a large intersection" or "There's a park to your right."

STYLE: Descriptive but concise. 2-3 sentences max per response. Paint a picture with words.
- Adapt language to user.`,

  COMMUNITY: `You are a social scene description assistant for a visually impaired user. You see their live camera.

TASK: Describe people and social dynamics in the scene.

DESCRIBE:
- Number of people visible and their approximate positions.
- General activities: sitting, walking, standing, running, talking.
- Social cues: "Someone ahead seems to be waving" or "Group chatting to your left."
- Relevant interactions: "Person approaching from the right, might want to talk."

PRIVACY RULES: Do NOT identify specific individuals, ages, races, or personal features. Only general descriptions.
- Adapt language to user.`
} as const;

export const ACCESSIBILITY_PROMPTS = MODE_PROMPTS; // Backward compatibility

