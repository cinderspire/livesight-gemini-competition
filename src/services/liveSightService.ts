import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';
import type { UserSettings, WeatherContext, VoiceCommand, LiveSightCallbacks, VehicleDangerLevel } from '../types';
import { AUDIO_CONFIG, VIDEO_CONFIG, AI_CONFIG, URGENT_KEYWORDS, COMMAND_KEYWORDS, VEHICLE_DANGER_CONFIG, MODE_PROMPTS } from '../constants';
import { parseTrafficLightResponse } from '../features/traffic-light/trafficLightService';
import { parseColorResponse } from '../features/color-detection/colorService';
import { parseExpirationResponse } from '../features/expiration/expirationService';

// Connection timeout in milliseconds
// Connection timeout in milliseconds
const CONNECTION_TIMEOUT = 30000; // Increased to 30s for stability
const RECONNECT_DELAY = 1000; // 1 second between reconnects

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
  private activeFeature: string = 'navigation';

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

  private getSystemInstruction(activeFeature: string = 'navigation'): string {
    // Select the appropriate prompt based on active feature
    let prompt: string = MODE_PROMPTS.NAVIGATION; // Default strategy

    switch (activeFeature) {
      case 'traffic':
        prompt = MODE_PROMPTS.TRAFFIC_LIGHT;
        break;
      case 'color':
        prompt = MODE_PROMPTS.COLOR;
        break;
      case 'expiration':
        prompt = MODE_PROMPTS.EXPIRATION;
        break;
      case 'explore':
        prompt = MODE_PROMPTS.EXPLORE;
        break;
      case 'community':
        prompt = MODE_PROMPTS.COMMUNITY;
        break;
      case 'navigation':
      default:
        prompt = MODE_PROMPTS.NAVIGATION;
        break;
    }

    // Append general behavior rules that apply to all modes
    return `${prompt}

GENERAL RULES:
- Keep responses short (Max 1-2 sentences).
- Do not say "OK" or "Got it" unless it's an emergency confirmation.
- Sound natural and reassuring.
- Adapt language to the user (respond in the same language they speak).`;
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
      if (extras?.heading != null) msg += `, heading=${Math.round(extras.heading)}°`;
      if (extras?.speed != null) msg += `, speed=${(extras.speed * 3.6).toFixed(1)}km/h`;
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

      const session = await this.ai.live.connect({
        model: AI_CONFIG.MODEL_NAME,
        config: {
          systemInstruction: this.getSystemInstruction(),
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: AI_CONFIG.VOICE_NAME }
            }
          },
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


    if (this.isConnected) {
      this.isConnected = false;
      this.session = null;

      // Try to reconnect if enabled and within limits
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.callbacks.onTranscript(`Connection lost. Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, false);
        this.callbacks.onStatusChange('connecting');

        // Wait briefly before reconnecting
        setTimeout(() => {
          if (this.shouldReconnect) {
            this.reconnect();
          }
        }, RECONNECT_DELAY);
      } else {
        this.callbacks.onTranscript('Connection closed. Tap the button to restart.', false);
        this.callbacks.onStatusChange('disconnected');
        this.cleanup();
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

      const session = await this.ai.live.connect({
        model: AI_CONFIG.MODEL_NAME,
        config: {
          systemInstruction: this.getSystemInstruction(),
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: AI_CONFIG.VOICE_NAME }
            }
          },
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

    this.callbacks.onStatusChange('connected');
    this.callbacks.onTranscript('Reconnected! Resuming...', false);

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

    // Adaptive Frame Rate Strategy
    const getInterval = () => {
      // High speed for critical safety features
      if (this.activeFeature === 'traffic') return 200; // 5 FPS
      if (this.activeFeature === 'navigation') return 250; // 4 FPS

      // Standard speed for reading/analysis
      if (this.activeFeature === 'expiration') return 500; // 2 FPS
      if (this.activeFeature === 'color') return 1000; // 1 FPS

      // Economy mode
      return 333; // ~3 FPS
    };

    const interval = getInterval();
    console.log(`[LiveSight] Video stream: ${1000 / interval} FPS (${this.activeFeature})`);

    this.videoInterval = setInterval(() => {
      this.sendRealtimeInput();
    }, interval);
  }
  /**
   * Capture and send a single video frame to AI
   */
  private sendRealtimeInput(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx || !this.isConnected || !this.session || !this.videoElement || this.videoElement.paused) return;

    try {
      this.canvas.width = VIDEO_CONFIG.WIDTH;
      this.canvas.height = VIDEO_CONFIG.HEIGHT;
      ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

      const dataUrl = this.canvas.toDataURL('image/jpeg', VIDEO_CONFIG.JPEG_QUALITY);
      const base64Data = dataUrl.split(',')[1];

      if (base64Data) {
        this.session.sendRealtimeInput({
          media: { mimeType: 'image/jpeg', data: base64Data }
        });
      }
    } catch (e) {
      console.warn('[LiveSight] Video frame send failed:', e);
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
      if (!this.isMuted) {
        try {
          const pcmBlob = createPcmBlob(inputData);
          // Use 'audio' parameter instead of 'media' for audio data
          this.session.sendRealtimeInput({ audio: pcmBlob });
        } catch (e) {
          console.warn('[LiveSight] Audio send failed:', e);
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
   * Clean up resources
   */
  private cleanup(): void {
    this.isStarting = false; // Reset starting flag
    this.isConnected = false;

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
