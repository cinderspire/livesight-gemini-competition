import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import type {
  UserSettings,
  WeatherContext,
  ConnectionStatus,
  HazardLog,
  LocationData,
  RiskLevel,
  ObstacleCategory,
  LiveSightContextType,
  UserStats,
  EmergencyContact,
  ActiveFeature,
  TrafficLightDetection,
  ColorDetectionResult,
  ExpirationDateResult
} from '../types';
import { fetchWeather } from '../services/weatherService';
import { DEFAULT_SETTINGS, DEFAULT_WEATHER, DEFAULT_TRANSCRIPT, UI_CONFIG, GAMIFICATION_CONFIG } from '../constants';

// Create context with undefined default
const LiveSightContext = createContext<LiveSightContextType | undefined>(undefined);

// Default user stats
const DEFAULT_USER_STATS: UserStats = {
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
};

// Default emergency contacts
const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [];

interface LiveSightProviderProps {
  children: ReactNode;
}

/**
 * LiveSight Context Provider
 * Manages global application state
 */
export function LiveSightProvider({ children }: LiveSightProviderProps): React.JSX.Element {
  // User Settings State
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS as UserSettings);

  // Environment State
  const [weather, setWeather] = useState<WeatherContext>(DEFAULT_WEATHER as WeatherContext);
  const [location, setLocation] = useState<LocationData | null>(null);

  // Connection State
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  // UI State
  const [logs, setLogs] = useState<HazardLog[]>([]);
  const [transcript, setTranscript] = useState<string>(DEFAULT_TRANSCRIPT);
  const [volume, setVolume] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);

  // New Feature State
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_USER_STATS);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(DEFAULT_EMERGENCY_CONTACTS);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>('navigation');

  // Detection State
  const [lastTrafficDetection, setLastTrafficDetection] = useState<TrafficLightDetection | null>(null);
  const [lastColorDetection, setLastColorDetection] = useState<ColorDetectionResult | null>(null);
  const [lastExpirationDetection, setLastExpirationDetection] = useState<ExpirationDateResult | null>(null);

  /**
   * Update settings partially
   */
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Add a new hazard log entry
   */
  const addLog = useCallback((description: string, riskLevel: RiskLevel, category?: ObstacleCategory) => {
    const newLog: HazardLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      description,
      riskLevel,
      category,
    };

    setLogs(prev => [newLog, ...prev].slice(0, UI_CONFIG.MAX_LOGS));
  }, []);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  /**
   * Update user stats partially
   */
  const updateStats = useCallback((newStats: Partial<UserStats>) => {
    setUserStats(prev => {
      const updated = { ...prev, ...newStats };
      // Calculate level based on points
      const levelConfig = GAMIFICATION_CONFIG.LEVELS;
      for (let i = levelConfig.length - 1; i >= 0; i--) {
        const level = levelConfig[i];
        if (level && updated.points >= level.minPoints) {
          updated.level = level.level;
          break;
        }
      }
      return updated;
    });
  }, []);

  /**
   * Continuous GPS tracking + weather fetch
   */
  useEffect(() => {
    if (!navigator.geolocation) {
      setWeather({ ...DEFAULT_WEATHER, condition: 'GPS Unavailable' } as WeatherContext);
      return;
    }

    let weatherFetched = false;

    // Start continuous watching for real-time navigation
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy, heading, speed } = position.coords;
        setLocation({
          lat: latitude,
          lon: longitude,
          accuracy: accuracy ?? undefined,
          heading: heading ?? undefined,
          speed: speed ?? undefined,
          timestamp: position.timestamp,
        });

        // Fetch weather once on first position
        if (!weatherFetched) {
          weatherFetched = true;
          try {
            const weatherData = await fetchWeather(latitude, longitude);
            setWeather(weatherData);
          } catch (error) {
            console.error('[Context] Weather fetch failed:', error);
            setWeather({ ...DEFAULT_WEATHER, condition: 'Unavailable' } as WeatherContext);
          }
        }
      },
      (error) => {
        console.warn('[Context] Geolocation error:', error.message);
        setWeather({ ...DEFAULT_WEATHER, condition: 'No GPS' } as WeatherContext);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000, // Fresh positions for navigation
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  /**
   * Monitor online/offline status
   */
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Monitor battery level
   */
  useEffect(() => {
    const getBattery = async () => {
      try {
        // @ts-expect-error - getBattery is not in standard types
        if (navigator.getBattery) {
          // @ts-expect-error - getBattery is not in standard types
          const battery = await navigator.getBattery();
          setBatteryLevel(Math.round(battery.level * 100));

          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        }
      } catch (error) {
        console.warn('[Context] Battery API not available:', error);
      }
    };

    getBattery();
  }, []);

  /**
   * Persist user stats to localStorage
   */
  useEffect(() => {
    const savedStats = localStorage.getItem('livesight_user_stats');
    if (savedStats) {
      try {
        setUserStats(JSON.parse(savedStats));
      } catch (e) {
        console.warn('[Context] Failed to parse saved stats:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('livesight_user_stats', JSON.stringify(userStats));
  }, [userStats]);

  /**
   * Persist emergency contacts to localStorage
   */
  useEffect(() => {
    const savedContacts = localStorage.getItem('livesight_emergency_contacts');
    if (savedContacts) {
      try {
        setEmergencyContacts(JSON.parse(savedContacts));
      } catch (e) {
        console.warn('[Context] Failed to parse saved contacts:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('livesight_emergency_contacts', JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  /**
   * Memoized context value
   */
  const contextValue = useMemo<LiveSightContextType>(() => ({
    // Core state
    settings,
    updateSettings,
    weather,
    location,
    status,
    setStatus,
    logs,
    addLog,
    clearLogs,
    transcript,
    setTranscript,
    volume,
    setVolume,
    isMicMuted,
    setIsMicMuted,
    // New state
    userStats,
    updateStats,
    emergencyContacts,
    setEmergencyContacts,
    isOffline,
    batteryLevel,
    activeFeature,
    setActiveFeature,
    // Detection State
    lastTrafficDetection,
    setLastTrafficDetection,
    lastColorDetection,
    setLastColorDetection,
    lastExpirationDetection,
    setLastExpirationDetection,
  }), [
    settings,
    updateSettings,
    weather,
    location,
    status,
    logs,
    addLog,
    clearLogs,
    transcript,
    volume,
    isMicMuted,
    // New dependencies
    userStats,
    updateStats,
    emergencyContacts,
    isOffline,
    batteryLevel,
    activeFeature,
    // Detection dependencies
    lastTrafficDetection,
    lastColorDetection,
    lastExpirationDetection,
  ]);

  return (
    <LiveSightContext.Provider value={contextValue}>
      {children}
    </LiveSightContext.Provider>
  );
}

/**
 * Custom hook to access LiveSight context
 * @throws Error if used outside of LiveSightProvider
 */
export function useLiveSight(): LiveSightContextType {
  const context = useContext(LiveSightContext);

  if (context === undefined) {
    throw new Error('useLiveSight must be used within a LiveSightProvider');
  }

  return context;
}

export default LiveSightContext;
