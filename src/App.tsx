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
} from './components';
import { useHaptic } from './hooks/useHaptic';
import { usePermissions } from './hooks/usePermissions';
import { useFallDetection } from './hooks/useFallDetection';
import { API_CONFIG, DEFAULT_TRANSCRIPT } from './constants';
import type { SOSEvent, VehicleDangerLevel, TrafficLightDetection, ColorDetectionResult, ExpirationDateResult } from './types';

// Import feature services
import { notifyContacts, createSOSEvent } from './features/sos/sosService';

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
    batteryLevel
  } = useLiveSight();

  // Local State
  const [isLive, setIsLive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileLogs, setShowMobileLogs] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'warning' | 'error' | 'achievement'>('info');
  const [apiKey, setApiKey] = useState<string>('');
  const [manualKeyInput, setManualKeyInput] = useState('');
  const [showTestPanel, setShowTestPanel] = useState(false);

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

  // Initialize API Key
  useEffect(() => {
    const initKey = async () => {
      if (process.env.API_KEY) {
        setApiKey(process.env.API_KEY);
      } else if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (hasKey && process.env.API_KEY) {
            setApiKey(process.env.API_KEY);
          }
        } catch (error) {
          console.warn('[App] AI Studio key check failed:', error);
        }
      }
    };
    initKey();
  }, []);

  // Handle Google Auth
  const handleSelectKey = useCallback(async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        window.location.reload();
      } catch (e) {
        console.error('[App] Key selection failed:', e);
        alert('Connection error. Please try again.');
      }
    } else {
      alert('AI Studio not available. Please use manual API key entry.');
    }
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

  // Test functions for vehicle danger
  const testVehicleCritical = useCallback(() => {
    handleVehicleDanger('critical', 'TEST: STOP NOW! Car very close, 2 meters to your right!');
  }, [handleVehicleDanger]);

  const testVehicleWarning = useCallback(() => {
    handleVehicleDanger('warning', 'TEST: WARNING! Bus approaching, 5 meters to your left');
  }, [handleVehicleDanger]);

  const testVehicleAwareness = useCallback(() => {
    handleVehicleDanger('awareness', 'TEST: Bicycle detected, 3 o\'clock direction, 10 meters');
  }, [handleVehicleDanger]);

  const testFallDetection = useCallback(() => {
    fallHaptic();
    addLog('TEST: FALL DETECTED', 'critical');
    showToast('TEST: Fall detected!', 'warning');
  }, [fallHaptic, addLog, showToast]);

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
      case 'BATTERY_STATUS':
        showToast(`Battery: ${batteryLevel}%`, batteryLevel < 20 ? 'warning' : 'info');
        break;
      case 'WEATHER_UPDATE':
        showToast(`${weather.condition}, ${weather.temperature}°C`, 'info');
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

    const keyToUse = apiKey || process.env.API_KEY;
    if (!keyToUse) {

      return;
    }

    // Request permissions if not granted
    if (!permissions.allGranted) {

      const granted = await requestPermissions();
      if (!granted) {

        return;
      }
    }

    if (!videoElementRef.current) {

      return;
    }

    // Mark as starting
    isStartingRef.current = true;

    startFeedback();
    setIsLive(true);
    setStatus('connecting');
    setTranscript('Connecting...');

    const service = new LiveSightService(
      keyToUse,
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
  }, [setStatus, setTranscript, setVolume, successFeedback, stopFallMonitoring]);

  // Toggle LiveSight
  const toggleLiveSight = useCallback(() => {
    if (isLive) {
      stopLiveSight();
    } else {
      startLiveSight();
    }
  }, [isLive, startLiveSight, stopLiveSight]);

  // Handle video ready - auto-start LiveSight when video is ready
  const handleVideoReady = useCallback((el: HTMLVideoElement) => {
    videoElementRef.current = el;
    // Auto-start ONCE when video is ready and we have an API key
    const keyToUse = apiKey || process.env.API_KEY;
    if (keyToUse && !isLive && !hasAutoStartedRef.current && !isStartingRef.current) {
      hasAutoStartedRef.current = true;

      startLiveSight();
    }
  }, [apiKey, isLive, startLiveSight]);

  // Clear toast
  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Handle manual key submit
  const handleManualKeySubmit = useCallback(() => {
    if (manualKeyInput.length >= API_CONFIG.MIN_API_KEY_LENGTH) {
      setApiKey(manualKeyInput);
    }
  }, [manualKeyInput]);

  // Background class based on contrast mode
  const bgClass = useMemo(() => {
    return settings.contrastMode === 'high' ? 'bg-black' : 'bg-[#030712]';
  }, [settings.contrastMode]);

  // Status indicator class
  const statusIndicatorClass = useMemo(() => {
    if (!isLive) return 'bg-gray-600 text-gray-600';
    if (status === 'connecting') return 'bg-yellow-400 text-yellow-400 animate-pulse';
    return 'bg-cyan-400 text-cyan-400';
  }, [isLive, status]);

  // --- API ENTRY UI ---
  if (!process.env.API_KEY && !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 relative overflow-hidden font-mono">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900 via-transparent to-transparent" />

        <div className="w-full max-w-md z-10 space-y-10 animate-fade-in-up">
          {/* Header */}
          <div className="text-center">
            <div className="inline-block px-3 py-1 border border-yellow-500/30 bg-yellow-500/10 rounded text-[10px] tracking-[0.3em] text-yellow-400 mb-4">
              SEE BEYOND BARRIERS
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">
              LIVE<span className="text-cyan-400">SIGHT</span>
            </h1>
            <p className="text-gray-400 text-sm tracking-wide mb-1">
              Your Eyes to the World
            </p>
            <p className="text-gray-600 text-xs tracking-widest uppercase">
              AI-Powered Navigation for the Visually Impaired
            </p>
          </div>

          {/* Auth Options */}
          <div className="space-y-4">
            <button
              onClick={handleSelectKey}
              className="w-full py-4 bg-gray-900 border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-800 transition rounded-xl flex items-center justify-center gap-3 text-sm font-bold tracking-wider"
              aria-label="Authenticate with Google"
            >
              <span className="text-xl" aria-hidden="true">⚡</span>
              GOOGLE AUTH
            </button>

            <div className="flex items-center gap-4 opacity-30">
              <div className="h-px bg-white flex-1" />
              <span className="text-[10px]">OR</span>
              <div className="h-px bg-white flex-1" />
            </div>

            <input
              type="password"
              placeholder="ENTER_GEMINI_API_KEY"
              value={manualKeyInput}
              onChange={(e) => setManualKeyInput(e.target.value)}
              className="w-full bg-black border border-gray-800 p-4 rounded-xl text-center text-cyan-400 focus:border-cyan-500 outline-none transition"
              aria-label="Enter API key manually"
            />

            <button
              onClick={handleManualKeySubmit}
              disabled={manualKeyInput.length < API_CONFIG.MIN_API_KEY_LENGTH}
              className="w-full py-4 bg-cyan-600 disabled:opacity-50 hover:bg-cyan-500 text-black font-black tracking-widest rounded-xl transition shadow-[0_0_20px_rgba(8,145,178,0.4)] disabled:cursor-not-allowed"
              aria-label="Initialize with manual API key"
            >
              INITIALIZE
            </button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { icon: '🧭', label: 'Navigate' },
              { icon: '🚦', label: 'Traffic' },
              { icon: '📅', label: 'Expiry' },
              { icon: '🎨', label: 'Colors' },
              { icon: '🆘', label: 'SOS' },
              { icon: '🏆', label: 'Rewards' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="text-center p-3 bg-gray-900/30 rounded-lg border border-gray-800"
              >
                <span className="text-xl">{feature.icon}</span>
                <p className="text-[10px] text-gray-500 mt-1">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN HUD ---
  return (
    <div className={`min-h-screen flex flex-col ${bgClass} text-white font-sans overflow-hidden fixed inset-0`}>
      {/* Toast Notifications */}
      <SystemToast message={toastMessage} onClear={clearToast} type={toastType} />

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <CommandHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <EmergencyContactsModal isOpen={showEmergencyContacts} onClose={() => setShowEmergencyContacts(false)} />

      {/* Test Panel */}
      {showTestPanel && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in-up">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-cyan-400 font-mono font-bold tracking-wider">TEST PANEL</h2>
              <button
                onClick={() => setShowTestPanel(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-mono">VEHICLE DANGER TEST</p>

              <button
                onClick={testVehicleCritical}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                CRITICAL - Vehicle Too Close!
              </button>

              <button
                onClick={testVehicleWarning}
                className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                WARNING - Vehicle Approaching
              </button>

              <button
                onClick={testVehicleAwareness}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                AWARENESS - Vehicle Detected
              </button>
            </div>

            <div className="pt-4 border-t border-gray-700 space-y-3">
              <p className="text-xs text-gray-500 font-mono">OTHER TESTS</p>

              <button
                onClick={testFallDetection}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                Fall Detection Test
              </button>
            </div>

            <p className="text-[10px] text-gray-600 text-center mt-4">
              Each button triggers the corresponding haptic feedback
            </p>
          </div>
        </div>
      )}

      {/* 1. TOP BAR (Status & Settings) */}
      <header className="px-4 py-3 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-40">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-500 ${statusIndicatorClass}`}
            aria-hidden="true"
          />
          <span className="text-xs font-mono font-bold tracking-widest opacity-80">
            LIVESIGHT<span className="opacity-40">_AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Bar */}
          <StatusBar />

          {/* Test Panel Button */}
          <button
            onClick={() => setShowTestPanel(true)}
            className="w-8 h-8 rounded-full bg-gray-900/50 border border-yellow-600 flex items-center justify-center text-yellow-500 hover:text-yellow-400 hover:border-yellow-500 transition"
            aria-label="Open test panel"
          >
            <span className="text-sm">🧪</span>
          </button>

          {/* Emergency Contacts Button */}
          <button
            onClick={() => setShowEmergencyContacts(true)}
            className="w-8 h-8 rounded-full bg-gray-900/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-500 transition"
            aria-label="Manage emergency contacts"
          >
            <span className="text-sm">📞</span>
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(true)}
            className="w-8 h-8 rounded-full bg-gray-900/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500 transition"
            aria-label="Show voice commands help"
          >
            <span className="text-xs font-bold">?</span>
          </button>

          {/* Test Panel Toggle Button (hidden on small screens) */}
          <button
            onClick={() => setShowTestPanel(!showTestPanel)}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-gray-900/50 border border-yellow-600 text-yellow-500 hover:text-yellow-400 hover:border-yellow-500 transition"
            aria-label="Toggle Test Panel"
            aria-pressed={showTestPanel ? "true" : "false"}
          >
            🧪
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full bg-gray-900/50 border border-gray-700 hover:border-cyan-500 transition"
            aria-label="Open settings"
          >
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2. MAIN VIEWPORT */}
      <main className="flex-1 relative flex flex-col md:flex-row gap-3 px-4 pb-4 overflow-hidden">
        {/* CENTER: CAMERA FEED */}
        <div className="flex-1 relative rounded-[2rem] overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl">
          {/* Compass Overlay */}
          <div className="absolute top-0 inset-x-0 z-30">
            <Compass />
          </div>

          {/* Mode Indicator - Now linked to Active Feature */}
          <div className="absolute top-16 left-4 z-30">
            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-gray-700 flex flex-col items-start gap-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
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
          />

          {/* OVERLAY: Transcript & Visualizer */}
          <div className="absolute bottom-0 inset-x-0 p-6 pt-24 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none flex flex-col items-center justify-end z-20">
            <div className="w-full max-w-xl space-y-4">
              {/* Transcript Bubble */}
              <div
                className={`text-center transition-all duration-300 ${isLive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                role="status"
                aria-live="polite"
              >
                <p className="text-lg md:text-xl font-bold leading-relaxed text-cyan-50 drop-shadow-md">
                  "{transcript}"
                </p>
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
          <div className="flex-1 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-2xl p-4 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                Hazard Stream
              </span>
              <div className="flex gap-1">
                <div className={`w-1.5 h-1.5 bg-red-500 rounded-full ${logs.length > 0 ? 'animate-ping' : ''}`} />
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              </div>
            </div>
            <div
              ref={logsContainerRef}
              className="flex-1 overflow-y-auto space-y-2 scrollbar-hide"
            >
              {logs.map((log) => (
                <article
                  key={log.id}
                  className={`p-2 rounded-lg border-l-2 text-xs font-mono transition-all hover:bg-white/5 ${log.riskLevel === 'critical' ? 'border-red-600 bg-red-500/10' :
                    log.riskLevel === 'high' ? 'border-red-500 bg-red-500/10' : 'border-cyan-500 bg-cyan-500/10'
                    }`}
                >
                  <div className="flex justify-between opacity-50 mb-1 text-[10px]">
                    <time dateTime={new Date(log.timestamp).toISOString()}>
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    <span className="uppercase font-bold">{log.riskLevel}</span>
                  </div>
                  <div className="font-bold text-gray-200 text-[11px]">{log.description}</div>
                </article>
              ))}
              {logs.length === 0 && (
                <div className="text-center mt-10 text-gray-700 text-xs font-mono">
                  NO HAZARDS DETECTED
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* 4. BOTTOM COMMAND CENTER */}
      <footer className="px-4 py-4 pb-6 bg-black/80 backdrop-blur-xl border-t border-gray-800 z-50 flex flex-col gap-4">

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
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${isMicMuted
                ? 'bg-red-500/20 border-red-500 text-red-500'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              aria-pressed={isMicMuted}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {isMicMuted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-500 rotate-45 rounded" />
                </div>
              )}
            </button>

            {/* MAIN ACTIVATION BUTTON */}
            <button
              onClick={toggleLiveSight}
              className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-95 ${isLive
                ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)]'
                : 'bg-cyan-600 shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:bg-cyan-500'
                }`}
              aria-label={isLive ? 'Stop LiveSight' : 'Start LiveSight'}
              aria-pressed={isLive}
            >
              <div
                className={`absolute inset-1 rounded-xl border-2 border-white/20 ${isLive ? 'animate-ping opacity-20' : ''}`}
              />
              {isLive ? (
                <div className="w-5 h-5 bg-white rounded-sm" />
              ) : (
                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Logs Toggle (Mobile) */}
            <button
              onClick={() => setShowMobileLogs(!showMobileLogs)}
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition lg:hidden ${showMobileLogs
                ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                }`}
              aria-label={showMobileLogs ? 'Hide event logs' : 'Show event logs'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>

            {/* Desktop spacer */}
            <div className="hidden lg:block w-11 h-11" />
          </div>

          {/* Right: Mode & Weather Info */}
          <div className="hidden md:flex flex-col items-end gap-1 min-w-[100px]">
            <div className={`text-xs font-bold ${settings.proactiveMode ? 'text-green-400' : 'text-gray-400'}`}>
              {settings.proactiveMode ? 'PROACTIVE' : 'REACTIVE'}
            </div>
            <div className="text-[10px] text-gray-500 font-mono">
              {weather.condition} • {weather.temperature}°C
            </div>
          </div>
        </div>

        {/* Mobile SOS Button */}
        <div className="md:hidden mt-4 flex justify-center">
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
