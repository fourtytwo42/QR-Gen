module.exports = {
  apps: [
    {
      name: 'qr-gen-studio',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/home/hendo420/QR-Gen/web',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/home/hendo420/QR-Gen/web/logs/err.log',
      out_file: '/home/hendo420/QR-Gen/web/logs/out.log',
      log_file: '/home/hendo420/QR-Gen/web/logs/combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};

