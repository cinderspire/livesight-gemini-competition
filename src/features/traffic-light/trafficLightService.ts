import type { TrafficLightDetection, TrafficLightState, ClockDirection } from '../../types';
import { ACCESSIBILITY_PROMPTS } from '../../constants';

/**
 * Traffic Light Detection Service
 * Analyzes images to detect traffic light states
 */

/**
 * Parse AI response to extract traffic light info
 */
export function parseTrafficLightResponse(response: string): TrafficLightDetection {
  const result: TrafficLightDetection = {
    state: 'unknown',
    confidence: 0,
    pedestrianSignal: false,
    direction: 12,
  };

  const lowerResponse = response.toLowerCase();

  // Detect state
  if (
    (lowerResponse.includes('green') && !lowerResponse.includes('no green')) ||
    (lowerResponse.includes('yeşil') && !lowerResponse.includes('yeşil değil'))
  ) {
    result.state = 'green';
    result.confidence = 0.9;
  } else if (
    (lowerResponse.includes('red') && !lowerResponse.includes('no red')) ||
    (lowerResponse.includes('kırmızı') && !lowerResponse.includes('kırmızı değil')) ||
    lowerResponse.includes('dur')
  ) {
    result.state = 'red';
    result.confidence = 0.9;
  } else if (
    lowerResponse.includes('yellow') ||
    lowerResponse.includes('amber') ||
    lowerResponse.includes('sarı')
  ) {
    result.state = 'yellow';
    result.confidence = 0.85;
  } else if (
    lowerResponse.includes('flashing') ||
    lowerResponse.includes('yanıp')
  ) {
    result.state = 'flashing';
    result.confidence = 0.8;
  }

  // Detect pedestrian signal
  if (
    lowerResponse.includes('walk') ||
    lowerResponse.includes('pedestrian') ||
    lowerResponse.includes('cross') ||
    lowerResponse.includes('yürü') ||
    lowerResponse.includes('geç') ||
    lowerResponse.includes('yaya')
  ) {
    result.pedestrianSignal = true;
  }

  // Extract countdown if mentioned
  const countdownMatch = response.match(/(\d+)\s*(?:seconds?|sec)/i);
  if (countdownMatch?.[1]) {
    result.countdown = parseInt(countdownMatch[1], 10);
  }

  // Extract direction
  const directionMatch = response.match(/(\d{1,2})\s*o['']?clock/i);
  if (directionMatch?.[1]) {
    const dir = parseInt(directionMatch[1], 10);
    if (dir >= 1 && dir <= 12) {
      result.direction = dir as ClockDirection;
    }
  }

  return result;
}

/**
 * Generate voice announcement for traffic light
 */
export function getTrafficLightAnnouncement(result: TrafficLightDetection): string {
  const directionText = result.direction !== 12
    ? `at ${result.direction} o'clock`
    : 'ahead';

  switch (result.state) {
    case 'green':
      if (result.pedestrianSignal) {
        const countdownText = result.countdown
          ? ` ${result.countdown} seconds remaining.`
          : '';
        return `SAFE TO CROSS. Pedestrian signal is GREEN ${directionText}.${countdownText} Proceed with caution.`;
      }
      return `Traffic light is GREEN ${directionText}. Vehicles may be moving.`;

    case 'red':
      if (result.pedestrianSignal) {
        return `STOP. Do not cross. Signal is RED ${directionText}. Wait for green.`;
      }
      return `Traffic light is RED ${directionText}. Traffic should be stopped.`;

    case 'yellow':
      return `CAUTION. Light is YELLOW ${directionText}. Signal changing soon. Wait if crossing.`;

    case 'flashing':
      return `FLASHING SIGNAL ${directionText}. Proceed with extra caution. Look both ways before crossing.`;

    case 'unknown':
    default:
      return `Unable to clearly detect traffic light state ${directionText}. Please wait and verify before crossing.`;
  }
}

/**
 * Get safety recommendation based on state
 */
export function getSafetyRecommendation(state: TrafficLightState): {
  action: 'go' | 'wait' | 'caution';
  message: string;
  urgency: 'low' | 'medium' | 'high';
} {
  switch (state) {
    case 'green':
      return {
        action: 'go',
        message: 'Safe to proceed. Stay alert.',
        urgency: 'low',
      };
    case 'red':
      return {
        action: 'wait',
        message: 'Wait for signal change.',
        urgency: 'medium',
      };
    case 'yellow':
      return {
        action: 'caution',
        message: 'Signal changing. Do not start crossing.',
        urgency: 'high',
      };
    case 'flashing':
      return {
        action: 'caution',
        message: 'Flashing signal. Extra caution required.',
        urgency: 'high',
      };
    default:
      return {
        action: 'wait',
        message: 'Cannot determine signal. Wait and verify.',
        urgency: 'high',
      };
  }
}

/**
 * Get the Gemini prompt for traffic light detection
 */
export function getTrafficLightPrompt(): string {
  return ACCESSIBILITY_PROMPTS.TRAFFIC_LIGHT;
}

/**
 * Estimate wait time based on typical signal patterns
 */
export function estimateWaitTime(state: TrafficLightState, countdown?: number): string {
  if (countdown) {
    return `Approximately ${countdown} seconds`;
  }

  switch (state) {
    case 'red':
      return 'Typical wait: 30-60 seconds';
    case 'yellow':
      return 'Changing in 3-5 seconds';
    case 'green':
      return 'Time remaining unknown';
    default:
      return 'Wait time unknown';
  }
}

export default {
  parseTrafficLightResponse,
  getTrafficLightAnnouncement,
  getSafetyRecommendation,
  getTrafficLightPrompt,
  estimateWaitTime,
};
