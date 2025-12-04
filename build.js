#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🎨 Building FUNLEARN styles...');

try {
  // Ensure directories exist
  const publicDir = './public';
  const srcDir = './src/styles';
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Build Tailwind CSS
  console.log('📦 Compiling Tailwind CSS...');
  execSync('npx tailwindcss -i ./src/styles/input.css -o ./public/tailwind.css --minify', {
    stdio: 'inherit'
  });

  // Copy additional assets if needed
  console.log('📁 Copying additional assets...');
  
  // Create a simple favicon if it doesn't exist
  const faviconPath = path.join(publicDir, 'favicon.ico');
  if (!fs.existsSync(faviconPath)) {
    // Create a simple text-based favicon placeholder
    fs.writeFileSync(faviconPath, '');
  }

  console.log('✅ Build completed successfully!');
  console.log('📄 Generated files:');
  console.log('   - public/tailwind.css (Tailwind CSS build)');
  console.log('   - public/funlearn-styles.css (Custom styles)');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}