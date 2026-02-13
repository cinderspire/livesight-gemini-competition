import { GoogleGenAI, LiveServerMessage, Modality, Session, Type, type FunctionDeclaration } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';
import type { UserSettings, WeatherContext, VoiceCommand, LiveSightCallbacks, VehicleDangerLevel } from '../types';
import { AUDIO_CONFIG, VIDEO_CONFIG, AI_CONFIG, URGENT_KEYWORDS, COMMAND_KEYWORDS, VEHICLE_DANGER_CONFIG, MODE_PROMPTS } from '../constants';
import { parseTrafficLightResponse } from '../features/traffic-light/trafficLightService';
import { parseColorResponse } from '../features/color-detection/colorService';
import { parseExpirationResponse } from '../features/expiration/expirationService';
import { parseObstacleResponse, sortObstaclesByPriority, getObstacleAnnouncement } from '../features/obstacle-detection/obstacleService';

// Connection timeout in milliseconds
const CONNECTION_TIMEOUT = 30000; // Increased to 30s for stability
const RECONNECT_DELAY = 1000; // 1 second between reconnects

/**
 * Gemini Function Calling Tool Declarations
 * These allow the AI to trigger structured app actions
 */
const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'reportObstacle',
    description: 'Report a detected obstacle with structured data for haptic feedback and logging',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, description: 'Obstacle type (e.g. pole, stairs, pothole, curb, vehicle)' },
        direction: { type: Type.NUMBER, description: 'Clock direction 1-12 (12=ahead, 3=right, 9=left)' },
        distance: { type: Type.NUMBER, description: 'Estimated distance in meters' },
        severity: { type: Type.STRING, description: 'Danger severity: critical, warning, or info' },
      },
      required: ['type', 'direction', 'severity'],
    },
  },
  {
    name: 'switchMode',
    description: 'Switch the app to a different feature mode when the user requests it or when context suggests it',
    parameters: {
      type: Type.OBJECT,
      properties: {
        mode: { type: Type.STRING, description: 'Target mode: navigation, traffic, color, expiration, explore, or community' },
        reason: { type: Type.STRING, description: 'Brief reason for switching' },
      },
      required: ['mode'],
    },
  },
  {
    name: 'triggerEmergency',
    description: 'Trigger emergency SOS when the user is in immediate danger or requests help',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: { type: Type.STRING, description: 'Reason for emergency (e.g. fall detected, user in danger)' },
      },
      required: ['reason'],
    },
  },
  {
    name: 'announceEnvironment',
    description: 'Provide a structured environment summary for the user',
    parameters: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: 'Brief environment description' },
        safetyLevel: { type: Type.STRING, description: 'Overall safety: safe, caution, or danger' },
        nearbyLandmarks: { type: Type.STRING, description: 'Comma-separated list of nearby notable places or features' },
      },
      required: ['description', 'safetyLevel'],
    },
  },
];

const LIVE_API_TOOLS = [{ functionDeclarations: FUNCTION_DECLARATIONS }];

/**
 * LiveSight Service
 * Handles real-time communication with Gemini Live API
 * Manages audio/video streaming and command detection
 */
export class LiveSightService {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private isConnected = false;
  private videoInterval: ReturnType<typeof setInterval> | null = null;
  private canvas: HTMLCanvasElement;
  private settings: UserSettings;
  private callbacks: LiveSightCallbacks;
  private videoElement: HTMLVideoElement;
  private session: Session | null = null;
  private audioStream: MediaStream | null = null;
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private isStarting = false; // Flag to prevent multiple concurrent starts
  public isMuted = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5; // More attempts
  private shouldReconnect = true;
  private rateLimitThrottle = 1; // 1 = normal, 2 = half speed, 4 = quarter speed
  private activeFeature: string = 'navigation';
  // Context persistence - track recent detections for smarter AI responses
  private recentContext: string[] = [];
  private readonly MAX_CONTEXT_ITEMS = 5;
  // Offline fallback mode
  private isOfflineMode = false;
  private offlineModeInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    apiKey: string,
    videoElement: HTMLVideoElement,
    settings: UserSettings,
    _weather: WeatherContext, // Keep param for API compatibility
    callbacks: LiveSightCallbacks
  ) {
    // Use v1alpha API version for Live API access
    this.ai = new GoogleGenAI({
      apiKey,
      apiVersion: AI_CONFIG.API_VERSION
    });
    this.videoElement = videoElement;
    this.settings = settings;
    this.callbacks = callbacks;
    this.canvas = document.createElement('canvas');
  }

  /**
   * Generate system instruction based on current settings and context
   */

  /**
   * Get the configured voice name based on user settings
   */
  private getVoiceName(): string {
    return AI_CONFIG.VOICE_MAP[this.settings.voiceType] || AI_CONFIG.VOICE_NAME;
  }

  private getSystemInstruction(activeFeature: string = 'navigation'): string {
    // Select the appropriate prompt based on active feature
    const prompts: Record<string, string> = {
      traffic: MODE_PROMPTS.TRAFFIC_LIGHT,
      color: MODE_PROMPTS.COLOR,
      expiration: MODE_PROMPTS.EXPIRATION,
      explore: MODE_PROMPTS.EXPLORE,
      community: MODE_PROMPTS.COMMUNITY,
    };
    const prompt = prompts[activeFeature] || MODE_PROMPTS.NAVIGATION;

    // Language instruction based on settings
    const langMap: Record<string, string> = {
      en: 'English', tr: 'Turkish', es: 'Spanish', de: 'German',
      fr: 'French', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese',
    };
    const preferredLang = langMap[this.settings.language] || 'English';

    // Speed instruction
    const speedMap: Record<string, string> = {
      slow: 'Speak slowly and clearly, with pauses between sentences.',
      normal: 'Speak at a normal conversational pace.',
      fast: 'Speak quickly and concisely, minimize pauses.',
    };
    const speedInstruction = speedMap[this.settings.voiceSpeed] || '';

    // Append general behavior rules that apply to all modes
    let instruction = `${prompt}

GENERAL RULES:
- Keep responses short (Max 1-2 sentences).
- Do not say "OK" or "Got it" unless it's an emergency confirmation.
- Sound natural and reassuring.
- Preferred language: ${preferredLang}. If the user speaks a different language, adapt to their language.
- ${speedInstruction}
- User's mobility aid: ${this.settings.mobilityAid}. Adapt guidance accordingly.`;

    // Add recent context for continuity
    if (this.recentContext.length > 0) {
      instruction += `\n\nRECENT CONTEXT (last ${this.recentContext.length} detections):\n${this.recentContext.join('\n')}`;
    }

    return instruction;
  }

  /**
   * Set microphone mute state
   */
  public setMute(muted: boolean): void {
    this.isMuted = muted;
  }

  /**
   * Update settings and notify AI of changes
   */
  public async updateSettings(newSettings: UserSettings): Promise<void> {
    const oldMode = this.settings.proactiveMode;
    const oldSpeed = this.settings.voiceSpeed;
    this.settings = newSettings;

    if (this.session && this.isConnected) {
      let updateMsg = `SYSTEM_UPDATE: Settings changed.`;

      if (oldMode !== newSettings.proactiveMode) {
        updateMsg += ` Mode is now ${newSettings.proactiveMode ? 'PROACTIVE' : 'REACTIVE'}.`;
      }
      if (oldSpeed !== newSettings.voiceSpeed) {
        updateMsg += ` Adjust speech speed to ${newSettings.voiceSpeed}.`;
      }
      updateMsg += ` Current Aid: ${newSettings.mobilityAid}.`;


      this.sendTextMessage(updateMsg);
    }
  }

  /**
   * Update weather context and notify AI
   */
  public async updateWeather(newWeather: WeatherContext): Promise<void> {
    if (this.session && this.isConnected) {
      const updateMsg = `Weather update: ${newWeather.condition}, ${newWeather.temperature}°C.${newWeather.isWet ? ' Surfaces may be wet, be careful.' : ''}`;
      this.sendTextMessage(updateMsg);
    }
  }

  /**
   * Update user location and notify AI for navigation context
   */
  public updateLocation(lat: number, lon: number, extras?: { accuracy?: number; heading?: number; speed?: number }): void {
    if (this.session && this.isConnected) {
      let msg = `LOCATION_UPDATE: lat=${lat.toFixed(6)}, lon=${lon.toFixed(6)}`;
      // eslint-disable-next-line eqeqeq
      if (extras?.heading != null) msg += `, heading=${Math.round(extras.heading)}°`;
      // eslint-disable-next-line eqeqeq
      if (extras?.speed != null) msg += `, speed=${(extras.speed * 3.6).toFixed(1)}km/h`;
      // eslint-disable-next-line eqeqeq
      if (extras?.accuracy != null) msg += `, accuracy=${Math.round(extras.accuracy)}m`;
      this.sendTextMessage(msg);
    }
  }

  /**
   * Send a text message to the AI via client content
   */
  private sendTextMessage(message: string): void {
    if (this.session) {
      try {
        this.session.sendClientContent({ turns: message, turnComplete: true });
      } catch (error) {
        console.error('[LiveSight] Failed to send text message:', error);
      }
    }
  }

  /**
   * Clear connection timeout
   */
  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  /**
   * Start the LiveSight service
   */
  public async start(): Promise<void> {
    // Prevent multiple concurrent connection attempts
    if (this.isConnected || this.session || this.isStarting) {

      return;
    }

    // Set flags immediately before any async operations
    this.isStarting = true;
    this.shouldReconnect = true; // Enable auto-reconnect
    this.reconnectAttempts = 0;

    try {
      this.callbacks.onStatusChange('connecting');


      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('[LiveSight] Connection timeout');
          this.callbacks.onStatusChange('error');
          this.callbacks.onTranscript('Connection timed out. Please check your API key.', false);
          this.stop();
        }
      }, CONNECTION_TIMEOUT);

      // Initialize audio contexts in parallel
      this.callbacks.onTranscript('Connecting...', false);
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }

      this.inputAudioContext = new AudioContextClass({ sampleRate: AUDIO_CONFIG.INPUT_SAMPLE_RATE });
      this.outputAudioContext = new AudioContextClass({ sampleRate: AUDIO_CONFIG.OUTPUT_SAMPLE_RATE });

      // Initialize audio and get mic in parallel
      const [, , audioStream] = await Promise.all([
        this.inputAudioContext.resume(),
        this.outputAudioContext.resume(),
        navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        })
      ]);

      this.audioStream = audioStream;


      // Store session reference for use in callbacks
      let sessionRef: Session | null = null;

      const thinkingLevel = AI_CONFIG.THINKING_LEVEL[this.activeFeature] || 'medium';
      const session = await this.ai.live.connect({
        model: AI_CONFIG.MODEL_NAME,
        config: {
          systemInstruction: this.getSystemInstruction(),
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: this.getVoiceName() }
            }
          },
          thinkingConfig: {
            thinkingBudget: thinkingLevel === 'high' ? 2048 : thinkingLevel === 'medium' ? 1024 : 512,
          },
          tools: LIVE_API_TOOLS,
        },
        callbacks: {
          onopen: () => {
            // Use sessionRef which will be set after connect resolves
            if (sessionRef) {
              this.handleConnectionOpen(sessionRef);
            }
          },
          onmessage: (msg) => this.handleServerMessage(msg),
          onclose: (e) => this.handleConnectionClose(e),
          onerror: (err) => this.handleConnectionError(err),
        }
      });

      // Set the session reference after connect resolves
      sessionRef = session;
      this.session = session;



      // If already connected (onopen fired before await returned), handle it now
      if (!this.isConnected && session) {
        this.handleConnectionOpen(session);
      }

    } catch (error) {
      this.clearConnectionTimeout();
      this.isStarting = false; // Reset starting flag on error
      console.error('[LiveSight] Initialization failed:', error);

      // Provide user-friendly error messages
      let errorMessage = 'Connection failed. ';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage += 'Invalid API key. Please check your Gemini API key.';
        } else if (error.message.includes('permission')) {
          errorMessage += 'Microphone permission denied.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Network error. Please check your internet connection.';
        } else {
          errorMessage += error.message;
        }
      }

      this.callbacks.onTranscript(errorMessage, false);
      this.callbacks.onStatusChange('error');
      this.stop();
    }
  }

  /**
   * Handle successful connection
   */
  private handleConnectionOpen(session: Session): void {
    // Prevent duplicate handling
    if (this.isConnected) {

      return;
    }

    this.clearConnectionTimeout();


    this.isConnected = true;
    this.isStarting = false; // Reset starting flag
    this.session = session;
    this.callbacks.onStatusChange('connected');
    this.callbacks.onTranscript('Connected! Starting...', false);

    // Start streaming immediately - no delay


    if (this.audioStream && this.isConnected) {
      this.startAudioStreaming(this.audioStream);
    }
    if (this.isConnected) {
      this.startVideoStreaming();
    }
  }

  /**
   * Handle connection close
   */
  private handleConnectionClose(_event: CloseEvent): void {
    this.clearConnectionTimeout();
    console.warn('[LiveSight] Connection closed:', _event.code, _event.reason);

    // Stop video streaming immediately to prevent sends to closed socket
    if (this.videoInterval) {
      clearInterval(this.videoInterval);
      this.videoInterval = null;
    }

    if (this.isConnected) {
      this.isConnected = false;
      this.session = null;

      // Do NOT reconnect if API key is invalid/leaked
      const reason = _event.reason || '';
      if (reason.includes('leaked') || reason.includes('API key') || reason.includes('invalid')) {
        this.callbacks.onTranscript('API key is invalid or disabled. Please generate a new key at aistudio.google.com/apikey', false);
        this.callbacks.onStatusChange('error');
        this.cleanup();
        return;
      }

      // Rate limit detection — auto-throttle FPS
      if (reason.includes('429') || reason.includes('rate') || reason.includes('quota') || reason.includes('RESOURCE_EXHAUSTED')) {
        this.rateLimitThrottle = Math.min(this.rateLimitThrottle * 2, 8);
        console.warn(`[LiveSight] Rate limited! Throttling to ${this.rateLimitThrottle}x (slower FPS)`);
        this.callbacks.onTranscript(`Rate limit hit. Slowing down camera feed... (${this.rateLimitThrottle}x slower)`, false);
        // Auto-recover after 30 seconds
        setTimeout(() => {
          if (this.rateLimitThrottle > 1) {
            this.rateLimitThrottle = Math.max(1, this.rateLimitThrottle / 2);
            console.log(`[LiveSight] Rate limit easing: ${this.rateLimitThrottle}x`);
            this.startVideoStreaming(); // Restart with new rate
          }
        }, 30000);
      }

      // Try to reconnect if enabled and within limits
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.callbacks.onTranscript(`Connection lost. Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, false);
        this.callbacks.onStatusChange('connecting');

        // Enable offline fallback mode while reconnecting
        this.enableOfflineMode();

        // Wait briefly before reconnecting
        setTimeout(() => {
          if (this.shouldReconnect) {
            this.reconnect();
          }
        }, RECONNECT_DELAY);
      } else {
        this.callbacks.onTranscript('Connection closed. Offline mode active. Tap to restart.', false);
        this.callbacks.onStatusChange('offline');
        this.enableOfflineMode();
      }
    }
  }

  /**
   * Reconnect to the service
   */
  private async reconnect(): Promise<void> {


    // Clean up old session but keep audio stream
    if (this.session) {
      try {
        this.session.close();
      } catch (e) {
        // Ignore close errors
      }
      this.session = null;
    }

    try {
      // Reconnect to Gemini
      this.callbacks.onTranscript('Reconnecting to Gemini AI...', false);

      let sessionRef: Session | null = null;

      const reconnThinkingLevel = AI_CONFIG.THINKING_LEVEL[this.activeFeature] || 'medium';
      const session = await this.ai.live.connect({
        model: AI_CONFIG.MODEL_NAME,
        config: {
          systemInstruction: this.getSystemInstruction(),
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: this.getVoiceName() }
            }
          },
          thinkingConfig: {
            thinkingBudget: reconnThinkingLevel === 'high' ? 2048 : reconnThinkingLevel === 'medium' ? 1024 : 512,
          },
          tools: LIVE_API_TOOLS,
        },
        callbacks: {
          onopen: () => {
            if (sessionRef) {
              this.handleReconnectionOpen(sessionRef);
            }
          },
          onmessage: (msg) => this.handleServerMessage(msg),
          onclose: (e) => this.handleConnectionClose(e),
          onerror: (err) => this.handleConnectionError(err),
        }
      });

      sessionRef = session;
      this.session = session;

      if (!this.isConnected && session) {
        this.handleReconnectionOpen(session);
      }

    } catch (error) {
      console.error('[LiveSight] Reconnection failed:', error);
      this.callbacks.onTranscript('Reconnection failed. Please try again.', false);
      this.callbacks.onStatusChange('error');
    }
  }

  /**
   * Handle successful reconnection
   */
  private handleReconnectionOpen(session: Session): void {
    if (this.isConnected) return;


    this.isConnected = true;
    this.session = session;
    this.reconnectAttempts = 0; // Reset counter on success

    // Disable offline mode
    this.disableOfflineMode();

    this.callbacks.onStatusChange('connected');
    this.callbacks.onTranscript('Reconnected! Resuming AI navigation...', false);

    // Restart video streaming
    this.startVideoStreaming();
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(error: ErrorEvent): void {
    this.clearConnectionTimeout();
    console.error('[LiveSight] Connection error:', error);

    let errorMessage = 'Connection error. ';
    if (error.message) {
      errorMessage += error.message;
    }

    this.callbacks.onTranscript(errorMessage, false);
    this.callbacks.onStatusChange('error');
    this.stop();
  }

  /**
   * Start video streaming to AI
   */
  private startVideoStreaming(): void {
    if (this.videoInterval) clearInterval(this.videoInterval);

    const getInterval = () => {
      // Apply throttle multiplier if rate-limited
      const throttle = this.rateLimitThrottle || 1;
      const base = (() => {
        if (this.activeFeature === 'traffic') return 250;    // ~4 FPS (conservative for free tier)
        if (this.activeFeature === 'navigation') return 333;  // 3 FPS
        if (this.activeFeature === 'expiration') return 500;  // 2 FPS
        if (this.activeFeature === 'color') return 1000;      // 1 FPS
        return 500; // 2 FPS default (free tier safe)
      })();
      return Math.round(base * throttle);
    };

    const interval = getInterval();
    console.log(`[LiveSight] Video stream: ${(1000 / interval).toFixed(1)} FPS (${this.activeFeature}, throttle: ${this.rateLimitThrottle || 1}x)`);

    this.videoInterval = setInterval(() => {
      this.sendRealtimeInput();
    }, interval);
  }
  /**
   * Capture and send a single video frame to AI
   */
  private sendRealtimeInput(): void {
    const ctx = this.canvas.getContext('2d');
    const session = this.session;
    if (!ctx || !this.isConnected || !session || !this.videoElement || this.videoElement.paused) return;

    try {
      this.canvas.width = VIDEO_CONFIG.WIDTH;
      this.canvas.height = VIDEO_CONFIG.HEIGHT;
      ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

      const dataUrl = this.canvas.toDataURL('image/jpeg', VIDEO_CONFIG.JPEG_QUALITY);
      const base64Data = dataUrl.split(',')[1];

      if (base64Data && this.isConnected) {
        session.sendRealtimeInput({
          media: { mimeType: 'image/jpeg', data: base64Data }
        });
      }
    } catch {
      // Silently ignore send failures (connection may be closing)
    }
  }

  /**
   * Start audio streaming to AI
   */
  private startAudioStreaming(stream: MediaStream): void {
    if (!this.inputAudioContext || !this.session) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.processor = this.inputAudioContext.createScriptProcessor(AUDIO_CONFIG.BUFFER_SIZE, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isConnected || !this.session) return;

      const inputData = e.inputBuffer.getChannelData(0);

      // Calculate volume level
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        const sample = inputData[i] ?? 0;
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / inputData.length);
      const visualLevel = Math.min(1, rms * 5);
      this.callbacks.onVolume(visualLevel);

      // Send audio if not muted
      if (!this.isMuted && this.isConnected && this.session) {
        try {
          const pcmBlob = createPcmBlob(inputData);
          this.session.sendRealtimeInput({ audio: pcmBlob });
        } catch {
          // Silently ignore send failures (connection may be closing)
        }
      }
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);


  }



  /**
   * Handle incoming messages from AI
   */
  private async handleServerMessage(message: LiveServerMessage): Promise<void> {
    // 0. Process Function Calls from AI
    const toolCall = message.toolCall;
    if (toolCall?.functionCalls) {
      for (const fc of toolCall.functionCalls) {
        if (fc.name) {
          this.handleFunctionCall(fc.name, (fc.args || {}) as Record<string, unknown>, fc.id || '');
        }
      }
    }

    // 1. Process Audio Output
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && this.outputAudioContext) {
      try {
        const audioBuffer = await decodeAudioData(
          base64ToUint8Array(audioData),
          this.outputAudioContext,
          AUDIO_CONFIG.OUTPUT_SAMPLE_RATE
        );

        // Create Gain Node for Volume Boost (2.5x)
        const gainNode = this.outputAudioContext.createGain();
        gainNode.gain.value = 2.5;

        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Connect Source -> Gain -> Destination
        source.connect(gainNode);
        gainNode.connect(this.outputAudioContext.destination);

        const now = this.outputAudioContext.currentTime;
        this.nextStartTime = Math.max(this.nextStartTime, now);
        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
      } catch (e) {
        console.error('[LiveSight] Audio decode error:', e);
      }
    }

    // 2. Process Model Transcript
    const transcription = message.serverContent?.outputTranscription?.text;
    if (transcription) {
      const trimmedText = transcription.trim();
      if (trimmedText) {
        this.callbacks.onTranscript(trimmedText, false);

        // Update context persistence
        this.addToContext(`[${this.activeFeature}] ${trimmedText}`);

        // --- FEATURE SPECIFIC PROCESSING ---
        // We attempt to parse the response based on the active feature
        if (this.activeFeature === 'traffic') {
          try {
            const result = parseTrafficLightResponse(trimmedText);
            if (result && this.callbacks.onTrafficLight) {
              this.callbacks.onTrafficLight(result);
            }
          } catch (e) {
            console.warn('[LiveSight] Traffic parse error:', e);
          }
        } else if (this.activeFeature === 'color') {
          try {
            const result = parseColorResponse(trimmedText);
            if (result && this.callbacks.onColorDetected) {
              this.callbacks.onColorDetected(result);
            }
          } catch (e) {
            console.warn('[LiveSight] Color parse error:', e);
          }
        } else if (this.activeFeature === 'expiration') {
          try {
            const result = parseExpirationResponse(trimmedText);
            if (result && this.callbacks.onExpirationDate) {
              this.callbacks.onExpirationDate(result);
            }
          } catch (e) {
            console.warn('[LiveSight] Expiration parse error:', e);
          }
        }

        // --- OBSTACLE DETECTION (Navigation mode) ---
        if (this.activeFeature === 'navigation') {
          try {
            const obstacles = parseObstacleResponse(trimmedText);
            if (obstacles.length > 0) {
              const sorted = sortObstaclesByPriority(obstacles);
              const top = sorted[0];
              if (top && (top.riskLevel === 'critical' || top.riskLevel === 'high')) {
                const announcement = getObstacleAnnouncement(top);
                this.callbacks.onHazard(announcement);
              }
            }
          } catch (e) {
            console.warn('[LiveSight] Obstacle parse error:', e);
          }
        }

        // --- SAFETY & GENERIC PROCESSING ---
        // Check for urgent keywords (Always active for safety)
        const lower = trimmedText.toLowerCase();
        if (URGENT_KEYWORDS.some(k => lower.includes(k))) {
          this.callbacks.onHazard(trimmedText);
        }

        // Check for vehicle danger (Always active outdoors)
        const vehicleDangerLevel = this.detectVehicleDanger(trimmedText);
        if (vehicleDangerLevel && this.callbacks.onVehicleDanger) {
          this.callbacks.onVehicleDanger(vehicleDangerLevel, trimmedText);
        }
      }
    }

    // 3. Process User Transcript & Detect Commands
    const userTranscript = message.serverContent?.inputTranscription?.text;
    if (userTranscript) {
      this.detectCommand(userTranscript.toLowerCase());
    }
  }

  /**
   * Add detection to recent context for continuity
   */
  private addToContext(detection: string): void {
    this.recentContext.push(detection);
    if (this.recentContext.length > this.MAX_CONTEXT_ITEMS) {
      this.recentContext.shift(); // Remove oldest
    }
  }

  /**
   * Detect voice commands from user transcript
   */
  private detectCommand(text: string): void {
    for (const [command, keywords] of Object.entries(COMMAND_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        this.callbacks.onCommand(command as VoiceCommand);
        return;
      }
    }
  }

  /**
   * Enable offline fallback mode with sensor-based guidance
   */
  private enableOfflineMode(): void {
    if (this.isOfflineMode) return;

    this.isOfflineMode = true;
    this.callbacks.onTranscript('Offline mode: Using sensors for basic navigation', false);

    // Start periodic sensor-based guidance (compass + accelerometer)
    this.offlineModeInterval = setInterval(() => {
      if (!this.isOfflineMode) return;

      // Use device orientation for basic directional guidance
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const heading = pos.coords.heading;
          if (heading !== null) {
            const direction = Math.round(heading);
            this.callbacks.onTranscript(`Heading ${direction}° (${this.getCardinalDirection(direction)})`, false);
          }
        }, null, { timeout: 5000, maximumAge: 10000 });
      }
    }, 10000); // Every 10 seconds
  }

  /**
   * Disable offline mode when connection restored
   */
  private disableOfflineMode(): void {
    if (!this.isOfflineMode) return;

    this.isOfflineMode = false;
    if (this.offlineModeInterval) {
      clearInterval(this.offlineModeInterval);
      this.offlineModeInterval = null;
    }
  }

  /**
   * Convert heading degrees to cardinal direction
   */
  private getCardinalDirection(degrees: number): string {
    const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index] || 'North';
  }

  /**
   * Detect vehicle danger from AI response
   * Returns danger level based on keywords in the response
   */
  private detectVehicleDanger(text: string): VehicleDangerLevel | null {
    const lower = text.toLowerCase();

    // Check for vehicle-related keywords
    const hasVehicle = VEHICLE_DANGER_CONFIG.VEHICLE_TYPES.some(v => lower.includes(v));
    if (!hasVehicle) return null;

    // Critical: Immediate danger keywords
    const criticalKeywords = ['acil', 'durun', 'dur!', 'tehlike', 'critical', 'immediate', 'stop', 'çok yakın', 'hızla'];
    if (criticalKeywords.some(k => lower.includes(k))) {
      return 'critical';
    }

    // Warning: Approaching vehicle
    const warningKeywords = ['uyarı', 'yaklaşıyor', 'geliyor', 'warning', 'approaching', 'coming', 'dikkat'];
    if (warningKeywords.some(k => lower.includes(k))) {
      return 'warning';
    }

    // Awareness: Vehicle detected nearby
    return 'awareness';
  }

  /**
   * Stop the LiveSight service
   */
  public stop(): void {
    this.shouldReconnect = false; // Prevent auto-reconnect on manual stop
    this.clearConnectionTimeout();
    this.isConnected = false;
    this.reconnectAttempts = 0;

    if (this.session) {
      try {
        this.session.close();
      } catch (e) {
        // Ignore close errors
      }
      this.session = null;
    }

    this.cleanup();

  }



  /**
   * Set the active feature and update system instruction
   */
  public async setActiveFeature(feature: string): Promise<void> {
    this.activeFeature = feature;
    // Cast string to specific type if needed, or update types
    const instruction = this.getSystemInstruction(feature);

    if (this.session && this.isConnected) {


      // Send a system update message to the AI
      // This is faster than reconnecting and usually works for context switching
      const updateMsg = `SYSTEM_UPDATE: Active Mode changed to ${feature.toUpperCase()}.\n\nNEW INSTRUCTIONS:\n${instruction}`;
      this.sendTextMessage(updateMsg);
    }
  }

  /**
   * Handle function calls from Gemini AI
   */
  private handleFunctionCall(name: string, args: Record<string, unknown>, callId?: string): void {
    console.log(`[LiveSight] Function call: ${name}`, args);

    let result: Record<string, unknown> = { success: true };

    switch (name) {
      case 'reportObstacle': {
        const severity = args.severity as string;
        const type = args.type as string || 'obstacle';
        const direction = args.direction as number || 12;
        const distance = args.distance as number;

        const desc = `${type} at ${direction} o'clock${distance ? `, ${distance}m` : ''}`;

        if (severity === 'critical') {
          this.callbacks.onHazard(`DANGER! ${desc}`);
          if (this.callbacks.onVehicleDanger) {
            this.callbacks.onVehicleDanger('critical', desc);
          }
        } else if (severity === 'warning') {
          this.callbacks.onHazard(`WARNING: ${desc}`);
        }
        result = { reported: true, severity };
        break;
      }

      case 'switchMode': {
        const mode = args.mode as string;
        const reason = args.reason as string;
        if (this.callbacks.onModeSwitch) {
          this.callbacks.onModeSwitch(mode, reason);
        }
        result = { switched: true, mode };
        break;
      }

      case 'triggerEmergency': {
        const reason = args.reason as string || 'AI detected emergency';
        if (this.callbacks.onEmergency) {
          this.callbacks.onEmergency(reason);
        }
        result = { triggered: true };
        break;
      }

      case 'announceEnvironment': {
        const description = args.description as string;
        const safetyLevel = args.safetyLevel as string;
        if (description) {
          this.callbacks.onTranscript(description, false);
        }
        if (safetyLevel === 'danger') {
          this.callbacks.onHazard(description || 'Dangerous area detected');
        }
        result = { announced: true };
        break;
      }

      default:
        result = { error: `Unknown function: ${name}` };
    }

    // Send function response back to Gemini
    if (this.session && callId) {
      try {
        this.session.sendToolResponse({
          functionResponses: [{
            id: callId,
            response: result,
          }],
        });
      } catch (e) {
        console.warn('[LiveSight] Failed to send tool response:', e);
      }
    }
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    this.isStarting = false; // Reset starting flag
    this.isConnected = false;

    // Cleanup offline mode
    this.disableOfflineMode();

    if (this.videoInterval) {
      clearInterval(this.videoInterval);
      this.videoInterval = null;
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      this.audioStream = null;
    }

    this.inputSource?.disconnect();
    this.processor?.disconnect();

    this.inputAudioContext?.close().catch(() => { });
    this.outputAudioContext?.close().catch(() => { });

    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.inputSource = null;
    this.processor = null;
    this.nextStartTime = 0;
  }
}

export type { VoiceCommand };
