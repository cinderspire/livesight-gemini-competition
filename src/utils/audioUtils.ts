import type { AudioBlob } from '../types';

/**
 * Audio Utility Functions
 * Handles audio encoding/decoding for Gemini Live API
 */

/**
 * Convert Base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  let binary = '';

  // Process in chunks to avoid call stack size exceeded
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

/**
 * Convert Float32Array from AudioContext to PCM Int16 ArrayBuffer
 * This is required for sending audio to Gemini Live API
 */
export function float32ToInt16(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);

  for (let i = 0; i < float32Array.length; i++) {
    // Clamp value between -1 and 1
    const value = float32Array[i] ?? 0;
    const s = Math.max(-1, Math.min(1, value));
    // Convert to 16-bit integer
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  return int16Array;
}

/**
 * Convert Int16 PCM to Float32 for AudioContext
 */
export function int16ToFloat32(int16Array: Int16Array): Float32Array {
  const float32Array = new Float32Array(int16Array.length);

  for (let i = 0; i < int16Array.length; i++) {
    const value = int16Array[i] ?? 0;
    float32Array[i] = value / 32768.0;
  }

  return float32Array;
}

/**
 * Create PCM Blob for sending to Gemini Live API
 */
export function createPcmBlob(data: Float32Array): AudioBlob {
  const int16 = float32ToInt16(data);
  return {
    data: arrayBufferToBase64(int16.buffer),
    mimeType: 'audio/pcm;rate=16000',
  };
}

/**
 * Decode audio data from Gemini Live API response
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate = 24000,
  numChannels = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      const index = i * numChannels + channel;
      const value = dataInt16[index] ?? 0;
      channelData[i] = value / 32768.0;
    }
  }

  return buffer;
}

/**
 * Calculate RMS (Root Mean Square) volume level
 */
export function calculateRmsLevel(data: Float32Array): number {
  if (data.length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const value = data[i] ?? 0;
    sum += value * value;
  }
  return Math.sqrt(sum / data.length);
}

/**
 * Normalize volume level to 0-1 range with multiplier
 */
export function normalizeVolume(rms: number, multiplier = 5): number {
  return Math.min(1, rms * multiplier);
}
