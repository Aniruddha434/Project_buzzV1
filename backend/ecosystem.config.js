module.exports = {
  apps: [
    {
      name: 'projectbuzz-backend',
      script: 'server.js',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      
      // Environment configuration
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5000
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        // Load from .env.production file
        env_file: '.env.production'
      },
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      autorestart: true,
      watch: false, // Disable in production
      max_memory_restart: '1G',
      restart_delay: 4000,

      // Advanced settings
      node_args: '--max-old-space-size=1024',

      // Health monitoring
      min_uptime: '10s',
      max_restarts: 15,
      exp_backoff_restart_delay: 100,

      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Source map support
      source_map_support: true,
      
      // Instance variables
      instance_var: 'INSTANCE_ID',
      
      // Merge logs from all instances
      merge_logs: true,
      
      // Time zone
      time: true
    }
  ],
  
  deploy: {
    staging: {
      user: 'deploy',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/projectbuzz.git',
      path: '/var/www/projectbuzz-staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': 'apt update && apt install git -y'
    },

    production: {
      user: 'deploy',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/projectbuzz.git',
      path: '/var/www/projectbuzz',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git nodejs npm -y'
    }
  }
};
