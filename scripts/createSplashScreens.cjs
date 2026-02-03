/**
 * Create Splash Screens for Android
 * Generates all required splash screen sizes with LiveSight branding
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ANDROID_RES = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const ICON_SVG = path.join(__dirname, '..', 'src', 'assets', 'images', 'app_icon.svg');

// Splash screen sizes (portrait and landscape)
const SPLASH_SIZES = {
  'drawable': { width: 480, height: 800 },
  'drawable-port-mdpi': { width: 320, height: 480 },
  'drawable-port-hdpi': { width: 480, height: 800 },
  'drawable-port-xhdpi': { width: 720, height: 1280 },
  'drawable-port-xxhdpi': { width: 960, height: 1600 },
  'drawable-port-xxxhdpi': { width: 1280, height: 1920 },
  'drawable-land-mdpi': { width: 480, height: 320 },
  'drawable-land-hdpi': { width: 800, height: 480 },
  'drawable-land-xhdpi': { width: 1280, height: 720 },
  'drawable-land-xxhdpi': { width: 1600, height: 960 },
  'drawable-land-xxxhdpi': { width: 1920, height: 1280 },
};

async function createSplashScreen(folder, dimensions) {
  const { width, height } = dimensions;
  const isPortrait = height > width;
  const iconSize = Math.min(width, height) * 0.3;

  // Read icon SVG
  const iconBuffer = fs.readFileSync(ICON_SVG);

  // Resize icon
  const resizedIcon = await sharp(iconBuffer)
    .resize(Math.floor(iconSize), Math.floor(iconSize))
    .png()
    .toBuffer();

  // Create dark background with subtle grid pattern
  // Using a gradient-like effect with compositing
  const bgColor = { r: 5, g: 5, b: 5, alpha: 1 };

  // Create the splash image
  const outputPath = path.join(ANDROID_RES, folder, 'splash.png');

  // Create the base image with centered icon
  await sharp({
    create: {
      width: width,
      height: height,
      channels: 4,
      background: bgColor
    }
  })
    .composite([
      {
        input: resizedIcon,
        top: Math.floor((height - iconSize) / 2),
        left: Math.floor((width - iconSize) / 2),
      }
    ])
    .png()
    .toFile(outputPath);

  console.log(`  ✓ Created: ${folder}/splash.png (${width}x${height})`);
}

async function main() {
  console.log('='.repeat(50));
  console.log('Splash Screen Generator');
  console.log('='.repeat(50));

  // Check if icon exists
  if (!fs.existsSync(ICON_SVG)) {
    console.error('Icon SVG not found:', ICON_SVG);
    console.log('Please run generateImages.cjs first.');
    process.exit(1);
  }

  console.log('\n📱 Generating splash screens...\n');

  for (const [folder, dimensions] of Object.entries(SPLASH_SIZES)) {
    const folderPath = path.join(ANDROID_RES, folder);

    // Ensure folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    await createSplashScreen(folder, dimensions);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Splash screens generated successfully!');
  console.log('='.repeat(50));
}

main().catch(console.error);
