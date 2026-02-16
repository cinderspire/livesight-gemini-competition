const STORAGE_KEY = 'livesight_api_key';

/**
 * Validate a Gemini API key by making a lightweight API call
 */
export async function validateApiKey(key: string): Promise<{ valid: boolean; error?: string }> {
  if (!key || key.length < 10) {
    return { valid: false, error: 'API key is too short' };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
      { method: 'GET', signal: AbortSignal.timeout(10000) }
    );

    if (response.ok) {
      return { valid: true };
    }

    if (response.status === 400 || response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key' };
    }

    return { valid: false, error: `API returned status ${response.status}` };
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return { valid: false, error: 'Request timed out' };
    }
    return { valid: false, error: 'Network error. Check your connection.' };
  }
}

/**
 * Mask an API key for display: AIza...wo_8
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '***';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

/**
 * Save API key to localStorage
 */
export function saveApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // localStorage may be full or unavailable
  }
}

/**
 * Load API key from localStorage
 */
export function loadApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Clear API key from localStorage
 */
export function clearApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
