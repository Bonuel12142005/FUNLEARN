#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';

console.log('🚀 Starting FUNLEARN development environment...');

// Ensure directories exist
const dirs = ['./public', './src/styles', './logs'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Start Tailwind CSS watcher
console.log('🎨 Starting Tailwind CSS watcher...');
const tailwindProcess = spawn('npx', [
  'tailwindcss',
  '-i', './src/styles/input.css',
  '-o', './public/tailwind.css',
  '--watch'
], {
  stdio: 'inherit',
  shell: true
});

// Start Node.js server with nodemon
console.log('🔥 Starting FUNLEARN server...');
const serverProcess = spawn('npx', ['nodemon', 'index.js'], {
  stdio: 'inherit',
  shell: true
});

// Handle process cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  tailwindProcess.kill();
  serverProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  tailwindProcess.kill();
  serverProcess.kill();
  process.exit(0);
});

console.log('✅ Development environment started!');
console.log('📝 Available at: http://localhost:3000');
console.log('🎨 Tailwind CSS: Watching for changes...');
console.log('🔥 Server: Auto-reloading on file changes...');
console.log('\nPress Ctrl+C to stop all processes.');