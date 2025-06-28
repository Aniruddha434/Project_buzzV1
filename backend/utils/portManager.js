import net from 'net';
import { promisify } from 'util';

/**
 * Check if a port is available
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} - True if port is available
 */
export const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
};

/**
 * Find an available port starting from a given port
 * @param {number} startPort - Starting port to check
 * @param {number} endPort - Maximum port to check
 * @returns {Promise<number|null>} - Available port or null if none found
 */
export const findAvailablePort = async (startPort = 5000, endPort = 5010) => {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
};

/**
 * Get the optimal port for the server
 * @returns {Promise<number>} - Port to use
 */
export const getOptimalPort = async () => {
  const preferredPort = parseInt(process.env.PORT) || 5000;
  const fallbackStart = parseInt(process.env.PORT_FALLBACK_START) || 5001;
  const fallbackEnd = parseInt(process.env.PORT_FALLBACK_END) || 5010;
  
  // First try the preferred port
  if (await isPortAvailable(preferredPort)) {
    return preferredPort;
  }
  
  console.warn(`⚠️  Port ${preferredPort} is busy, searching for alternative...`);
  
  // Try fallback ports
  const availablePort = await findAvailablePort(fallbackStart, fallbackEnd);
  
  if (availablePort) {
    console.log(`✅ Found available port: ${availablePort}`);
    return availablePort;
  }
  
  // If no port found, throw error
  throw new Error(`❌ No available ports found between ${fallbackStart}-${fallbackEnd}`);
};

/**
 * Kill process using a specific port (Windows/Unix compatible)
 * @param {number} port - Port to free up
 * @returns {Promise<boolean>} - True if successful
 */
export const killPortProcess = async (port) => {
  try {
    const { exec } = await import('child_process');
    const execAsync = promisify(exec);
    
    if (process.platform === 'win32') {
      // Windows
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          await execAsync(`taskkill /f /pid ${pid}`);
          console.log(`✅ Killed process ${pid} using port ${port}`);
        }
      }
    } else {
      // Unix/Linux/macOS
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pids = stdout.trim().split('\n').filter(pid => pid);
      
      for (const pid of pids) {
        await execAsync(`kill -9 ${pid}`);
        console.log(`✅ Killed process ${pid} using port ${port}`);
      }
    }
    
    return true;
  } catch (error) {
    console.warn(`⚠️  Could not kill process on port ${port}:`, error.message);
    return false;
  }
};

/**
 * Smart port manager that handles conflicts automatically
 */
export class PortManager {
  constructor(preferredPort = 5000) {
    this.preferredPort = preferredPort;
    this.currentPort = null;
    this.fallbackRange = [5001, 5010];
  }
  
  async getPort(options = {}) {
    const { 
      autoKill = false, 
      fallbackStart = 5001, 
      fallbackEnd = 5010 
    } = options;
    
    this.fallbackRange = [fallbackStart, fallbackEnd];
    
    // Try preferred port first
    if (await isPortAvailable(this.preferredPort)) {
      this.currentPort = this.preferredPort;
      return this.preferredPort;
    }
    
    // If autoKill is enabled, try to free the preferred port
    if (autoKill) {
      console.log(`🔄 Attempting to free port ${this.preferredPort}...`);
      const killed = await killPortProcess(this.preferredPort);
      
      if (killed) {
        // Wait a bit for the port to be freed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (await isPortAvailable(this.preferredPort)) {
          this.currentPort = this.preferredPort;
          return this.preferredPort;
        }
      }
    }
    
    // Find alternative port
    const alternativePort = await findAvailablePort(fallbackStart, fallbackEnd);
    
    if (alternativePort) {
      this.currentPort = alternativePort;
      console.log(`📍 Using alternative port: ${alternativePort}`);
      return alternativePort;
    }
    
    throw new Error(`❌ No available ports found in range ${fallbackStart}-${fallbackEnd}`);
  }
  
  getCurrentPort() {
    return this.currentPort;
  }
  
  getApiUrl() {
    return `http://localhost:${this.currentPort}`;
  }
}

export default PortManager;
