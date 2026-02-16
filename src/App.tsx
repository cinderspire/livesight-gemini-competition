import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLiveSight } from './contexts/LiveSightContext';
import { LiveSightService, VoiceCommand } from './services/liveSightService';
import {
  CameraFeed,
  SettingsModal,
  AudioVisualizer,
  SystemToast,
  Compass,
  CommandHelp,
  SOSButton,
  EmergencyContactsModal,
  StatusBar,
  FeatureSelector,
  Onboarding,
  AdInterstitial,
} from './components';
import { useHaptic } from './hooks/useHaptic';
import { usePermissions } from './hooks/usePermissions';
import { useFallDetection } from './hooks/useFallDetection';
import { DEFAULT_TRANSCRIPT } from './constants';
import { loadApiKey, saveApiKey } from './utils/apiKeyUtils';
import * as adService from './services/adService';
import type { SOSEvent, VehicleDangerLevel, TrafficLightDetection, ColorDetectionResult, ExpirationDateResult } from './types';

// Import feature services
import { notifyContacts, createSOSEvent } from './features/sos/sosService';
import type { ActiveFeature } from './types';

/**
 * Main LiveSight Application Component
 */
const LiveSightApp: React.FC = () => {
  const {
    settings,
    updateSettings,
    weather,
    location,
    status,
    setStatus,
    transcript,
    setTranscript,
    logs,
    addLog,
    setVolume,
    isMicMuted,
    setIsMicMuted,
    emergencyContacts,
    activeFeature,
    setActiveFeature,
    setLastTrafficDetection,
    setLastColorDetection,
    setLastExpirationDetection,
    batteryLevel,
  } = useLiveSight();

  // Local State
  const [isLive, setIsLive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileLogs, setShowMobileLogs] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'warning' | 'error' | 'achievement'>('info');
  const [apiKey, setApiKey] = useState<string>(() => loadApiKey());
  const [showAd, setShowAd] = useState(false);
  const [isSOS, setIsSOS] = useState(false);

  // Initialize ad service
  useEffect(() => {
    adService.initialize();
  }, []);

  // Demo mode: ?demo=video_name.mp4 in URL or localStorage 'livesight_demo'
  // DEMO_MODE: Set to a video filename to enable, undefined to disable
  const DEMO_MODE: string | null = null; // Set to null for production
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [demoVideoUrl, _setDemoVideoUrl] = useState<string | undefined>(() => {
    if (DEMO_MODE) return `/demo/${DEMO_MODE}`;
    try {
      const params = new URLSearchParams(window.location.search);
      const demoParam = params.get('demo');
      if (demoParam) return `/demo/${demoParam}`;
      const stored = localStorage.getItem('livesight_demo');
      if (stored) return `/demo/${stored}`;
    } catch { /* empty */ }
    return undefined;
  });

  // Refs
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const serviceRef = useRef<LiveSightService | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const isStartingRef = useRef<boolean>(false);
  const hasAutoStartedRef = useRef<boolean>(false);

  // Hooks
  const {
    hazardAlert,
    startFeedback,
    successFeedback,
    sosAlert,
    vehicleCritical,
    vehicleWarning,
    vehicleAwareness,
    fallDetected: fallHaptic,
  } = useHaptic();
  const { permissions, requestPermissions } = usePermissions();
  // Request all permissions immediately on mount
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);
  const {
    startMonitoring: startFallMonitoring,
    stopMonitoring: stopFallMonitoring,
    onFallDetected,
    onAutoSOS,
  } = useFallDetection();

  // Show toast helper
  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' | 'achievement' = 'info') => {
    setToastMessage(message);
    setToastType(type);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Sync Settings to Active Service
  useEffect(() => {
    if (serviceRef.current && isLive) {
      serviceRef.current.updateSettings(settings);
    }
  }, [settings, isLive]);

  // Sync Weather to Active Service
  useEffect(() => {
    if (serviceRef.current && isLive) {
      serviceRef.current.updateWeather(weather);
    }
  }, [weather, isLive]);

  // Sync Active Feature to Active Service
  useEffect(() => {
    if (serviceRef.current && isLive) {
      serviceRef.current.setActiveFeature(activeFeature);
    }
  }, [activeFeature, isLive]);

  // Sync GPS Location to Active Service
  useEffect(() => {
    if (serviceRef.current && isLive && location) {
      serviceRef.current.updateLocation(
        location.lat,
        location.lon,
        {
          accuracy: location.accuracy,
          heading: location.heading,
          speed: location.speed,
        }
      );
    }
  }, [location, isLive]);

  // Handle API key submission from Onboarding
  const handleApiKeySubmit = useCallback((key: string) => {
    setApiKey(key);
    saveApiKey(key);
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    const newState = !isMicMuted;
    setIsMicMuted(newState);
    if (serviceRef.current) {
      serviceRef.current.setMute(newState);
    }
    successFeedback();
  }, [isMicMuted, setIsMicMuted, successFeedback]);

  // Handle SOS Trigger
  const handleSOSTrigger = useCallback(async (event: SOSEvent) => {
    setIsSOS(true);
    sosAlert();
    addLog('EMERGENCY SOS TRIGGERED', 'critical');

    // Notify contacts
    if (emergencyContacts.length > 0) {
      await notifyContacts(event, emergencyContacts);
      showToast('Emergency contacts notified', 'warning');
    } else {
      showToast('No emergency contacts configured', 'error');
    }
  }, [emergencyContacts, sosAlert, addLog, showToast]);

  // Handle Vehicle Danger
  const handleVehicleDanger = useCallback((level: VehicleDangerLevel, description: string) => {


    switch (level) {
      case 'critical':
        vehicleCritical();
        addLog(`VEHICLE DANGER: ${description}`, 'critical', 'vehicle');
        showToast('URGENT: VEHICLE DANGER!', 'error');
        break;
      case 'warning':
        vehicleWarning();
        addLog(`Vehicle approaching: ${description}`, 'high', 'vehicle');
        break;
      case 'awareness':
        vehicleAwareness();
        addLog(`Vehicle detected: ${description}`, 'medium', 'vehicle');
        break;
    }
  }, [vehicleCritical, vehicleWarning, vehicleAwareness, addLog, showToast]);

  // Handle Fall Detection
  const handleFallDetected = useCallback(() => {
    fallHaptic();
    addLog('FALL DETECTED - Checking on user', 'critical');
    showToast('Fall detected! Are you okay?', 'warning');
  }, [fallHaptic, addLog, showToast]);

  // Handle Auto-SOS from fall detection
  const handleAutoSOS = useCallback(() => {
    if (emergencyContacts.length > 0) {
      const event = createSOSEvent(location, batteryLevel, emergencyContacts);
      handleSOSTrigger({ ...event, message: 'Fall detected - automatic SOS' });
    }
  }, [emergencyContacts, location, batteryLevel, handleSOSTrigger]);

  // Setup fall detection callbacks
  useEffect(() => {
    onFallDetected(handleFallDetected);
    onAutoSOS(handleAutoSOS);
  }, [onFallDetected, onAutoSOS, handleFallDetected, handleAutoSOS]);

  // Handle Voice Commands
  const handleCommand = useCallback((command: VoiceCommand) => {

    successFeedback();

    switch (command) {
      case 'OPEN_SETTINGS':
        setShowSettings(true);
        showToast('Settings Interface: OPEN', 'info');
        break;
      case 'CLOSE_SETTINGS':
        setShowSettings(false);
        showToast('Settings Interface: CLOSED', 'info');
        break;
      case 'OPEN_LOGS':
        setShowMobileLogs(true);
        showToast('Log Stream: VISIBLE', 'info');
        break;
      case 'CLOSE_LOGS':
        setShowMobileLogs(false);
        showToast('Log Stream: HIDDEN', 'info');
        break;
      case 'MUTE':
        setIsMicMuted(true);
        serviceRef.current?.setMute(true);
        showToast('Microphone: MUTED', 'info');
        break;
      case 'UNMUTE':
        setIsMicMuted(false);
        serviceRef.current?.setMute(false);
        showToast('Microphone: ACTIVE', 'info');
        break;
      case 'MODE_PROACTIVE':
        updateSettings({ proactiveMode: true });
        showToast('Mode: PROACTIVE', 'success');
        break;
      case 'MODE_PASSIVE':
        updateSettings({ proactiveMode: false });
        showToast('Mode: PASSIVE', 'info');
        break;
      case 'OPEN_HELP':
        setShowHelp(true);
        showToast('Command List: OPEN', 'info');
        break;
      case 'CLOSE_HELP':
        setShowHelp(false);
        showToast('Command List: CLOSED', 'info');
        break;
      case 'SEND_SOS':
        if (emergencyContacts.length > 0) {
          const event = createSOSEvent(location, batteryLevel, emergencyContacts);
          handleSOSTrigger(event);
        } else {
          showToast('No emergency contacts configured', 'error');
        }
        break;
      case 'CANCEL_SOS':
        showToast('SOS Cancelled', 'info');
        break;
      case 'FIND_NEARBY':
        setActiveFeature('explore');
        showToast('Explore Mode: ON', 'success');
        break;
      case 'NAVIGATE_TO':
        setActiveFeature('navigation');
        showToast('Navigation Mode: ON', 'success');
        break;
      case 'REPORT_HAZARD': {
        addLog('User reported hazard via voice', 'high');
        showToast('Hazard reported', 'success');
        break;
      }
      case 'SHARE_LOCATION':
        if (location) {
          const url = `https://maps.google.com/?q=${location.lat},${location.lon}`;
          navigator.clipboard?.writeText(url);
          showToast('Location copied to clipboard', 'success');
        } else {
          showToast('GPS not available', 'warning');
        }
        break;
      case 'BATTERY_STATUS':
        showToast(`Battery: ${batteryLevel}%`, batteryLevel < 20 ? 'warning' : 'info');
        break;
      case 'WEATHER_UPDATE':
        showToast(`${weather.condition}, ${weather.temperature}°C`, 'info');
        break;
      case 'SYSTEM_STATUS':
        showToast(`${status === 'connected' ? 'Connected' : status} | Battery: ${batteryLevel}% | ${weather.condition}`, 'info');
        break;
      case 'READ_EXPIRATION':
        setActiveFeature('expiration');
        showToast('Expiration Reader Mode: ON', 'success');
        break;
      case 'CHECK_TRAFFIC_LIGHT':
        setActiveFeature('traffic');
        showToast('Traffic Light Mode: ON', 'success');
        break;
      case 'DESCRIBE_COLOR':
        setActiveFeature('color');
        showToast('Color Detection Mode: ON', 'success');
        break;
    }
  }, [
    successFeedback,
    setIsMicMuted,
    updateSettings,
    emergencyContacts,
    location,
    batteryLevel,
    handleSOSTrigger,
    weather,
    showToast,
    setActiveFeature,
    addLog,
    status,
  ]);

  // Handle Traffic Light Detection
  const handleTrafficLight = useCallback((detection: TrafficLightDetection) => {
    setLastTrafficDetection(detection); // Update HUD state

    // Haptic Feedback
    if (detection.state === 'red') {
      hazardAlert();
    } else if (detection.state === 'green') {
      successFeedback();
    } else if (detection.state === 'yellow' || detection.state === 'flashing') {
      vehicleWarning();
    }

    const colorMap: Record<string, string> = {
      red: 'RED',
      green: 'GREEN',
      yellow: 'YELLOW',
      flashing: 'FLASHING',
      unknown: 'UNKNOWN'
    };
    const text = `Traffic Light: ${colorMap[detection.state] || detection.state}`;
    showToast(text, detection.state === 'green' ? 'success' : 'warning');
    addLog(text, detection.state === 'red' ? 'high' : 'medium', 'vehicle');
  }, [showToast, addLog]);

  // Handle Color Detection
  const handleColorDetected = useCallback((result: ColorDetectionResult) => {
    setLastColorDetection(result); // Update HUD state
    vehicleAwareness(); // Light tap
    const text = `Color: ${result.primary.name} ${result.pattern ? `(${result.pattern})` : ''}`;
    showToast(text, 'info');
    addLog(text, 'low');
  }, [showToast, addLog]);

  // Handle Expiration Date
  const handleExpirationDate = useCallback((result: ExpirationDateResult) => {
    setLastExpirationDetection(result); // Update HUD state
    if (result.status === 'not_found') return;

    let text = '';
    let type: 'success' | 'warning' | 'error' | 'info' = 'info';

    if (result.status === 'expired') {
      text = `EXPIRED: ${result.dateString}`;
      type = 'error';
      hazardAlert();
    } else if (result.status === 'expiring_soon') {
      text = `EXPIRING SOON: ${result.dateString}`;
      type = 'warning';
      vehicleWarning();
    } else {
      text = `FRESH: ${result.dateString}`;
      type = 'success';
      successFeedback();
    }

    showToast(text, type);
    addLog(text, result.status === 'expired' ? 'high' : 'low');
  }, [showToast, addLog]);

  // Start LiveSight (auto-requests permissions)
  const startLiveSight = useCallback(async () => {
    // Prevent duplicate starts
    if (isLive || isStartingRef.current || serviceRef.current) {

      return;
    }

    if (!apiKey) {
      setTranscript('No API key found. Please enter your Gemini API key.');
      return;
    }

    // Request permissions if not granted
    if (!permissions.allGranted) {
      const granted = await requestPermissions();
      if (!granted) {
        setTranscript('Camera & microphone permissions required. Please allow access and restart.');
        setStatus('error');
        return;
      }
    }

    if (!videoElementRef.current) {
      setTranscript('Waiting for camera...');
      return;
    }

    // Mark as starting
    isStartingRef.current = true;

    startFeedback();
    setIsLive(true);
    setStatus('connecting');
    setTranscript('Connecting...');

    const service = new LiveSightService(
      apiKey,
      videoElementRef.current,
      settings,
      weather,
      {
        onTranscript: (text, isUser) => {
          if (!isUser) setTranscript(text);
        },
        onStatusChange: (newStatus) => {
          setStatus(newStatus);
          if (newStatus === 'disconnected' || newStatus === 'error') {
            setIsLive(false);
            isStartingRef.current = false;
            stopFallMonitoring();
          } else if (newStatus === 'connected') {
            isStartingRef.current = false;
            startFallMonitoring();
          }
        },
        onHazard: (text) => {
          hazardAlert();
          addLog(text, 'high');
        },
        onVolume: (level) => {
          setVolume(level);
        },
        onCommand: handleCommand,
        onVehicleDanger: handleVehicleDanger, // Vehicle danger callback
        onTrafficLight: handleTrafficLight, // Traffic Light callback
        onColorDetected: handleColorDetected, // Color callback
        onExpirationDate: handleExpirationDate, // Expiration callback
        // Function calling callbacks
        onModeSwitch: (mode: string, reason?: string) => {
          setActiveFeature(mode as ActiveFeature);
          showToast(`AI switched to ${mode.toUpperCase()} mode${reason ? `: ${reason}` : ''}`, 'info');
        },
        onEmergency: (reason: string) => {
          if (emergencyContacts.length > 0) {
            const event = createSOSEvent(location, batteryLevel, emergencyContacts);
            handleSOSTrigger({ ...event, message: `AI Emergency: ${reason}` });
          }
          showToast(`EMERGENCY: ${reason}`, 'error');
        },
      }
    );

    serviceRef.current = service;
    service.start();
    service.setMute(isMicMuted);
  }, [
    isLive,
    apiKey,
    permissions.allGranted,
    requestPermissions,
    settings,
    weather,
    isMicMuted,
    setStatus,
    setTranscript,
    setVolume,
    startFeedback,
    hazardAlert,
    addLog,
    handleCommand,
    handleVehicleDanger,
    startFallMonitoring,
    stopFallMonitoring,
    setActiveFeature,
    handleSOSTrigger,
  ]);

  // Stop LiveSight
  const stopLiveSight = useCallback(() => {
    serviceRef.current?.stop();
    serviceRef.current = null;
    isStartingRef.current = false;
    setIsLive(false);
    setStatus('disconnected');
    setTranscript(DEFAULT_TRANSCRIPT);
    setVolume(0);
    stopFallMonitoring();
    successFeedback();

    // Show interstitial ad after session stops (not during SOS)
    if (!isSOS) {
      adService.showInterstitial().then((shouldShowWeb) => {
        if (shouldShowWeb && !adService.isNativePlatform()) {
          setShowAd(true);
        }
      });
    }
  }, [setStatus, setTranscript, setVolume, successFeedback, stopFallMonitoring, isSOS]);

  // Toggle LiveSight
  const toggleLiveSight = useCallback(() => {
    if (isLive) {
      stopLiveSight();
    } else {
      startLiveSight();
    }
  }, [isLive, startLiveSight, stopLiveSight]);

  // Stable ref for startLiveSight to avoid re-render loops
  const startLiveSightRef = useRef(startLiveSight);
  startLiveSightRef.current = startLiveSight;

  // Handle video ready - just store the ref
  const handleVideoReady = useCallback((el: HTMLVideoElement) => {
    videoElementRef.current = el;
  }, []);

  // Auto-start when ALL conditions are met: permissions + video + api key
  useEffect(() => {
    if (permissions.allGranted && apiKey && videoElementRef.current && !isLive && !hasAutoStartedRef.current && !isStartingRef.current) {
      hasAutoStartedRef.current = true;
      // Small delay to let camera stream stabilize
      const timer = setTimeout(() => {
        startLiveSightRef.current();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [permissions.allGranted, apiKey, isLive]);

  // Demo mode: full scenario with reactions, overlays, mode switches + VOICE
  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    if (demoVideoUrl && !isLive) {
      setIsLive(true);
      setStatus('connected');
      setTranscript('Scanning environment...');

      // TTS helper
      const speak = (text: string, rate = 1.0) => {
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'en-US';
          u.rate = rate;
          u.pitch = 1.0;
          u.volume = 1.0;
          // Try to pick a good voice
          const voices = window.speechSynthesis.getVoices();
          const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel'));
          if (preferred) u.voice = preferred;
          window.speechSynthesis.speak(u);
        } catch (e) {
          console.warn('[Demo] TTS failed:', e);
        }
      };

      // Preload voices
      window.speechSynthesis.getVoices();

      // Select scenario based on demo video filename
      const scenario = DEMO_MODE || '';
      let timeline: Array<{ t: number; fn: () => void }> = [];

      if (scenario.includes('demo1')) {
        // DEMO 1: NYC Greenwich Village — Sidewalk with parked cars, trees, stop sign
        timeline = [
          { t: 500, fn: () => { setTranscript('Scanning sidewalk ahead...'); speak('Scanning sidewalk ahead.'); }},
          { t: 3500, fn: () => { setTranscript('🚗 Parked minivan on your right. Stay left.'); addLog('Parked vehicle: minivan right side', 'medium'); showToast('🚗 Vehicle Right', 'warning'); speak('Parked minivan on your right. Stay on the left side of the sidewalk.'); }},
          { t: 7000, fn: () => { setTranscript('🌳 Tree pit ahead. Narrow path. Watch your step.'); addLog('Obstacle: Tree pit narrows path', 'high'); showToast('⚠️ Narrow Path', 'warning'); speak('Tree pit ahead. The path narrows here. Watch your step.', 1.1); }},
          { t: 11000, fn: () => { setTranscript('🛑 Stop sign at the corner. Intersection ahead.'); addLog('Stop sign detected', 'medium'); showToast('🛑 Stop Sign', 'info'); speak('Stop sign at the corner. Check for traffic before crossing.'); }},
        ];
      } else if (scenario.includes('demo2')) {
        // DEMO 2: Banff pedestrian crossing — traffic light, bus, tourists crossing
        timeline = [
          { t: 500, fn: () => { setActiveFeature('traffic'); setTranscript('🚦 Crosswalk detected ahead...'); showToast('Traffic Mode', 'success'); speak('Crosswalk detected ahead. Checking pedestrian signal.'); }},
          { t: 4000, fn: () => { setLastTrafficDetection({ state: 'green' as const, confidence: 0.96, pedestrianSignal: true, direction: 12 as const }); setTranscript('🟢 Walk signal is ON. Safe to cross.'); addLog('Pedestrian signal: WALK', 'low'); showToast('✅ WALK', 'success'); speak('Walk signal is on. Safe to cross. Other pedestrians are crossing too.'); }},
          { t: 8500, fn: () => { setTranscript('🚌 Bus stopped on the right. Stay in the crosswalk.'); addLog('Transit bus detected right side', 'medium'); showToast('🚌 Bus — Right', 'info'); speak('Transit bus stopped on your right. Stay in the crosswalk lines.'); }},
          { t: 12000, fn: () => { setActiveFeature('navigation'); setLastTrafficDetection(null); setTranscript('✅ Crossed safely. Sidewalk reached.'); showToast('✅ Safe', 'success'); speak('You have crossed safely. Sidewalk reached.'); }},
        ];
      } else if (scenario.includes('demo3')) {
        // DEMO 3: Tokyo Shibuya — karaoke signs, busy crossing, narrow street
        timeline = [
          { t: 500, fn: () => { setTranscript('📍 Entering busy pedestrian area...'); speak('Entering busy pedestrian area. Multiple people detected.'); }},
          { t: 4000, fn: () => { setTranscript('🚶 Crowded crosswalk. 5 people ahead.'); addLog('Crowd detected: 5+ pedestrians', 'medium'); showToast('🚶 Crowded Area', 'warning'); speak('Crowded crosswalk ahead. At least 5 people walking toward you. Stay right.'); }},
          { t: 8000, fn: () => { setTranscript('⬆️ Entering narrow shopping street.'); addLog('Narrow street ahead', 'medium'); showToast('↑ Narrow Street', 'info'); speak('Entering narrow shopping street. Buildings on both sides. Walk slowly.'); }},
          { t: 12000, fn: () => { setTranscript('✅ Path is clearing. Continue ahead.'); showToast('✅ Clear', 'success'); speak('Path is clearing up. Continue straight ahead.'); }},
        ];
      } else if (scenario.includes('demo4')) {
        // DEMO 4: Tree-lined street — narrow sidewalk, parked van, low visibility
        timeline = [
          { t: 500, fn: () => { setTranscript('⬆️ Walking on tree-lined street...'); speak('Walking on tree-lined street.'); }},
          { t: 3500, fn: () => { setTranscript('⚠️ Narrow sidewalk! Parked van blocking path.'); addLog('Obstacle: Parked van narrows sidewalk', 'high'); showToast('⚠️ Narrow!', 'warning'); speak('Caution! Narrow sidewalk ahead. A parked van is blocking part of the path. Move carefully.', 1.1); }},
          { t: 7500, fn: () => { setTranscript('🚗 Parked car at the crosswalk. Check before stepping.'); addLog('Vehicle at crosswalk', 'high'); showToast('🚗 Car Ahead', 'warning'); speak('Parked car at the crosswalk. Stop and check for traffic before stepping onto the road.'); }},
          { t: 11000, fn: () => { setTranscript('✅ Crossed safely. Wide sidewalk ahead.'); addLog('Path clear', 'low'); showToast('✅ Clear Path', 'success'); speak('Crossed safely. Wide sidewalk ahead. Continue walking.'); }},
        ];
      } else if (scenario.includes('demo5')) {
        // DEMO 5: Tokyo Shibuya Center-gai — McDonald's, shops, busy pedestrian zone
        timeline = [
          { t: 500, fn: () => { setActiveFeature('explore'); setTranscript('🔍 Explore mode. Scanning nearby places...'); showToast('🔍 Explore', 'success'); speak('Explore mode activated. Scanning nearby places.'); }},
          { t: 4000, fn: () => { setTranscript('🍔 McDonald\'s on your left. Entrance 3 meters.'); addLog('Nearby: McDonald\'s 3m left', 'low'); showToast('🍔 McDonald\'s — Left', 'info'); speak('McDonald\'s restaurant on your left. Entrance is 3 meters ahead.'); }},
          { t: 8000, fn: () => { setTranscript('🚶 Busy pedestrian zone. 8 people nearby.'); addLog('Crowd: 8+ people detected', 'medium'); showToast('🚶 Crowded', 'warning'); speak('Busy pedestrian zone. At least 8 people around you. Walk carefully.'); }},
          { t: 12000, fn: () => { setActiveFeature('navigation'); setTranscript('🎤 Karaoke venue on your right. Shopping street ahead.'); showToast('🎤 Karaoke — Right', 'info'); speak('Karaoke venue on your right. Shopping street continues ahead.'); }},
        ];
      } else {
        // Default fallback
        timeline = [
          { t: 500, fn: () => { setTranscript('LiveSight is ready.'); speak('LiveSight is ready. Point your camera ahead.'); }},
        ];
      }

      const timers = timeline.map(({ t, fn }) => setTimeout(fn, t));
      return () => {
        timers.forEach(clearTimeout);
        window.speechSynthesis.cancel();
      };
    }
  }, [demoVideoUrl]);

  // Clear toast
  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Background class based on contrast mode
  const bgClass = useMemo(() => {
    return settings.contrastMode === 'high' ? 'bg-transparent' : 'bg-transparent';
  }, [settings.contrastMode]);

  // Status indicator class
  const statusIndicatorClass = useMemo(() => {
    if (!isLive) return 'bg-gray-600 text-gray-600';
    if (status === 'connecting') return 'bg-yellow-400 text-yellow-400 animate-pulse';
    return 'bg-cyan-400 text-cyan-400';
  }, [isLive, status]);

  // --- API ENTRY UI (skip in demo mode) ---
  if (!apiKey && !demoVideoUrl) {
    return <Onboarding onApiKeySubmit={handleApiKeySubmit} />;
  }

  // --- MAIN HUD ---
  return (
    <div className={`min-h-screen flex flex-col ${bgClass} text-white font-sans overflow-hidden fixed inset-0`}>
      {/* Toast Notifications */}
      <SystemToast message={toastMessage} onClear={clearToast} type={toastType} />

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        onApiKeyChange={(newKey) => {
          setApiKey(newKey);
          saveApiKey(newKey);
        }}
      />
      <CommandHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <EmergencyContactsModal isOpen={showEmergencyContacts} onClose={() => setShowEmergencyContacts(false)} />
      <AdInterstitial show={showAd} onClose={() => setShowAd(false)} />

      {/* 1. TOP BAR (Status & Settings) */}
      <header className="px-4 py-3 flex justify-between items-center bg-gradient-to-b from-[#09090b]/90 via-[#09090b]/60 to-transparent backdrop-blur-sm z-40">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-500 ${statusIndicatorClass}`}
            aria-hidden="true"
          />
          <span className="text-xs font-semibold tracking-widest opacity-80">
            LIVE<span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">SIGHT</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Status Bar */}
          <StatusBar />

          {/* Emergency Contacts Button */}
          <button
            onClick={() => setShowEmergencyContacts(true)}
            className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all duration-200"
            aria-label="Manage emergency contacts"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(true)}
            className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-sky-400 hover:border-sky-500/30 hover:bg-sky-500/10 transition-all duration-200"
            aria-label="Show voice commands help"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all duration-200"
            aria-label="Open settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2. MAIN VIEWPORT */}
      <main className="flex-1 relative flex flex-col md:flex-row gap-3 px-4 pb-4 overflow-hidden">
        {/* CENTER: CAMERA FEED */}
        <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/[0.06] bg-[#0d0d12] shadow-2xl">
          {/* Compass Overlay */}
          <div className="absolute top-0 inset-x-0 z-30">
            <Compass />
          </div>

          {/* Mode Indicator - Now linked to Active Feature */}
          <div className="absolute top-16 left-4 z-30">
            <div className="px-3 py-1.5 glass-card rounded-xl flex flex-col items-start gap-0.5">
              <span className="text-[10px] font-semibold text-sky-300 uppercase tracking-wider">
                {activeFeature.toUpperCase()} MODE
              </span>
              <span className="text-[8px] text-gray-400 uppercase tracking-wide">
                {settings.proactiveMode ? 'PROACTIVE' : 'REACTIVE'}
              </span>
            </div>
          </div>

          <CameraFeed
            isActive={true}
            isScanning={isLive}
            onVideoReady={handleVideoReady}
            activeFeature={activeFeature}
            demoVideoUrl={demoVideoUrl}
          />

          {/* OVERLAY: Transcript & Visualizer */}
          <div className="absolute bottom-0 inset-x-0 p-6 pt-24 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent pointer-events-none flex flex-col items-center justify-end z-20">
            <div className="w-full max-w-xl space-y-4">
              {/* Transcript Bubble */}
              <div
                className={`text-center transition-all duration-500 ${isLive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                role="status"
                aria-live="polite"
              >
                <div className="inline-block glass-card rounded-2xl px-5 py-3 max-w-full">
                  <p className="text-base md:text-lg font-semibold leading-relaxed text-white/90">
                    {transcript}
                  </p>
                </div>
              </div>

              {/* Audio Waveform */}
              <div className="h-10 w-full flex items-center justify-center">
                <AudioVisualizer isActive={isLive} />
              </div>
            </div>
          </div>

          {/* MOBILE LOGS OVERLAY */}
          {showMobileLogs && (
            <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-xl p-6 flex flex-col animate-fade-in-up lg:hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-cyan-400 font-mono tracking-widest text-sm font-bold">
                  EVENT LOGS
                </h3>
                <button
                  onClick={() => setShowMobileLogs(false)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Close logs"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-xl border-l-4 bg-gray-900/50 ${log.riskLevel === 'critical' ? 'border-red-600 bg-red-900/20' :
                      log.riskLevel === 'high' ? 'border-red-500' : 'border-cyan-500'
                      }`}
                  >
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-mono uppercase">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span>{log.riskLevel}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-200">{log.description}</p>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-gray-600 text-center mt-10 font-mono text-xs">
                    No records found.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SIDE: DATA LOGS (Desktop only) */}
        <aside className="hidden lg:flex w-72 flex-col gap-3" aria-label="Hazard logs">
          {/* Logs Panel */}
          <div className="flex-1 glass-card rounded-2xl p-4 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3 border-b border-white/[0.06] pb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                Hazard Stream
              </span>
              <div className="flex gap-1 items-center">
                <div className={`w-1.5 h-1.5 bg-rose-500 rounded-full ${logs.length > 0 ? 'animate-ping' : ''}`} />
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              </div>
            </div>
            <div
              ref={logsContainerRef}
              className="flex-1 overflow-y-auto space-y-2 scrollbar-hide"
            >
              {logs.map((log) => (
                <article
                  key={log.id}
                  className={`p-2.5 rounded-xl border-l-2 text-xs transition-all hover:bg-white/[0.04] ${log.riskLevel === 'critical' ? 'border-rose-500 bg-rose-500/[0.08]' :
                    log.riskLevel === 'high' ? 'border-amber-500 bg-amber-500/[0.06]' : 'border-sky-500 bg-sky-500/[0.06]'
                    }`}
                >
                  <div className="flex justify-between opacity-50 mb-1 text-[10px]">
                    <time dateTime={new Date(log.timestamp).toISOString()}>
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    <span className="uppercase font-semibold">{log.riskLevel}</span>
                  </div>
                  <div className="font-medium text-gray-200 text-[11px]">{log.description}</div>
                </article>
              ))}
              {logs.length === 0 && (
                <div className="text-center mt-10 text-gray-600 text-xs">
                  No hazards detected
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* 4. BOTTOM COMMAND CENTER */}
      <footer className="px-4 py-4 pb-6 glass border-t border-white/[0.06] z-50 flex flex-col gap-4">

        {/* Feature Selector */}
        <div className="w-full max-w-2xl mx-auto">
          <FeatureSelector
            activeFeature={activeFeature}
            onSelect={setActiveFeature}
            disabled={!isLive}
          />
        </div>

        <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-4">
          {/* Left: SOS Button */}
          <div className="hidden md:block">
            <SOSButton
              onTrigger={handleSOSTrigger}
              isActive={isLive}
            />
          </div>

          {/* CENTER: PRIMARY CONTROLS */}
          <div className="flex-1 flex items-center justify-center gap-6">
            {/* Mic Toggle */}
            <button
              onClick={toggleMute}
              disabled={!isLive}
              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 border ${isMicMuted
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              aria-pressed={isMicMuted}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {isMicMuted && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-0.5 bg-rose-500 rotate-45 rounded-full" />
                </div>
              )}
            </button>

            {/* MAIN ACTIVATION BUTTON */}
            <button
              onClick={toggleLiveSight}
              className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 ${isLive
                ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_4px_24px_rgba(244,63,94,0.35)]'
                : 'bg-gradient-to-br from-sky-500 to-cyan-500 shadow-[0_4px_24px_rgba(56,189,248,0.3)] hover:shadow-[0_4px_30px_rgba(56,189,248,0.4)]'
                }`}
              aria-label={isLive ? 'Stop LiveSight' : 'Start LiveSight'}
              aria-pressed={isLive}
            >
              {isLive && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 animate-ping opacity-20" />
              )}
              {isLive ? (
                <div className="w-5 h-5 bg-white rounded-sm z-10" />
              ) : (
                <svg className="w-7 h-7 text-white ml-1 z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Logs Toggle (Mobile) */}
            <button
              onClick={() => setShowMobileLogs(!showMobileLogs)}
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all duration-300 lg:hidden ${showMobileLogs
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-400'
                : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              aria-label={showMobileLogs ? 'Hide event logs' : 'Show event logs'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>

            {/* Desktop spacer */}
            <div className="hidden lg:block w-11 h-11" />
          </div>

          {/* Right: Mode & Weather Info */}
          <div className="hidden md:flex flex-col items-end gap-1 min-w-[100px]">
            <div className={`text-xs font-semibold ${settings.proactiveMode ? 'text-emerald-400' : 'text-gray-500'}`}>
              {settings.proactiveMode ? 'PROACTIVE' : 'REACTIVE'}
            </div>
            <div className="text-[10px] text-gray-500">
              {weather.condition} {weather.temperature > 0 ? `${weather.temperature}°C` : ''}
            </div>
          </div>
        </div>

        {/* Mobile SOS Button */}
        <div className="md:hidden mt-2 flex justify-center">
          <SOSButton
            onTrigger={handleSOSTrigger}
            isActive={isLive}
          />
        </div>
      </footer>
    </div>
  );
};

export default LiveSightApp;
