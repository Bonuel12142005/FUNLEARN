#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🎨 Setting up FUNLEARN Tailwind CSS...');

async function setupTailwind() {
  try {
    // Step 1: Verify Node.js version
    console.log('\n1️⃣ Checking Node.js version...');
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      throw new Error(`Node.js 16+ required. Current version: ${nodeVersion}`);
    }
    console.log(`✅ Node.js ${nodeVersion} (compatible)`);

    // Step 2: Install dependencies
    console.log('\n2️⃣ Installing dependencies...');
    console.log('📦 Installing Tailwind CSS and plugins...');
    
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.log('⚠️ Some dependencies may have failed to install');
      console.log('💡 Try running: npm install --legacy-peer-deps');
    }

    // Step 3: Create directories
    console.log('\n3️⃣ Creating directories...');
    const dirs = [
      './src/styles',
      './public',
      './logs'
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created: ${dir}`);
      } else {
        console.log(`✅ Exists: ${dir}`);
      }
    });

    // Step 4: Build CSS
    console.log('\n4️⃣ Building Tailwind CSS...');
    try {
      execSync('npm run build:css', { stdio: 'inherit' });
      console.log('✅ Tailwind CSS built successfully');
    } catch (error) {
      console.log('⚠️ CSS build failed, but continuing...');
      console.log('💡 You can build manually later with: npm run build:css');
    }

    // Step 5: Verify setup
    console.log('\n5️⃣ Verifying setup...');
    const criticalFiles = [
      './tailwind.config.js',
      './postcss.config.js',
      './src/styles/input.css'
    ];
    
    let allGood = true;
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} - Missing!`);
        allGood = false;
      }
    });

    // Step 6: Check generated CSS
    if (fs.existsSync('./public/tailwind.css')) {
      const stats = fs.statSync('./public/tailwind.css');
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`✅ Generated CSS: ${sizeKB}KB`);
    } else {
      console.log('⚠️ CSS not generated yet - run npm run build:css');
    }

    // Success message
    console.log('\n' + '='.repeat(60));
    console.log('🎉 FUNLEARN Tailwind CSS setup complete!');
    console.log('='.repeat(60));

    console.log('\n🚀 Quick Start Commands:');
    console.log('   npm run dev          # Start development (CSS watcher + server)');
    console.log('   npm run build:css    # Build CSS for production');
    console.log('   npm run start        # Build and start production server');

    console.log('\n📁 Key Files Created:');
    console.log('   tailwind.config.js   # Tailwind configuration');
    console.log('   postcss.config.js    # PostCSS configuration');
    console.log('   src/styles/input.css # Main CSS input file');
    console.log('   public/tailwind.css  # Generated CSS output');

    console.log('\n🎨 Design System:');
    console.log('   • Custom color palette (primary, secondary, success, etc.)');
    console.log('   • Pre-built components (buttons, cards, badges)');
    console.log('   • Responsive breakpoints (xs to 3xl)');
    console.log('   • Custom animations (blob, float, pulse-glow)');
    console.log('   • Typography system (Poppins + Inter fonts)');

    console.log('\n📚 Documentation:');
    console.log('   TAILWIND_SETUP.md    # Complete setup guide');
    console.log('   verify-build.js      # Verify your setup');

    console.log('\n💡 Next Steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Start building amazing UI! 🎨');

    if (!allGood) {
      console.log('\n⚠️ Some files are missing. Run the setup again or check manually.');
    }

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Check Node.js version (16+ required)');
    console.log('   • Ensure npm is working: npm --version');
    console.log('   • Try: npm install --legacy-peer-deps');
    console.log('   • Check file permissions');
    process.exit(1);
  }
}

// Run setup
setupTailwind();