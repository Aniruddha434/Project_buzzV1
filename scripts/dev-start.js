#!/usr/bin/env node

/**
 * Smart Development Startup Script
 * Automatically manages ports and starts both frontend and backend
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Check if a port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });

    server.on('error', () => resolve(false));
  });
};

// Find available ports
const findAvailablePorts = async () => {
  const backendPort = await isPortAvailable(5000) ? 5000 :
                     await isPortAvailable(5001) ? 5001 :
                     await isPortAvailable(5002) ? 5002 : null;

  const frontendPort = await isPortAvailable(5173) ? 5173 :
                      await isPortAvailable(5174) ? 5174 :
                      await isPortAvailable(3000) ? 3000 : null;

  return { backendPort, frontendPort };
};

// Update environment files
const updateEnvFiles = (backendPort, frontendPort) => {
  // Update backend .env
  const backendEnvPath = join(projectRoot, 'backend', '.env');
  let backendEnv = '';

  if (fs.existsSync(backendEnvPath)) {
    backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  }

  // Update or add PORT
  if (backendEnv.includes('PORT=')) {
    backendEnv = backendEnv.replace(/PORT=\d+/, `PORT=${backendPort}`);
  } else {
    backendEnv += `\nPORT=${backendPort}`;
  }

  // Update FRONTEND_URL
  if (backendEnv.includes('FRONTEND_URL=')) {
    backendEnv = backendEnv.replace(/FRONTEND_URL=.*/, `FRONTEND_URL=http://localhost:${frontendPort}`);
  } else {
    backendEnv += `\nFRONTEND_URL=http://localhost:${frontendPort}`;
  }

  fs.writeFileSync(backendEnvPath, backendEnv);

  // Update frontend .env
  const frontendEnvPath = join(projectRoot, 'frontend', '.env');
  let frontendEnv = '';

  if (fs.existsSync(frontendEnvPath)) {
    frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  }

  // Update API URL
  if (frontendEnv.includes('VITE_API_URL=')) {
    frontendEnv = frontendEnv.replace(/VITE_API_URL=.*/, `VITE_API_URL=http://localhost:${backendPort}/api`);
  } else {
    frontendEnv += `\nVITE_API_URL=http://localhost:${backendPort}/api`;
  }

  // Update backend URL
  if (frontendEnv.includes('VITE_BACKEND_URL=')) {
    frontendEnv = frontendEnv.replace(/VITE_BACKEND_URL=.*/, `VITE_BACKEND_URL=http://localhost:${backendPort}`);
  } else {
    frontendEnv += `\nVITE_BACKEND_URL=http://localhost:${backendPort}`;
  }

  fs.writeFileSync(frontendEnvPath, frontendEnv);
};

// Start a process
const startProcess = (command, args, cwd, name, color) => {
  return new Promise((resolve, reject) => {
    log(`🚀 Starting ${name}...`, color);

    const process = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true
    });

    process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        log(`[${name}] ${output}`, color);
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('Warning')) {
        log(`[${name}] ${output}`, 'red');
      }
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${name} exited with code ${code}`));
      }
    });

    // Resolve immediately for long-running processes
    setTimeout(() => resolve(process), 3000);
  });
};

// Main function
const main = async () => {
  try {
    log('🔍 ProjectBuzz Development Startup', 'cyan');
    log('=====================================', 'cyan');

    // Find available ports
    log('🔍 Checking available ports...', 'yellow');
    const { backendPort, frontendPort } = await findAvailablePorts();

    if (!backendPort || !frontendPort) {
      log('❌ Could not find available ports!', 'red');
      process.exit(1);
    }

    log(`✅ Backend will use port: ${backendPort}`, 'green');
    log(`✅ Frontend will use port: ${frontendPort}`, 'green');

    // Update environment files
    log('📝 Updating environment files...', 'yellow');
    updateEnvFiles(backendPort, frontendPort);

    // Start backend
    await startProcess(
      'npm',
      ['run', 'dev'],
      join(projectRoot, 'backend'),
      'Backend',
      'blue'
    );

    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start frontend
    await startProcess(
      'npm',
      ['run', 'dev', '--', '--port', frontendPort],
      join(projectRoot, 'frontend'),
      'Frontend',
      'magenta'
    );

    log('', 'reset');
    log('🎉 Development environment started successfully!', 'green');
    log('', 'reset');
    log('📋 URLs:', 'cyan');
    log(`   Frontend: http://localhost:${frontendPort}`, 'cyan');
    log(`   Backend:  http://localhost:${backendPort}`, 'cyan');
    log(`   API:      http://localhost:${backendPort}/api`, 'cyan');
    log('', 'reset');
    log('Press Ctrl+C to stop all services', 'yellow');

  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  log('\n🛑 Shutting down development environment...', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n🛑 Shutting down development environment...', 'yellow');
  process.exit(0);
});

main();
