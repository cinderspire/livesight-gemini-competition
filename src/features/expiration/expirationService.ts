import type { ExpirationDateResult } from '../../types';
import { ACCESSIBILITY_PROMPTS } from '../../constants';

/**
 * Expiration Date Service
 * Analyzes images to find and read expiration dates
 */

// Parse various date formats
function parseExpirationDate(dateStr: string): Date | null {
  // Common date formats to try
  const formats = [
    // MM/DD/YYYY, MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    // YYYY/MM/DD, YYYY-MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    // DD MMM YYYY, DD MMMM YYYY (Turkish + English)
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)[a-z]*\s+(\d{2,4})/i,
    // MMM DD YYYY
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)[a-z]*\s+(\d{1,2}),?\s+(\d{2,4})/i,
    // Best by: or Exp: followed by date (including Turkish idioms)
    /(?:best\s*by|exp(?:iry)?|use\s*by|son\s*kullanma|skt|tett)[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch {
        // Continue to next format
      }
    }
  }

  // Try native Date parsing
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch {
    return null;
  }

  return null;
}

// Calculate days remaining
function calculateDaysRemaining(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expDate = new Date(date);
  expDate.setHours(0, 0, 0, 0);
  const diffTime = expDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Determine expiration status
function getExpirationStatus(daysRemaining: number): ExpirationDateResult['status'] {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 7) return 'expiring_soon';
  return 'valid';
}

/**
 * Parse AI response to extract expiration date info
 */
export function parseExpirationResponse(response: string): ExpirationDateResult {
  // Default result
  const result: ExpirationDateResult = {
    found: false,
    status: 'not_found',
    confidence: 0,
  };

  // Check if no date was found
  const noDatePatterns = [
    /no\s+(?:expiration|expiry|date)/i,
    /not\s+(?:found|visible|readable)/i,
    /cannot\s+(?:find|read|detect)/i,
    /unable\s+to/i,
  ];

  if (noDatePatterns.some(p => p.test(response))) {
    return result;
  }

  // Extract date from response
  const datePatterns = [
    /(?:expir(?:ation|es?|y)|best\s*by|use\s*by|son\s*kullanma|skt|tett|tarih)[:\s]*([^,.\n]+)/i,
    /date[:\s]*([^,.\n]+)/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = response.match(pattern);
    if (match?.[1]) {
      const parsedDate = parseExpirationDate(match[1].trim());
      if (parsedDate) {
        const daysRemaining = calculateDaysRemaining(parsedDate);
        result.found = true;
        result.date = parsedDate;
        result.dateString = parsedDate.toLocaleDateString();
        result.daysRemaining = daysRemaining;
        result.status = getExpirationStatus(daysRemaining);
        result.confidence = 0.85;
        break;
      }
    }
  }

  // Extract product name if mentioned
  const productMatch = response.match(/(?:product|item)[:\s]*([^,.\n]+)/i);
  if (productMatch?.[1]) {
    result.productName = productMatch[1].trim();
  }

  return result;
}

/**
 * Generate voice announcement for expiration result
 */
export function getExpirationAnnouncement(result: ExpirationDateResult): string {
  if (!result.found) {
    return "I couldn't find an expiration date on this product. Please try adjusting the angle or lighting.";
  }

  const productText = result.productName ? `The ${result.productName}` : 'This product';

  switch (result.status) {
    case 'expired':
      return `WARNING! ${productText} has expired. It expired ${Math.abs(result.daysRemaining || 0)} days ago on ${result.dateString}. Please do not consume.`;

    case 'expiring_soon':
      return `CAUTION! ${productText} expires soon. ${result.daysRemaining} days remaining. Expiration date is ${result.dateString}.`;

    case 'valid':
      return `${productText} is still good. It expires on ${result.dateString}, ${result.daysRemaining} days from now.`;

    default:
      return "I couldn't determine the expiration status. Please try again.";
  }
}

/**
 * Get the Gemini prompt for expiration date reading
 */
export function getExpirationPrompt(): string {
  return ACCESSIBILITY_PROMPTS.EXPIRATION;
}

export default {
  parseExpirationResponse,
  getExpirationAnnouncement,
  getExpirationPrompt,
};
