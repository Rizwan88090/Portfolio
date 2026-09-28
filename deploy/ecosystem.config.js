// PM2 process list: keeps the API and the website running and restarts them on crash or reboot.
// Usage (on the server, from the repo root): pm2 start deploy/ecosystem.config.js
const path = require('path');
const root = path.resolve(__dirname, '..');

module.exports = {
  apps: [
    {
      name: 'pentacore-api',
      cwd: path.join(root, 'backend'),
      script: 'dist/main.js',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '400M',
      time: true,
    },
    {
      name: 'pentacore-web',
      cwd: path.join(root, 'frontend'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3000',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '600M',
      time: true,
    },
  ],
};
