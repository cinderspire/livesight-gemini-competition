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
  FPS: 4,              // Increased for better perception
  WIDTH: 800,          // Higher resolution
  HEIGHT: 450,         // Higher resolution
  JPEG_QUALITY: 0.7,   // Better quality
  CAMERA_WIDTH: 1280,
  CAMERA_HEIGHT: 720,
  CAMERA_FPS: 30,
} as const;

// ============================================
// AI Model Configuration
// ============================================

export const AI_CONFIG = {
  MODEL_NAME: 'gemini-2.0-flash-exp',
  VOICE_NAME: 'Kore',
  API_VERSION: 'v1alpha',
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
// Gamification Configuration
// ============================================

export const GAMIFICATION_CONFIG = {
  POINTS: {
    NAVIGATION_COMPLETE: 10,
    ROUTE_SHARED: 25,
    HAZARD_REPORTED: 15,
    REVIEW_WRITTEN: 20,
    HELP_GIVEN: 30,
    DAILY_LOGIN: 5,
    STREAK_BONUS: 10, // per day
    FIRST_NAVIGATION: 50,
    ACHIEVEMENT_UNLOCK: 100,
  },
  LEVELS: [
    { level: 1, name: 'Beginner', minPoints: 0 },
    { level: 2, name: 'Explorer', minPoints: 100 },
    { level: 3, name: 'Navigator', minPoints: 300 },
    { level: 4, name: 'Pathfinder', minPoints: 600 },
    { level: 5, name: 'Trailblazer', minPoints: 1000 },
    { level: 6, name: 'Pioneer', minPoints: 1500 },
    { level: 7, name: 'Expert', minPoints: 2500 },
    { level: 8, name: 'Master', minPoints: 4000 },
    { level: 9, name: 'Legend', minPoints: 6000 },
    { level: 10, name: 'Champion', minPoints: 10000 },
  ],
  BADGES: [
    { id: 'first_steps', name: 'First Steps', description: 'Complete your first navigation', icon: '👣', requirement: 1, type: 'navigation' },
    { id: 'explorer_10', name: 'Explorer', description: 'Complete 10 navigations', icon: '🧭', requirement: 10, type: 'navigation' },
    { id: 'explorer_50', name: 'Veteran Explorer', description: 'Complete 50 navigations', icon: '🗺️', requirement: 50, type: 'navigation' },
    { id: 'explorer_100', name: 'Master Explorer', description: 'Complete 100 navigations', icon: '🏆', requirement: 100, type: 'navigation' },
    { id: 'helper', name: 'Helpful Hand', description: 'Help another user', icon: '🤝', requirement: 1, type: 'social' },
    { id: 'community_hero', name: 'Community Hero', description: 'Help 10 users', icon: '🦸', requirement: 10, type: 'social' },
    { id: 'route_creator', name: 'Route Creator', description: 'Share your first route', icon: '📍', requirement: 1, type: 'community' },
    { id: 'hazard_spotter', name: 'Hazard Spotter', description: 'Report 5 hazards', icon: '⚠️', requirement: 5, type: 'community' },
    { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '🔥', requirement: 7, type: 'streak' },
    { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', icon: '💫', requirement: 30, type: 'streak' },
    { id: 'beta_tester', name: 'Beta Pioneer', description: 'Early adopter', icon: '💎', requirement: 1, type: 'special' },
  ],
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
} as const;

export const DEFAULT_WEATHER = {
  condition: 'Scanning...',
  temperature: 0,
  isWet: false,
} as const;

export const DEFAULT_TRANSCRIPT = 'System Standby. Tap to begin.';

export const DEFAULT_STATS = {
  totalNavigations: 0,
  totalDistance: 0,
  routesShared: 0,
  helpGiven: 0,
  helpReceived: 0,
  currentStreak: 0,
  longestStreak: 0,
  points: 0,
  level: 1,
  badges: [],
} as const;

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
  NAVIGATION: `
    Sen görme engelli kullanıcılar için "Göz" olan yapay zeka asistanısın.
    GÖREV: Kameradaki görüntüyü analiz et ve kullanıcının güvenle yürümesini sağla.
    
    ÖNCELİKLER:
    1. 🚨 TEHLİKE (Acil): Yaklaşan araçlar, bisikletler, koşucular. "DUR!", "DİKKAT!" diye bağır.
    2. 🛑 ENGEL (Yüksek): Merdiven, çukur, direk, alçak tabela. Yön ve mesafe ver (örn: "Saat 12 yönünde 2 metrede direk").
    3. 🛣️ YOL (Orta): Kaldırım durumu, yaya geçidi, zemin ıslaklığı.
    4. 🏢 ÇEVRE: Mağazalar, binalar, önemli nirengi noktaları.

    KONUŞMA TARZI:
    - Kısa, net ve emir kipi kullan.
    - Sadece önemli değişiklikleri söyle.
    - "Görüyorum ki..." gibi giriş eylemleri yapma. Direkt konuya gir.
    - Yönleri saat sistemine göre ver (Saat 12: Ön, Saat 3: Sağ, Saat 9: Sol).
  `,
  
  TRAFFIC_LIGHT: `
    GÖREV: Sadece trafik ışıklarına odaklan ve yaya geçidini yönet.
    
    DURUMLAR:
    🔴 KIRMIZI: "DUR! Işık Kırmızı."
    🟢 YEŞİL: "YEŞİL Yandı. Önce yolu kontrol et, sonra geç."
    🟡 SARI/YANIP SÖNEN: "Bekle. Işık değişiyor."
    ⚫ YOK: "Trafik ışığı bulunamadı."
    
    EK BİLGİLER:
    - Geri sayım sayacı varsa saniyeyi oku.
    - Araçların durup durmadığını kontrol et. "Yeşil yandı ama araçlar hala hareketli" gibi uyar.
  `,

  EXPIRATION: `
    GÖREV: Ürün üzerindeki son kullanma tarihini bul ve oku.
    
    HEDEFLER:
    - Tarih formatlarını (SKT, TETT, Exp, Use By) tanı.
    - Tarihi bugünün tarihiyle karşılaştırıp "Geçmiş", "Yaklaşıyor" veya "Güvenli" de.
    - Ürünün ne olduğunu da belirt (örn: "Süt, tarihi 2 gün geçmiş!").
    - Metni okuyamıyorsan "Tarihi göremiyorum, ürünü biraz çevir" de.
  `,

  COLOR: `
    GÖREV: Renk ve desen analizi yap.
    
    DETAYLAR:
    - Ana rengi ve varsa ikincil renkleri söyle.
    - Deseni tanımla (Çizgili, kareli, çiçekli).
    - Kıyafet uyumu hakkında kısa yorum yap (örn: "Bu lacivert gömlek, gri pantolonla uyar").
    - Işık koşullarından emin değilsen belirt.
  `,

  EXPLORE: `
    GÖREV: Detaylı çevre keşfi (Turist Modu).
    
    ANLATIM:
    - Etraftaki tabelaları oku.
    - Mekan isimlerini (Kafe, Eczane, Durak) söyle.
    - Ortamın atmosferini betimle (Kalabalık, sakin, ağaçlıklı).
    - Kullanıcının "Burada ne var?" sorusunu cevaplıyormuş gibi detaylı anlat.
  `,
  
  COMMUNITY: `
    GÖREV: Sosyal etkileşim ve insan betimleme.
    
    ANALİZ:
    - Ortamdaki insan sayısını tahmin et.
    - İnsanların genel duygu durumunu (mutlu, telaşlı) ve aktivitelerini (oturuyor, koşuyor) söyle.
    - Kişisel verileri (yüz tanıma) sakla, sadece genel tanımlar yap (örn: "Karşında sana el sallayan biri var").
  `
} as const;

export const ACCESSIBILITY_PROMPTS = MODE_PROMPTS; // Backward compatibility

