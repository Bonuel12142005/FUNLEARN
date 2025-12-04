#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying FUNLEARN build...');

const checks = [
  {
    name: 'Tailwind Config',
    path: './tailwind.config.js',
    required: true
  },
  {
    name: 'PostCSS Config',
    path: './postcss.config.js',
    required: true
  },
  {
    name: 'Input CSS',
    path: './src/styles/input.css',
    required: true
  },
  {
    name: 'Output CSS',
    path: './public/tailwind.css',
    required: false,
    note: 'Will be generated on build'
  },
  {
    name: 'Custom Styles',
    path: './public/funlearn-styles.css',
    required: false
  },
  {
    name: 'Package.json',
    path: './package.json',
    required: true
  }
];

let allGood = true;

console.log('\n📋 File Check:');
checks.forEach(check => {
  const exists = fs.existsSync(check.path);
  const status = exists ? '✅' : (check.required ? '❌' : '⚠️');
  const note = check.note ? ` (${check.note})` : '';
  
  console.log(`${status} ${check.name}: ${check.path}${note}`);
  
  if (check.required && !exists) {
    allGood = false;
  }
});

// Check package.json for required dependencies
console.log('\n📦 Dependencies Check:');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const requiredDeps = [
    'tailwindcss',
    '@tailwindcss/forms',
    '@tailwindcss/typography',
    'autoprefixer',
    'postcss'
  ];
  
  const devDeps = packageJson.devDependencies || {};
  
  requiredDeps.forEach(dep => {
    const exists = devDeps[dep];
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${dep}: ${exists || 'Missing'}`);
    
    if (!exists) {
      allGood = false;
    }
  });
} catch (error) {
  console.log('❌ Could not read package.json');
  allGood = false;
}

// Check scripts
console.log('\n🔧 Scripts Check:');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const requiredScripts = [
    'build:css',
    'build:css:watch',
    'dev'
  ];
  
  const scripts = packageJson.scripts || {};
  
  requiredScripts.forEach(script => {
    const exists = scripts[script];
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${script}: ${exists || 'Missing'}`);
    
    if (!exists) {
      allGood = false;
    }
  });
} catch (error) {
  console.log('❌ Could not check scripts');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ All checks passed! FUNLEARN is ready to build.');
  console.log('\n🚀 Next steps:');
  console.log('   1. npm install (if not done already)');
  console.log('   2. npm run build:css (build CSS)');
  console.log('   3. npm run dev (start development)');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  console.log('\n🔧 Quick fixes:');
  console.log('   - Run: npm install');
  console.log('   - Check file paths');
  console.log('   - Verify package.json scripts');
  process.exit(1);
}

console.log('\n📚 Documentation:');
console.log('   - TAILWIND_SETUP.md - Complete setup guide');
console.log('   - tailwind.config.js - Configuration options');
console.log('   - src/styles/input.css - Custom styles');

export default allGood;