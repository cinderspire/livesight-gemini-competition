import type { WeatherContext } from '../types';
import { API_CONFIG, WEATHER_CODES, DEFAULT_WEATHER } from '../constants';

/**
 * Weather Service
 * Fetches weather data from Open-Meteo API
 */

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
  };
}

/**
 * Interpret WMO weather code to human-readable condition
 */
function interpretWeatherCode(code: number): { condition: string; isWet: boolean } {
  const { DRIZZLE_RAIN, SNOW, SHOWERS, THUNDERSTORM, CLOUDY_CLEAR, FOG } = WEATHER_CODES;

  if (code >= DRIZZLE_RAIN.min && code <= DRIZZLE_RAIN.max) {
    return { condition: 'Drizzle/Rain', isWet: true };
  }
  if (code >= SNOW.min && code <= SNOW.max) {
    return { condition: 'Snow', isWet: true };
  }
  if (code >= SHOWERS.min && code <= SHOWERS.max) {
    return { condition: 'Showers', isWet: true };
  }
  if (code >= THUNDERSTORM.min) {
    return { condition: 'Thunderstorm', isWet: true };
  }
  if (code >= FOG.min && code <= FOG.max) {
    return { condition: 'Fog', isWet: true };
  }
  if (code <= CLOUDY_CLEAR.max) {
    return { condition: code === 0 ? 'Clear' : 'Cloudy', isWet: false };
  }

  return { condition: 'Unknown', isWet: false };
}

/**
 * Fetch weather data for given coordinates
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherContext> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m,weather_code,precipitation,rain,showers,snowfall',
      timezone: 'auto',
    });

    const response = await fetch(`${API_CONFIG.WEATHER_BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: OpenMeteoResponse = await response.json();
    const current = data.current;

    const { condition, isWet } = interpretWeatherCode(current.weather_code);

    return {
      condition,
      temperature: Math.round(current.temperature_2m),
      isWet,
      locationName: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    };
  } catch (error) {
    console.error('[WeatherService] Fetch failed:', error);
    return {
      ...DEFAULT_WEATHER,
      condition: 'Unavailable',
      temperature: 20,
    };
  }
}

/**
 * Get weather description for screen readers
 */
export function getWeatherDescription(weather: WeatherContext): string {
  const wetStatus = weather.isWet ? 'Surfaces may be wet.' : 'Surfaces are dry.';
  return `Current weather: ${weather.condition}, ${weather.temperature} degrees Celsius. ${wetStatus}`;
}
