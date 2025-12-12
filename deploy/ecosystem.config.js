module.exports = {
  apps: [
    {
      name: 'js-editor-backend',
      script: './backend/index.js',
      cwd: 'C:\\inetpub\\js-editor-system',
      instances: 1,
      exec_mode: 'fork',
      
      // 环境变量
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 性能配置
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // 监控配置
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // 集群配置 (可选)
      // instances: 'max',
      // exec_mode: 'cluster',
      
      // 自动重启配置
      autorestart: true,
      cron_restart: '0 2 * * *', // 每天凌晨2点重启
      
      // 环境特定配置
      node_args: '--max-old-space-size=2048'
    }
  ],
  
  // 部署配置
  deploy: {
    production: {
      user: 'administrator',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/js-editor-system.git',
      path: 'C:\\inetpub\\js-editor-system',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production'
    }
  }
};