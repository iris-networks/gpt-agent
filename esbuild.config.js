import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure the dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Bundling configuration
build({
  entryPoints: ['pulsar/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18', // Target Node.js version
  outfile: 'dist/index.js',
  format: 'esm',
  sourcemap: false,
  minify: false,
  packages: 'external', // Keep all npm packages as external dependencies
  banner: {
    js: '#!/usr/bin/env node\n',
  },
  logLevel: 'info',
}).catch(() => process.exit(1));

// After bundling, copy public assets
const publicSrcDir = path.join(__dirname, 'pulsar/public');
const publicDestDir = path.join(__dirname, 'dist/public');

if (fs.existsSync(publicSrcDir)) {
  if (!fs.existsSync(publicDestDir)) {
    fs.mkdirSync(publicDestDir, { recursive: true });
  }
  
  const copyDir = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyDir(publicSrcDir, publicDestDir);
  console.log('Public assets copied to dist/public');
}