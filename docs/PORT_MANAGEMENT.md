# Port Management Guide

## Overview

ProjectBuzz uses an intelligent port management system to prevent conflicts and ensure smooth development experience. This system automatically detects available ports and configures the application accordingly.

## 🎯 **Problem Solved**

- **Port Conflicts**: Automatic detection and resolution of port conflicts
- **Manual Configuration**: No more manual port updates across multiple files
- **Development Friction**: Seamless startup without port-related errors
- **Consistency**: Synchronized configuration between frontend and backend

## 🛠️ **Components**

### 1. **Smart Port Detection** (`backend/utils/portManager.js`)
- Automatically finds available ports
- Handles fallback port ranges
- Cross-platform port conflict resolution
- Process management utilities

### 2. **Dynamic API Configuration** (`frontend/src/config/api.config.js`)
- Auto-detects backend URL
- Environment-based configuration
- Connection testing and validation
- Caching for performance

### 3. **Development Scripts** (`scripts/`)
- `dev-start.js`: Smart development environment startup
- `check-ports.js`: Port availability checker
- `kill-ports.js`: Port cleanup utility
- `setup-env.js`: Environment configuration wizard

## 🚀 **Usage**

### Quick Start
```bash
# Setup environment (first time only)
npm run setup

# Start development environment
npm run dev
```

### Port Management Commands
```bash
# Check port availability
npm run check-ports

# Clean up busy ports
npm run kill-ports

# Manual backend start
npm run dev:backend

# Manual frontend start
npm run dev:frontend
```

## ⚙️ **Configuration**

### Environment Variables

#### Backend (`.env`)
```env
# Primary port
PORT=5000

# Fallback port range
PORT_FALLBACK_START=5001
PORT_FALLBACK_END=5010

# Frontend URL (auto-updated)
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`.env`)
```env
# API configuration (auto-updated)
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000

# Development configuration
VITE_DEV_PORT=5173
VITE_DEV_HOST=localhost
```

## 🔧 **How It Works**

### 1. **Startup Process**
1. Check preferred ports (5000 for backend, 5173 for frontend)
2. If busy, scan fallback ranges
3. Update environment files automatically
4. Start services with available ports
5. Configure API client dynamically

### 2. **Port Detection Algorithm**
```javascript
// 1. Try preferred port
if (await isPortAvailable(preferredPort)) {
  return preferredPort;
}

// 2. Try fallback range
for (let port = fallbackStart; port <= fallbackEnd; port++) {
  if (await isPortAvailable(port)) {
    return port;
  }
}

// 3. Throw error if no ports available
throw new Error('No available ports found');
```

### 3. **Dynamic API Configuration**
```javascript
// Auto-detect backend URL
const urlsToTry = [
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:5002',
  // ... more fallbacks
];

for (const url of urlsToTry) {
  if (await testConnection(url)) {
    return url; // Use this URL
  }
}
```

## 🔍 **Troubleshooting**

### Common Issues

#### 1. **Port Still Busy After Cleanup**
```bash
# Check what's using the port
npm run check-ports

# Force kill processes
npm run kill-ports
```

#### 2. **Frontend Can't Connect to Backend**
```bash
# Check backend status
curl http://localhost:5000/api

# Restart with port detection
npm run dev
```

#### 3. **Environment Files Out of Sync**
```bash
# Reconfigure environment
npm run setup

# Or manually update .env files
```

### Debug Mode
Set `VITE_ENABLE_DEBUG=true` in frontend `.env` to see detailed connection logs.

## 🏗️ **Architecture**

### Port Manager Class
```javascript
class PortManager {
  async getPort(options = {}) {
    // Smart port detection logic
  }
  
  getCurrentPort() {
    // Get currently used port
  }
  
  getApiUrl() {
    // Get full API URL
  }
}
```

### API Configuration
```javascript
export const getApiConfig = async () => {
  // Dynamic configuration based on environment
  // Auto-detection in development
  // Static configuration in production
};
```

## 📋 **Best Practices**

### 1. **Development Workflow**
```bash
# Always start with the smart script
npm run dev

# Check ports before manual starts
npm run check-ports

# Clean up after development
npm run kill-ports
```

### 2. **Environment Management**
- Use `npm run setup` for initial configuration
- Don't manually edit port numbers in multiple files
- Let the system handle port conflicts automatically

### 3. **Production Deployment**
- Set fixed ports in production environment
- Use environment variables for configuration
- Disable auto-detection in production

## 🔄 **Migration Guide**

### From Manual Port Management
1. Remove hardcoded ports from code
2. Run `npm run setup` to configure environment
3. Use `npm run dev` instead of manual starts
4. Update any custom scripts to use environment variables

### Updating Existing Projects
1. Copy port management utilities
2. Update package.json scripts
3. Configure environment files
4. Test with `npm run check-ports`

## 🚨 **Emergency Procedures**

### Complete Port Reset
```bash
# Kill all development processes
npm run kill-ports

# Reset environment
npm run setup

# Clean restart
npm run dev
```

### Manual Port Override
```bash
# Backend on specific port
cd backend && PORT=5002 npm run dev

# Frontend on specific port
cd frontend && npm run dev -- --port 5175
```

## 📊 **Monitoring**

### Port Usage Dashboard
The `check-ports` script provides a comprehensive overview:
- Available ports
- Busy ports with process information
- Recommendations for optimal configuration
- Quick commands for resolution

### Logs and Debugging
- Backend startup logs show selected port
- Frontend shows API connection status
- Debug mode provides detailed connection attempts

## 🔮 **Future Enhancements**

- [ ] Docker integration with automatic port mapping
- [ ] Load balancer support for multiple backend instances
- [ ] Health check endpoints for monitoring
- [ ] Automatic SSL certificate generation for HTTPS
- [ ] Integration with process managers (PM2, Forever)

---

This port management system ensures that your development environment starts reliably every time, without manual intervention or port conflicts. The system is designed to be robust, user-friendly, and maintainable.
