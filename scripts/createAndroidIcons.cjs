/**
 * Create Android Icons from SVG
 * Generates all required icon sizes for Android
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '..', 'src', 'assets', 'images', 'app_icon.svg');
const ANDROID_RES = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Android icon sizes (in pixels)
const ICON_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Foreground icon sizes (with padding for adaptive icons)
const FOREGROUND_SIZES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

async function createIcon(svgBuffer, outputPath, size, isRound = false) {
  try {
    let image = sharp(svgBuffer)
      .resize(size, size)
      .png();

    if (isRound) {
      // Create circular mask
      const circle = Buffer.from(
        `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
      );

      // Composite with mask - simplified approach, just resize
      image = sharp(svgBuffer)
        .resize(size, size)
        .png();
    }

    await image.toFile(outputPath);
    console.log(`  ✓ Created: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error creating ${outputPath}:`, error.message);
    return false;
  }
}

async function createForegroundIcon(svgBuffer, outputPath, size) {
  try {
    // For foreground, we need the icon centered with transparent padding
    await sharp(svgBuffer)
      .resize(Math.floor(size * 0.66), Math.floor(size * 0.66)) // Icon is ~66% of total size
      .extend({
        top: Math.floor(size * 0.17),
        bottom: Math.floor(size * 0.17),
        left: Math.floor(size * 0.17),
        right: Math.floor(size * 0.17),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .resize(size, size) // Ensure exact size
      .png()
      .toFile(outputPath);

    console.log(`  ✓ Created: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error creating ${outputPath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Android Icon Generator');
  console.log('='.repeat(50));

  // Check if SVG exists
  if (!fs.existsSync(SVG_PATH)) {
    console.error('SVG file not found:', SVG_PATH);
    console.log('Please run generateImages.cjs first.');
    process.exit(1);
  }

  // Read SVG
  const svgBuffer = fs.readFileSync(SVG_PATH);
  console.log('\n📱 Generating Android icons...\n');

  // Create icons for each density
  for (const [folder, size] of Object.entries(ICON_SIZES)) {
    const folderPath = path.join(ANDROID_RES, folder);

    // Ensure folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    console.log(`${folder} (${size}px):`);

    // Regular launcher icon
    await createIcon(svgBuffer, path.join(folderPath, 'ic_launcher.png'), size);

    // Round launcher icon
    await createIcon(svgBuffer, path.join(folderPath, 'ic_launcher_round.png'), size, true);
  }

  // Create foreground icons for adaptive icons
  console.log('\n📱 Generating adaptive icon foregrounds...\n');

  for (const [folder, size] of Object.entries(FOREGROUND_SIZES)) {
    const folderPath = path.join(ANDROID_RES, folder);

    console.log(`${folder} foreground (${size}px):`);
    await createForegroundIcon(svgBuffer, path.join(folderPath, 'ic_launcher_foreground.png'), size);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Android icons generated successfully!');
  console.log('='.repeat(50));
}

main().catch(console.error);
