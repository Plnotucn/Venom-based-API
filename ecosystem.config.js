module.exports = {
  apps: [{
    name: "whatsapp-api",
    script: "./src/index.js",
    instances: 1,
    exec_mode: "fork",
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      LOG_LEVEL: "info"
    },
    error_file: "./logs/pm2/error.log",
    out_file: "./logs/pm2/output.log",
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    autorestart: true,
    max_restarts: 10,
    min_uptime: "10s",
    restart_delay: 5000
  }]
};