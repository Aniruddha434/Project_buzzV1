// Simple script to start the backend with error handling
import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting backend server...');

const backendPath = path.join(process.cwd(), 'backend');
console.log('📁 Backend path:', backendPath);

const child = spawn('node', ['server.js'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
});

child.on('exit', (code, signal) => {
  console.log(`🔚 Backend process exited with code ${code} and signal ${signal}`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('🛑 Stopping backend...');
  child.kill();
  process.exit();
});
