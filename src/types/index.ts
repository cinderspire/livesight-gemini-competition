/**
 * LiveSight Core Type Definitions
 * Comprehensive types for all features
 */

// ============================================
// User Settings Types
// ============================================

export type MobilityAid = 'none' | 'cane' | 'guide_dog' | 'wheelchair';
export type VoiceSpeed = 'slow' | 'normal' | 'fast';
export type ContrastMode = 'high' | 'normal';
export type VoiceType = 'male' | 'female' | 'neutral';
export type Language = 'en' | 'tr' | 'es' | 'de' | 'fr' | 'ar' | 'zh' | 'ja';

export interface UserSettings {
  mobilityAid: MobilityAid;
  voiceSpeed: VoiceSpeed;
  contrastMode: ContrastMode;
  proactiveMode: boolean;
  // New settings
  voiceType: VoiceType;
  language: Language;
  hapticFeedback: boolean;
  spatialAudio: boolean;
  offlineMode: boolean;
  autoSOS: boolean;
  batteryAlert: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
}

// ============================================
// Hazard & Detection Types
// ============================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ObstacleCategory = 'ground' | 'overhead' | 'moving' | 'surface' | 'drop' | 'vehicle';

export interface HazardLog {
  id: string;
  timestamp: number;
  description: string;
  riskLevel: RiskLevel;
  category?: ObstacleCategory;
  distance?: number;
  direction?: string;
}

export interface ObstacleDetection {
  id: string;
  type: string;
  category: ObstacleCategory;
  riskLevel: RiskLevel;
  distance: number; // meters
  direction: ClockDirection;
  boundingBox?: BoundingBox;
  confidence: number;
}

export type ClockDirection = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================
// Traffic Light Types
// ============================================

export type TrafficLightState = 'red' | 'yellow' | 'green' | 'unknown' | 'flashing';

export interface TrafficLightDetection {
  state: TrafficLightState;
  confidence: number;
  countdown?: number; // seconds remaining
  pedestrianSignal: boolean;
  direction: ClockDirection;
}

// ============================================
// Color Detection Types
// ============================================

export interface ColorInfo {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  category: 'warm' | 'cool' | 'neutral';
  matchingSuggestions?: string[];
}

export interface ColorDetectionResult {
  primary: ColorInfo;
  secondary?: ColorInfo;
  pattern?: 'solid' | 'striped' | 'plaid' | 'floral' | 'geometric';
  material?: string;
  suggestion?: string;
}

// ============================================
// Expiration Date Types
// ============================================

export interface ExpirationDateResult {
  found: boolean;
  date?: Date;
  dateString?: string;
  daysRemaining?: number;
  status: 'valid' | 'expiring_soon' | 'expired' | 'not_found';
  productName?: string;
  confidence: number;
}

// ============================================
// SOS / Emergency Types
// ============================================

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
}

export interface SOSEvent {
  id: string;
  timestamp: number;
  location: LocationData;
  batteryLevel: number;
  status: 'active' | 'resolved' | 'cancelled';
  contacts: string[];
  message?: string;
}

// ============================================
// Gamification Types
// ============================================

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: number;
  progress?: number;
  target?: number;
}

export interface UserStats {
  totalNavigations: number;
  totalDistance: number; // meters
  routesShared: number;
  helpGiven: number;
  helpReceived: number;
  currentStreak: number;
  longestStreak: number;
  points: number;
  level: number;
  badges: UserBadge[];
}

export interface Achievement {
  id: string;
  type: 'navigation' | 'community' | 'learning' | 'social';
  title: string;
  description: string;
  points: number;
  icon: string;
  requirement: number;
}

// ============================================
// Community Types
// ============================================

export interface CommunityRoute {
  id: string;
  name: string;
  description: string;
  startLocation: LocationData;
  endLocation: LocationData;
  waypoints: LocationData[];
  distance: number;
  estimatedTime: number;
  accessibility: AccessibilityRating;
  reviews: RouteReview[];
  hazards: RouteHazard[];
  createdBy: string;
  createdAt: number;
  verifiedBy: string[];
}

export interface RouteReview {
  id: string;
  userId: string;
  userName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  timestamp: number;
  helpful: number;
}

export interface RouteHazard {
  id: string;
  location: LocationData;
  type: string;
  description: string;
  reportedBy: string;
  reportedAt: number;
  verified: boolean;
  resolved: boolean;
}

export interface AccessibilityRating {
  overall: number;
  surfaceQuality: number;
  obstacles: number;
  lighting: number;
  crowding: number;
  trafficSafety: number;
}

export interface PlaceAccessibility {
  placeId: string;
  name: string;
  rating: AccessibilityRating;
  features: string[];
  reviews: RouteReview[];
  lastUpdated: number;
}

// ============================================
// Connection Types
// ============================================

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'offline';

// ============================================
// Weather Types
// ============================================

export interface WeatherContext {
  condition: string;
  temperature: number;
  isWet: boolean;
  locationName?: string;
  humidity?: number;
  windSpeed?: number;
  visibility?: string;
  surfaceCondition?: 'dry' | 'wet' | 'icy' | 'flooded';
}

// ============================================
// Location Types
// ============================================

export interface LocationData {
  lat: number;
  lon: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
  address?: string;
}

export interface PlaceInfo {
  id: string;
  name: string;
  address: string;
  location: LocationData;
  distance: number;
  category: string;
  rating?: number;
  openNow?: boolean;
  openingHours?: string[];
  phone?: string;
  website?: string;
  accessibility?: PlaceAccessibility;
}

// ============================================
// Voice Command Types
// ============================================

export type VoiceCommand =
  | 'OPEN_SETTINGS'
  | 'CLOSE_SETTINGS'
  | 'OPEN_LOGS'
  | 'CLOSE_LOGS'
  | 'MUTE'
  | 'UNMUTE'
  | 'MODE_PROACTIVE'
  | 'MODE_PASSIVE'
  | 'OPEN_HELP'
  | 'CLOSE_HELP'
  // New commands
  | 'READ_EXPIRATION'
  | 'CHECK_TRAFFIC_LIGHT'
  | 'DESCRIBE_COLOR'
  | 'SEND_SOS'
  | 'CANCEL_SOS'
  | 'FIND_NEARBY'
  | 'NAVIGATE_TO'
  | 'REPORT_HAZARD'
  | 'SHARE_LOCATION'
  | 'BATTERY_STATUS'
  | 'WEATHER_UPDATE'
  | 'SYSTEM_STATUS';

// ============================================
// Service Callback Types
// ============================================

export type VehicleDangerLevel = 'critical' | 'warning' | 'awareness';

export interface LiveSightCallbacks {
  onTranscript: (text: string, isUser: boolean) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  onHazard: (text: string) => void;
  onVolume: (level: number) => void;
  onCommand: (command: VoiceCommand) => void;
  // Vehicle danger callback
  onVehicleDanger?: (level: VehicleDangerLevel, description: string) => void;
  // Fall detection callback
  onFallDetected?: () => void;
  // Other callbacks
  onObstacleDetected?: (obstacle: ObstacleDetection) => void;
  onTrafficLight?: (detection: TrafficLightDetection) => void;
  onColorDetected?: (result: ColorDetectionResult) => void;
  onExpirationDate?: (result: ExpirationDateResult) => void;
  onSOSTriggered?: (event: SOSEvent) => void;
  onAchievement?: (achievement: Achievement) => void;
  // Function calling callbacks
  onModeSwitch?: (mode: string, reason?: string) => void;
  onEmergency?: (reason: string) => void;
}

// ============================================
// Audio Types
// ============================================

export interface AudioBlob {
  data: string;
  mimeType: string;
}

export interface SpatialAudioCue {
  type: 'direction' | 'obstacle' | 'poi' | 'alert';
  angle: number; // 0-360 degrees
  distance: number; // meters
  intensity: number; // 0-1
  sound: string;
}

// ============================================
// Offline Types
// ============================================

export interface OfflineCache {
  maps: CachedArea[];
  routes: CommunityRoute[];
  places: PlaceInfo[];
  lastSync: number;
}

export interface CachedArea {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  downloadedAt: number;
  size: number;
}

// ============================================
// Context Types
// ============================================

export interface LiveSightContextType {
  // Core state
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  weather: WeatherContext;
  location: LocationData | null;
  status: ConnectionStatus;
  setStatus: (s: ConnectionStatus) => void;
  logs: HazardLog[];
  addLog: (description: string, riskLevel: RiskLevel, category?: ObstacleCategory) => void;
  clearLogs: () => void;
  transcript: string;
  setTranscript: (t: string) => void;
  volume: number;
  setVolume: (v: number) => void;
  isMicMuted: boolean;
  setIsMicMuted: (m: boolean) => void;

  // New state
  emergencyContacts: EmergencyContact[];
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  isOffline: boolean;
  batteryLevel: number;
  activeFeature: ActiveFeature;
  setActiveFeature: (feature: ActiveFeature) => void;

  // Detection State (for HUD)
  lastTrafficDetection: TrafficLightDetection | null;
  setLastTrafficDetection: (d: TrafficLightDetection | null) => void;
  lastColorDetection: ColorDetectionResult | null;
  setLastColorDetection: (d: ColorDetectionResult | null) => void;
  lastExpirationDetection: ExpirationDateResult | null;
  setLastExpirationDetection: (d: ExpirationDateResult | null) => void;
}

export type ActiveFeature =
  | 'navigation'
  | 'expiration'
  | 'color'
  | 'traffic'
  | 'explore'
  | 'community'
  | 'settings';

// ============================================
// Component Props Types
// ============================================

export interface CameraFeedProps {
  onVideoReady: (video: HTMLVideoElement) => void;
  isActive: boolean;
  isScanning: boolean;
  activeFeature?: ActiveFeature;
  overlayMode?: 'default' | 'expiration' | 'color' | 'traffic' | 'obstacle';
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AudioVisualizerProps {
  isActive: boolean;
}

export interface SystemToastProps {
  message: string | null;
  onClear: () => void;
  type?: 'info' | 'success' | 'warning' | 'error' | 'achievement';
}

export interface CommandHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Feature-specific props
export interface SOSButtonProps {
  onTrigger: () => void;
  isActive: boolean;
}

export interface FeatureSelectorProps {
  activeFeature: ActiveFeature;
  onSelect: (feature: ActiveFeature) => void;
}

export interface BadgeDisplayProps {
  badge: UserBadge;
  size?: 'small' | 'medium' | 'large';
}

export interface StatsCardProps {
  stats: UserStats;
}
