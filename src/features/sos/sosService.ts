import type { SOSEvent, EmergencyContact, LocationData } from '../../types';

/**
 * SOS Emergency Service
 * Handles emergency alerts and contact notifications
 */

/**
 * Create SOS event
 */
export function createSOSEvent(
  location: LocationData | null,
  batteryLevel: number,
  contacts: EmergencyContact[],
  message?: string
): SOSEvent {
  return {
    id: `sos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    location: location || { lat: 0, lon: 0 },
    batteryLevel,
    status: 'active',
    contacts: contacts.map(c => c.id),
    message: message || 'Emergency SOS triggered via LiveSight app',
  };
}

/**
 * Format location for sharing
 */
export function formatLocationForShare(location: LocationData): string {
  const { lat, lon, accuracy, address } = location;

  let locationText = `Location: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;

  if (address) {
    locationText = `Address: ${address}\n${locationText}`;
  }

  if (accuracy) {
    locationText += `\nAccuracy: ±${Math.round(accuracy)}m`;
  }

  // Google Maps link
  const mapsLink = `https://maps.google.com/?q=${lat},${lon}`;
  locationText += `\n\nMap: ${mapsLink}`;

  return locationText;
}

/**
 * Generate emergency message
 */
export function generateEmergencyMessage(
  event: SOSEvent,
  userName?: string
): string {
  const name = userName || 'A LiveSight user';
  const time = new Date(event.timestamp).toLocaleString();
  const locationText = formatLocationForShare(event.location);

  return `🆘 EMERGENCY ALERT 🆘

${name} has triggered an emergency SOS at ${time}.

${locationText}

Battery Level: ${event.batteryLevel}%

${event.message ? `Message: ${event.message}` : ''}

Please respond immediately or contact emergency services if unable to reach them.

---
Sent via LiveSight App`;
}

/**
 * Send SMS (uses native SMS intent)
 */
export function sendSMS(phoneNumber: string, message: string): void {
  const encodedMessage = encodeURIComponent(message);
  const smsUrl = `sms:${phoneNumber}?body=${encodedMessage}`;
  window.location.href = smsUrl;
}

/**
 * Make phone call
 */
export function makeCall(phoneNumber: string): void {
  window.location.href = `tel:${phoneNumber}`;
}

/**
 * Share location via Web Share API
 */
export async function shareLocation(event: SOSEvent): Promise<boolean> {
  const message = generateEmergencyMessage(event);

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Emergency SOS - LiveSight',
        text: message,
      });
      return true;
    } catch (error) {
      console.warn('[SOS] Share failed:', error);
    }
  }

  // Fallback: copy to clipboard
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(message);
      return true;
    } catch (error) {
      console.warn('[SOS] Clipboard copy failed:', error);
    }
  }

  return false;
}

/**
 * Trigger emergency notification to contacts
 */
export async function notifyContacts(
  event: SOSEvent,
  contacts: EmergencyContact[]
): Promise<{ success: boolean; notified: string[] }> {
  const notified: string[] = [];
  const message = generateEmergencyMessage(event);

  // Sort contacts by primary first
  const sortedContacts = [...contacts].sort((a, b) =>
    a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
  );

  for (const contact of sortedContacts) {
    try {
      // Try to send SMS
      sendSMS(contact.phone, message);
      notified.push(contact.id);
    } catch (error) {
      console.error(`[SOS] Failed to notify ${contact.name}:`, error);
    }
  }

  return {
    success: notified.length > 0,
    notified,
  };
}

/**
 * Get emergency services number based on location
 */
export function getEmergencyNumber(countryCode?: string): string {
  const emergencyNumbers: Record<string, string> = {
    US: '911',
    UK: '999',
    EU: '112',
    AU: '000',
    TR: '112',
    default: '112',
  };

  return emergencyNumbers[countryCode || 'default'] || '112';
}

/**
 * Call emergency services
 */
export function callEmergencyServices(countryCode?: string): void {
  const number = getEmergencyNumber(countryCode);
  makeCall(number);
}

/**
 * Resolve SOS event
 */
export function resolveSOSEvent(event: SOSEvent): SOSEvent {
  return {
    ...event,
    status: 'resolved',
  };
}

/**
 * Cancel SOS event
 */
export function cancelSOSEvent(event: SOSEvent): SOSEvent {
  return {
    ...event,
    status: 'cancelled',
  };
}

/**
 * Get SOS status message
 */
export function getSOSStatusMessage(event: SOSEvent): string {
  switch (event.status) {
    case 'active':
      return 'Emergency alert is active. Help is on the way.';
    case 'resolved':
      return 'Emergency has been resolved. Stay safe.';
    case 'cancelled':
      return 'Emergency alert has been cancelled.';
    default:
      return 'Unknown status';
  }
}

export default {
  createSOSEvent,
  formatLocationForShare,
  generateEmergencyMessage,
  sendSMS,
  makeCall,
  shareLocation,
  notifyContacts,
  getEmergencyNumber,
  callEmergencyServices,
  resolveSOSEvent,
  cancelSOSEvent,
  getSOSStatusMessage,
};
