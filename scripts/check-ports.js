#!/usr/bin/env node

/**
 * Port Checker Utility
 * Checks which ports are in use and provides recommendations
 */

import net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

// Get process using a port (cross-platform)
const getPortProcess = async (port) => {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
      if (lines.length > 0) {
        const parts = lines[0].trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        
        try {
          const { stdout: processInfo } = await execAsync(`tasklist /fi "pid eq ${pid}" /fo csv`);
          const processLines = processInfo.split('\n');
          if (processLines.length > 1) {
            const processName = processLines[1].split(',')[0].replace(/"/g, '');
            return { pid, name: processName };
          }
        } catch (error) {
          return { pid, name: 'Unknown' };
        }
      }
    } else {
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pid = stdout.trim();
      if (pid) {
        try {
          const { stdout: processInfo } = await execAsync(`ps -p ${pid} -o comm=`);
          return { pid, name: processInfo.trim() };
        } catch (error) {
          return { pid, name: 'Unknown' };
        }
      }
    }
  } catch (error) {
    // Port not in use or error getting process info
  }
  return null;
};

// Main function
const main = async () => {
  log('🔍 ProjectBuzz Port Checker', 'cyan');
  log('============================', 'cyan');
  log('');
  
  const portsToCheck = [
    { port: 5000, service: 'Backend (Primary)' },
    { port: 5001, service: 'Backend (Fallback 1)' },
    { port: 5002, service: 'Backend (Fallback 2)' },
    { port: 5173, service: 'Frontend (Vite Default)' },
    { port: 5174, service: 'Frontend (Fallback)' },
    { port: 3000, service: 'Frontend (Alternative)' },
    { port: 27017, service: 'MongoDB' },
    { port: 6379, service: 'Redis (Optional)' }
  ];
  
  log('Port Status:', 'yellow');
  log('-------------', 'yellow');
  
  const availablePorts = [];
  const busyPorts = [];
  
  for (const { port, service } of portsToCheck) {
    const available = await isPortAvailable(port);
    
    if (available) {
      log(`✅ Port ${port} (${service}): Available`, 'green');
      availablePorts.push({ port, service });
    } else {
      const process = await getPortProcess(port);
      const processInfo = process ? ` - Used by: ${process.name} (PID: ${process.pid})` : '';
      log(`❌ Port ${port} (${service}): Busy${processInfo}`, 'red');
      busyPorts.push({ port, service, process });
    }
  }
  
  log('');
  log('Summary:', 'cyan');
  log('--------', 'cyan');
  log(`Available ports: ${availablePorts.length}`, 'green');
  log(`Busy ports: ${busyPorts.length}`, 'red');
  
  if (busyPorts.length > 0) {
    log('');
    log('Recommendations:', 'yellow');
    log('----------------', 'yellow');
    
    const backendBusy = busyPorts.some(p => [5000, 5001, 5002].includes(p.port));
    const frontendBusy = busyPorts.some(p => [5173, 5174, 3000].includes(p.port));
    
    if (backendBusy) {
      const availableBackend = availablePorts.find(p => [5000, 5001, 5002].includes(p.port));
      if (availableBackend) {
        log(`💡 Use port ${availableBackend.port} for backend`, 'blue');
      } else {
        log('⚠️  All preferred backend ports are busy. Consider killing processes or using different ports.', 'yellow');
      }
    }
    
    if (frontendBusy) {
      const availableFrontend = availablePorts.find(p => [5173, 5174, 3000].includes(p.port));
      if (availableFrontend) {
        log(`💡 Use port ${availableFrontend.port} for frontend`, 'blue');
      } else {
        log('⚠️  All preferred frontend ports are busy. Consider killing processes or using different ports.', 'yellow');
      }
    }
    
    log('');
    log('To kill processes using specific ports, run:', 'cyan');
    log('npm run kill-ports', 'cyan');
  } else {
    log('🎉 All ports are available! You can start the development environment.', 'green');
  }
  
  log('');
  log('To start the development environment with automatic port management:', 'cyan');
  log('npm run dev', 'cyan');
};

main().catch(error => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
