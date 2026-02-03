import type { ColorDetectionResult, ColorInfo } from '../../types';
import { ACCESSIBILITY_PROMPTS } from '../../constants';

/**
 * Color Detection Service
 * Analyzes images to identify colors and provide styling suggestions
 */

// Predefined color data for common colors
const COLOR_DATABASE: Record<string, Omit<ColorInfo, 'name'>> = {
  red: { hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, category: 'warm' },
  orange: { hex: '#FFA500', rgb: { r: 255, g: 165, b: 0 }, category: 'warm' },
  yellow: { hex: '#FFFF00', rgb: { r: 255, g: 255, b: 0 }, category: 'warm' },
  green: { hex: '#00FF00', rgb: { r: 0, g: 255, b: 0 }, category: 'cool' },
  blue: { hex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, category: 'cool' },
  purple: { hex: '#800080', rgb: { r: 128, g: 0, b: 128 }, category: 'cool' },
  pink: { hex: '#FFC0CB', rgb: { r: 255, g: 192, b: 203 }, category: 'warm' },
  brown: { hex: '#A52A2A', rgb: { r: 165, g: 42, b: 42 }, category: 'warm' },
  black: { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, category: 'neutral' },
  white: { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, category: 'neutral' },
  gray: { hex: '#808080', rgb: { r: 128, g: 128, b: 128 }, category: 'neutral' },
  grey: { hex: '#808080', rgb: { r: 128, g: 128, b: 128 }, category: 'neutral' },
  beige: { hex: '#F5F5DC', rgb: { r: 245, g: 245, b: 220 }, category: 'neutral' },
  navy: { hex: '#000080', rgb: { r: 0, g: 0, b: 128 }, category: 'cool' },
  teal: { hex: '#008080', rgb: { r: 0, g: 128, b: 128 }, category: 'cool' },
  maroon: { hex: '#800000', rgb: { r: 128, g: 0, b: 0 }, category: 'warm' },
  olive: { hex: '#808000', rgb: { r: 128, g: 128, b: 0 }, category: 'warm' },
  coral: { hex: '#FF7F50', rgb: { r: 255, g: 127, b: 80 }, category: 'warm' },
  cyan: { hex: '#00FFFF', rgb: { r: 0, g: 255, b: 255 }, category: 'cool' },
  magenta: { hex: '#FF00FF', rgb: { r: 255, g: 0, b: 255 }, category: 'warm' },
  lavender: { hex: '#E6E6FA', rgb: { r: 230, g: 230, b: 250 }, category: 'cool' },
  turquoise: { hex: '#40E0D0', rgb: { r: 64, g: 224, b: 208 }, category: 'cool' },
  burgundy: { hex: '#800020', rgb: { r: 128, g: 0, b: 32 }, category: 'warm' },
  cream: { hex: '#FFFDD0', rgb: { r: 255, g: 253, b: 208 }, category: 'neutral' },
  tan: { hex: '#D2B48C', rgb: { r: 210, g: 180, b: 140 }, category: 'neutral' },
  khaki: { hex: '#F0E68C', rgb: { r: 240, g: 230, b: 140 }, category: 'neutral' },
};

// Color matching suggestions based on color theory
const COLOR_MATCHES: Record<string, string[]> = {
  red: ['white', 'black', 'navy', 'gray', 'beige'],
  orange: ['blue', 'navy', 'white', 'brown', 'black'],
  yellow: ['purple', 'navy', 'gray', 'black', 'white'],
  green: ['white', 'black', 'gray', 'beige', 'brown'],
  blue: ['white', 'gray', 'orange', 'beige', 'brown'],
  purple: ['white', 'gray', 'yellow', 'silver', 'black'],
  pink: ['gray', 'navy', 'white', 'black', 'beige'],
  brown: ['white', 'beige', 'blue', 'orange', 'cream'],
  black: ['white', 'gray', 'red', 'yellow', 'any color'],
  white: ['black', 'navy', 'gray', 'any color'],
  gray: ['black', 'white', 'pink', 'blue', 'any color'],
  navy: ['white', 'yellow', 'orange', 'beige', 'red'],
  beige: ['brown', 'navy', 'white', 'green', 'burgundy'],
};

/**
 * Get color info from name
 */
function getColorInfo(colorName: string): ColorInfo {
  const normalizedName = colorName.toLowerCase().trim();
  const colorData = COLOR_DATABASE[normalizedName];

  if (colorData) {
    return {
      name: normalizedName,
      ...colorData,
      matchingSuggestions: COLOR_MATCHES[normalizedName] || [],
    };
  }

  // Return a default for unknown colors
  return {
    name: normalizedName,
    hex: '#808080',
    rgb: { r: 128, g: 128, b: 128 },
    category: 'neutral',
    matchingSuggestions: ['white', 'black', 'gray'],
  };
}

/**
 * Parse AI response to extract color info
 */
export function parseColorResponse(response: string): ColorDetectionResult {
  const result: ColorDetectionResult = {
    primary: getColorInfo('unknown'),
  };

  // Extract primary color
  const primaryPatterns = [
    /(?:primary|main|dominant)\s*(?:color)?[:\s]*(\w+)/i,
    /(?:this|the)\s+(?:item|clothing|fabric)\s+is\s+(\w+)/i,
    /color[:\s]*(\w+)/i,
    /(?:ana|baskın)\s*renk[:\s]*(\w+)/i, // TR
    /rengi[:\s]*(\w+)/i, // TR
  ];

  for (const pattern of primaryPatterns) {
    const match = response.match(pattern);
    if (match?.[1]) {
      result.primary = getColorInfo(match[1]);
      break;
    }
  }

  // Extract secondary color
  const secondaryPatterns = [
    /(?:secondary|accent)\s*(?:color)?[:\s]*(\w+)/i,
    /with\s+(\w+)\s+(?:accents?|details?|trim)/i,
    /(?:ikincil|detay)\s*renk[:\s]*(\w+)/i, // TR
    /(\w+)\s*detaylar/i, // TR
  ];

  for (const pattern of secondaryPatterns) {
    const match = response.match(pattern);
    if (match?.[1]) {
      result.secondary = getColorInfo(match[1]);
      break;
    }
  }

  // Extract pattern
  const patternMatch = response.match(/(?:pattern|design|desen)[:\s]*(solid|striped|plaid|floral|geometric|checkered|çizgili|kareli|çiçekli|düz)/i);
  if (patternMatch?.[1]) {
    const pattern = patternMatch[1].toLowerCase();
    if (pattern === 'checkered') {
      result.pattern = 'plaid';
    } else {
      result.pattern = pattern as ColorDetectionResult['pattern'];
    }
  }

  // Extract material
  const materialMatch = response.match(/(?:material|fabric)[:\s]*(\w+)/i);
  if (materialMatch?.[1]) {
    result.material = materialMatch[1];
  }

  // Generate styling suggestion
  if (result.primary.matchingSuggestions && result.primary.matchingSuggestions.length > 0) {
    const suggestions = result.primary.matchingSuggestions.slice(0, 3).join(', ');
    result.suggestion = `This ${result.primary.name} item pairs well with ${suggestions}`;
  }

  return result;
}

/**
 * Generate voice announcement for color result
 */
export function getColorAnnouncement(result: ColorDetectionResult): string {
  let announcement = `This is ${result.primary.name}`;

  if (result.pattern && result.pattern !== 'solid') {
    announcement += ` with a ${result.pattern} pattern`;
  }

  if (result.secondary) {
    announcement += ` and ${result.secondary.name} accents`;
  }

  if (result.material) {
    announcement += `. The material appears to be ${result.material}`;
  }

  announcement += '.';

  // Add styling suggestion
  if (result.suggestion) {
    announcement += ` ${result.suggestion}.`;
  }

  return announcement;
}

/**
 * Get the Gemini prompt for color detection
 */
export function getColorPrompt(): string {
  return ACCESSIBILITY_PROMPTS.COLOR;
}

/**
 * Get contrast information for accessibility
 */
export function getContrastInfo(color1: ColorInfo, color2: ColorInfo): {
  ratio: number;
  isAccessible: boolean;
  recommendation: string;
} {
  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
  };

  const l1 = getLuminance(color1.rgb);
  const l2 = getLuminance(color2.rgb);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio,
    isAccessible: ratio >= 4.5,
    recommendation: ratio >= 4.5
      ? 'Good contrast for readability'
      : 'Low contrast - may be difficult to distinguish',
  };
}

export default {
  parseColorResponse,
  getColorAnnouncement,
  getColorPrompt,
  getContrastInfo,
};
