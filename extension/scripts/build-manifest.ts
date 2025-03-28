import * as fs from 'fs';
import * as path from 'path';
import manifest from '../src/manifest';

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the manifest.json file
fs.writeFileSync(
  path.join(distDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('✅ manifest.json generated successfully!');

// Copy icons to dist folder
const iconsSrcDir = path.join(__dirname, '../public/icons');
const iconsDestDir = path.join(distDir, 'icons');

if (!fs.existsSync(iconsDestDir)) {
  fs.mkdirSync(iconsDestDir, { recursive: true });
}

// Copy all icons from public/icons to dist/icons
const iconFiles = fs.readdirSync(iconsSrcDir);
for (const file of iconFiles) {
  const srcPath = path.join(iconsSrcDir, file);
  const destPath = path.join(iconsDestDir, file);
  fs.copyFileSync(srcPath, destPath);
}

console.log('✅ Icons copied to dist folder successfully!');