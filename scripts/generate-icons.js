/**
 * Script to generate PWA icons from a source image
 * 
 * This script generates all the required icon sizes for the PWA manifest
 * Place your source logo as 'public/icons/source-logo.png' or update the SOURCE_LOGO_PATH
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_LOGO_PATH = '../public/icons/app-logo.svg';
const OUTPUT_DIR = '../public/icons';
const ICON_SIZES = [
  72, 96, 128, 144, 152, 192, 384, 512
];

// Create output directory if it doesn't exist
const outputDir = path.resolve(__dirname, OUTPUT_DIR);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('PWA Icon Generator');
console.log('==================');
console.log(`Source: ${SOURCE_LOGO_PATH}`);
console.log(`Output: ${OUTPUT_DIR}`);
console.log(`Sizes: ${ICON_SIZES.join(', ')}`);
console.log('');

// Check if source logo exists
const sourceLogoPath = path.resolve(__dirname, SOURCE_LOGO_PATH);
if (!fs.existsSync(sourceLogoPath)) {
  console.log('⚠️  Source logo not found!');
  console.log(`Please place your logo at: ${sourceLogoPath}`);
  console.log('');
  console.log('For best results, use:');
  console.log('- A square image (1:1 aspect ratio)');
  console.log('- At least 512x512 pixels');
  console.log('- In PNG or SVG format');
  console.log('');
  console.log('After placing your logo, run this script again.');
  process.exit(1);
}

console.log('✅ Source logo found');
console.log('ℹ️  Note: This script only generates placeholder files.');
console.log('ℹ️  For actual image conversion, you would need image processing libraries');
console.log('ℹ️  like Sharp or ImageMagick, or use online tools.');

// Generate placeholder files for each size
ICON_SIZES.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(outputDir, filename);
  
  // Create a simple placeholder file (in a real implementation, you would convert the actual image)
  const placeholderContent = `Placeholder for ${size}x${size} icon - Replace with actual image`;
  
  try {
    fs.writeFileSync(filepath, placeholderContent);
    console.log(`✅ Generated: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to generate: ${filename}`, error.message);
  }
});

console.log('');
console.log('✅ Icon generation complete!');
console.log('');
console.log('Next steps:');
console.log('1. Replace the placeholder files with actual resized versions of your logo');
console.log('2. Ensure your manifest.json references the correct icon paths');
console.log('3. Test the PWA installation on various devices');