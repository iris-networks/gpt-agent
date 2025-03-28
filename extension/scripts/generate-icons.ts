import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Basic SVG icon template
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#4285F4"/>
  <path d="M256 128L384 256L256 384L128 256L256 128Z" fill="white"/>
  <circle cx="256" cy="256" r="64" fill="#4285F4"/>
  <circle cx="256" cy="256" r="48" fill="white"/>
</svg>
`;

// Function to generate PNG icons from SVG
async function generateIcons() {
  // Save the SVG file first
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon);
  
  // Define icon sizes
  const sizes = [16, 32, 48, 128, 512];
  
  // Generate each size
  const promises = sizes.map(size => 
    sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon${size}.png`))
  );
  
  try {
    await Promise.all(promises);
    console.log('✅ Icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

// Run the icon generation
generateIcons();