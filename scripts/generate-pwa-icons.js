/**
 * PWA Icon Generator Script
 * Generates placeholder icons for the PWA manifest
 *
 * Usage: node scripts/generate-pwa-icons.js
 *
 * For production, replace these with proper designed icons
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icon with gradient background and "ADS" text
function generateIcon(size) {
  const fontSize = Math.round(size * 0.35);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#db2777;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#grad)"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="white">ADS</text>
</svg>`;
  return svg;
}

// Generate shortcut icons
function generateShortcutIcon(size, emoji) {
  const emojiSize = Math.round(size * 0.5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#db2777;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="url(#grad)"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-size="${emojiSize}">${emoji}</text>
</svg>`;
  return svg;
}

// Generate main icons
console.log('Generating PWA icons...');
sizes.forEach(size => {
  const svg = generateIcon(size);
  const filename = `icon-${size}x${size}.png`;

  // For now, save as SVG (in production, convert to PNG)
  const svgFilename = filename.replace('.png', '.svg');
  fs.writeFileSync(path.join(iconsDir, svgFilename), svg);

  // Also create a symlink-style reference (the browser will use the SVG)
  // For production, use a proper image conversion library
  console.log(`  Created ${svgFilename}`);
});

// Generate shortcut icons
const shortcuts = [
  { name: 'shortcut-clock', emoji: '⏰' },
  { name: 'shortcut-calendar', emoji: '📅' },
  { name: 'shortcut-health', emoji: '🏥' },
];

shortcuts.forEach(({ name, emoji }) => {
  const svg = generateShortcutIcon(96, emoji);
  const filename = `${name}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`  Created ${filename}`);
});

console.log('\\nDone! Icons created in public/icons/');
console.log('\\nNote: For production, convert SVGs to PNGs using a tool like sharp or imagemagick.');
console.log('Example: npx sharp-cli -i public/icons/*.svg -o public/icons/ -f png');
