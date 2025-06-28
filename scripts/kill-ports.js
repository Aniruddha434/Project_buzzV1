#!/usr/bin/env node

/**
 * Port Cleanup Utility
 * Safely kills processes using development ports
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise(resolve => rl.question(query, resolve));
};

// Get processes using specific ports
const getPortProcesses = async (ports) => {
  const processes = [];
  
  for (const port of ports) {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
        
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          
          if (pid && !isNaN(pid)) {
            try {
              const { stdout: processInfo } = await execAsync(`tasklist /fi "pid eq ${pid}" /fo csv`);
              const processLines = processInfo.split('\n');
              if (processLines.length > 1) {
                const processName = processLines[1].split(',')[0].replace(/"/g, '');
                processes.push({ port, pid, name: processName });
              }
            } catch (error) {
              processes.push({ port, pid, name: 'Unknown' });
            }
          }
        }
      } else {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        const pids = stdout.trim().split('\n').filter(pid => pid);
        
        for (const pid of pids) {
          try {
            const { stdout: processInfo } = await execAsync(`ps -p ${pid} -o comm=`);
            processes.push({ port, pid, name: processInfo.trim() });
          } catch (error) {
            processes.push({ port, pid, name: 'Unknown' });
          }
        }
      }
    } catch (error) {
      // Port not in use
    }
  }
  
  return processes;
};

// Kill a process by PID
const killProcess = async (pid) => {
  try {
    if (process.platform === 'win32') {
      await execAsync(`taskkill /f /pid ${pid}`);
    } else {
      await execAsync(`kill -9 ${pid}`);
    }
    return true;
  } catch (error) {
    return false;
  }
};

// Main function
const main = async () => {
  try {
    log('🛑 ProjectBuzz Port Cleanup Utility', 'cyan');
    log('====================================', 'cyan');
    log('');
    
    const developmentPorts = [5000, 5001, 5002, 5173, 5174, 3000];
    
    log('🔍 Scanning for processes using development ports...', 'yellow');
    const processes = await getPortProcesses(developmentPorts);
    
    if (processes.length === 0) {
      log('✅ No processes found using development ports.', 'green');
      rl.close();
      return;
    }
    
    log('');
    log('Found processes:', 'red');
    log('----------------', 'red');
    
    processes.forEach((proc, index) => {
      log(`${index + 1}. Port ${proc.port}: ${proc.name} (PID: ${proc.pid})`, 'yellow');
    });
    
    log('');
    log('⚠️  WARNING: This will forcefully terminate the selected processes!', 'red');
    log('');
    
    const options = [
      'Kill all development port processes',
      'Kill specific processes (interactive)',
      'Kill only Node.js processes',
      'Cancel'
    ];
    
    log('Choose an option:', 'cyan');
    options.forEach((option, index) => {
      log(`${index + 1}. ${option}`, 'blue');
    });
    
    const choice = await question('\nEnter your choice (1-4): ');
    
    switch (choice.trim()) {
      case '1':
        log('\n🛑 Killing all development port processes...', 'yellow');
        let killed = 0;
        for (const proc of processes) {
          const success = await killProcess(proc.pid);
          if (success) {
            log(`✅ Killed ${proc.name} (PID: ${proc.pid}) on port ${proc.port}`, 'green');
            killed++;
          } else {
            log(`❌ Failed to kill ${proc.name} (PID: ${proc.pid}) on port ${proc.port}`, 'red');
          }
        }
        log(`\n🎉 Killed ${killed}/${processes.length} processes.`, 'green');
        break;
        
      case '2':
        log('\n📋 Interactive process selection:', 'cyan');
        for (const proc of processes) {
          const kill = await question(`Kill ${proc.name} (PID: ${proc.pid}) on port ${proc.port}? (y/N): `);
          if (kill.toLowerCase() === 'y' || kill.toLowerCase() === 'yes') {
            const success = await killProcess(proc.pid);
            if (success) {
              log(`✅ Killed ${proc.name} (PID: ${proc.pid})`, 'green');
            } else {
              log(`❌ Failed to kill ${proc.name} (PID: ${proc.pid})`, 'red');
            }
          }
        }
        break;
        
      case '3':
        log('\n🛑 Killing Node.js processes only...', 'yellow');
        const nodeProcesses = processes.filter(proc => 
          proc.name.toLowerCase().includes('node') || 
          proc.name.toLowerCase().includes('npm') ||
          proc.name.toLowerCase().includes('nodemon')
        );
        
        if (nodeProcesses.length === 0) {
          log('No Node.js processes found.', 'yellow');
        } else {
          for (const proc of nodeProcesses) {
            const success = await killProcess(proc.pid);
            if (success) {
              log(`✅ Killed ${proc.name} (PID: ${proc.pid}) on port ${proc.port}`, 'green');
            } else {
              log(`❌ Failed to kill ${proc.name} (PID: ${proc.pid}) on port ${proc.port}`, 'red');
            }
          }
        }
        break;
        
      case '4':
        log('Operation cancelled.', 'yellow');
        break;
        
      default:
        log('Invalid choice. Operation cancelled.', 'red');
        break;
    }
    
    log('');
    log('To check port status again, run: npm run check-ports', 'cyan');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
};

main();
