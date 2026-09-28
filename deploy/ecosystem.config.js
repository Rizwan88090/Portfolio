// PM2 process list for Pentacore only. Other PM2 apps on the server are not affected.
// Ports and the Node.js binary come from ../.deploy.env, written by setup-server.sh.
// Usage (on the server, from the repo root): pm2 startOrReload deploy/ecosystem.config.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cfg = { WEB_PORT: '3100', API_PORT: '3101', NODE_BIN: 'node' };
try {
  for (const line of fs.readFileSync(path.join(root, '.deploy.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)=(.*)$/);
    if (m) cfg[m[1]] = m[2].trim();
  }
} catch {
  /* defaults */
}

module.exports = {
  apps: [
    {
      name: 'pentacore-api',
      cwd: path.join(root, 'backend'),
      script: 'dist/main.js',
      interpreter: cfg.NODE_BIN,
      env: { NODE_ENV: 'production', PORT: cfg.API_PORT, HOST: '127.0.0.1' },
      max_memory_restart: '400M',
      time: true,
    },
    {
      name: 'pentacore-web',
      cwd: path.join(root, 'frontend'),
      script: 'node_modules/next/dist/bin/next',
      args: `start -H 127.0.0.1 -p ${cfg.WEB_PORT}`,
      interpreter: cfg.NODE_BIN,
      // Two instances reloaded one at a time, so the site stays up during deploys.
      exec_mode: 'cluster',
      instances: 2,
      env: { NODE_ENV: 'production' },
      max_memory_restart: '600M',
      time: true,
    },
  ],
};
