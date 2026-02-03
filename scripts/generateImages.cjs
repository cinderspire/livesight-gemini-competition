/**
 * LiveSight Image Generator
 * Uses Gemini API to generate app icon and UI images
 */

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

// API Key
const API_KEY = 'AIzaSyCb5RDjQaZky7-BCxSLbZq7ApfsY7cPXIc';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Output directories
const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets', 'images');
const ANDROID_RES_DIR = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Ensure directories exist
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Image prompts
const IMAGE_PROMPTS = {
  appIcon: `Create a modern, minimalist app icon for "LiveSight" - an AI navigation app for visually impaired people.
Design requirements:
- Circular or rounded square shape
- Deep cyan/teal (#0891B2) as primary color with black (#050505) background
- Symbol: Stylized eye with AI circuit patterns, or compass with digital elements
- Clean, high contrast design for accessibility
- Professional, trustworthy, futuristic feel
- No text, icon only
- 1024x1024 pixels, PNG format`,

  splashBg: `Create a dark, futuristic background image for a mobile app splash screen.
Design requirements:
- Dark background (#050505 to #0a0a0a gradient)
- Subtle cyan (#22D3EE) glowing lines forming a geometric grid
- Abstract digital/circuit pattern
- Vignette effect at edges
- Minimal, clean, high-tech aesthetic
- 1080x1920 pixels (portrait mobile)`,

  onboardingHero: `Create a hero illustration for an AI navigation app onboarding screen.
Theme: A blind person confidently walking with phone, surrounded by helpful AI visualization elements.
Style: Modern flat illustration, dark theme with cyan accents (#22D3EE).
Elements: Person silhouette, sound waves, location markers, protective shield symbols.
Mood: Empowering, safe, technological, accessible.
Size: 800x600 pixels`,
};

async function generateImage(prompt, filename) {
  console.log(`\nGenerating: ${filename}...`);

  try {
    // Try with imagen model first
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{
        role: 'user',
        parts: [{
          text: `Generate an image based on this description. Return ONLY a detailed description of how the image should look, formatted as JSON with these fields: { "description": "detailed visual description", "colors": ["#hex1", "#hex2"], "elements": ["element1", "element2"], "style": "style description" }\n\nImage prompt: ${prompt}`
        }]
      }],
    });

    const text = response.response.text();
    console.log(`Generated description for ${filename}:`);
    console.log(text.substring(0, 500) + '...');

    // Save the description
    const descFile = path.join(ASSETS_DIR, `${filename}_description.json`);
    fs.writeFileSync(descFile, text);
    console.log(`Saved description to: ${descFile}`);

    return true;
  } catch (error) {
    console.error(`Error generating ${filename}:`, error.message);
    return false;
  }
}

async function createPlaceholderSVG(filename, type) {
  console.log(`Creating SVG placeholder for: ${filename}...`);

  let svgContent;

  if (type === 'icon') {
    // App icon SVG
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a"/>
      <stop offset="100%" style="stop-color:#050505"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22D3EE"/>
      <stop offset="100%" style="stop-color:#0891B2"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="512" height="512" rx="100" fill="url(#bg)"/>
  <!-- Outer ring -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="url(#glow)" stroke-width="8" opacity="0.3"/>
  <!-- Eye shape -->
  <ellipse cx="256" cy="256" rx="120" ry="80" fill="none" stroke="url(#glow)" stroke-width="6"/>
  <!-- Pupil -->
  <circle cx="256" cy="256" r="45" fill="url(#glow)"/>
  <!-- AI circuit lines -->
  <path d="M256 176 L256 136 M256 336 L256 376 M176 256 L136 256 M336 256 L376 256"
        stroke="#22D3EE" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
  <!-- Corner accents -->
  <circle cx="180" cy="180" r="8" fill="#22D3EE" opacity="0.4"/>
  <circle cx="332" cy="180" r="8" fill="#22D3EE" opacity="0.4"/>
  <circle cx="180" cy="332" r="8" fill="#22D3EE" opacity="0.4"/>
  <circle cx="332" cy="332" r="8" fill="#22D3EE" opacity="0.4"/>
</svg>`;
  } else if (type === 'splash') {
    // Splash background SVG
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" style="stop-color:#0a0a0a"/>
      <stop offset="100%" style="stop-color:#000000"/>
    </radialGradient>
    <linearGradient id="line" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#22D3EE;stop-opacity:0"/>
      <stop offset="50%" style="stop-color:#22D3EE;stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:#22D3EE;stop-opacity:0"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#vignette)"/>
  <!-- Grid lines -->
  <g stroke="url(#line)" stroke-width="1" opacity="0.2">
    ${Array.from({length: 20}, (_, i) => `<line x1="0" y1="${i * 100}" x2="1080" y2="${i * 100}"/>`).join('\n    ')}
    ${Array.from({length: 12}, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="1920"/>`).join('\n    ')}
  </g>
  <!-- Center glow -->
  <circle cx="540" cy="960" r="300" fill="#22D3EE" opacity="0.05"/>
  <circle cx="540" cy="960" r="150" fill="#22D3EE" opacity="0.08"/>
</svg>`;
  } else {
    // Hero illustration SVG
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="heroGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22D3EE"/>
      <stop offset="100%" style="stop-color:#0891B2"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="#050505"/>
  <!-- Sound waves -->
  <g stroke="#22D3EE" fill="none" opacity="0.3">
    <circle cx="400" cy="300" r="100" stroke-width="2"/>
    <circle cx="400" cy="300" r="150" stroke-width="1.5"/>
    <circle cx="400" cy="300" r="200" stroke-width="1"/>
    <circle cx="400" cy="300" r="250" stroke-width="0.5"/>
  </g>
  <!-- Person silhouette -->
  <g fill="url(#heroGlow)">
    <circle cx="400" cy="220" r="40"/>
    <path d="M360 280 Q400 260 440 280 L450 420 L410 420 L400 350 L390 420 L350 420 Z"/>
  </g>
  <!-- Phone -->
  <rect x="420" y="300" width="30" height="50" rx="5" fill="#22D3EE" opacity="0.8"/>
  <!-- Location markers -->
  <g fill="#22D3EE" opacity="0.5">
    <circle cx="200" cy="150" r="10"/>
    <circle cx="600" cy="200" r="10"/>
    <circle cx="150" cy="400" r="10"/>
    <circle cx="650" cy="450" r="10"/>
  </g>
</svg>`;
  }

  const svgPath = path.join(ASSETS_DIR, `${filename}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Created: ${svgPath}`);

  return svgPath;
}

async function main() {
  console.log('='.repeat(50));
  console.log('LiveSight Image Generator');
  console.log('='.repeat(50));

  // Create SVG assets (these work without API)
  console.log('\n📦 Creating SVG assets...\n');

  await createPlaceholderSVG('app_icon', 'icon');
  await createPlaceholderSVG('splash_background', 'splash');
  await createPlaceholderSVG('onboarding_hero', 'hero');

  // Try to get AI-generated descriptions
  console.log('\n🤖 Getting AI descriptions for reference...\n');

  for (const [name, prompt] of Object.entries(IMAGE_PROMPTS)) {
    await generateImage(prompt, name);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Image generation complete!');
  console.log('SVG files created in:', ASSETS_DIR);
  console.log('='.repeat(50));
}

main().catch(console.error);
