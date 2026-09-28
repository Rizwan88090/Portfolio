#!/usr/bin/env bash
# Pulls the latest code from GitHub, rebuilds and restarts only the Pentacore apps.
# Run on the server:  bash /var/www/pentacore/deploy/update.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .deploy.env ]; then
  # shellcheck disable=SC1091
  . ./.deploy.env
  [ -n "${NODE_BIN:-}" ] && export PATH="$(dirname "$NODE_BIN"):$PATH"
fi

git pull --ff-only
nice -n 10 bash deploy/build.sh
pm2 startOrReload deploy/ecosystem.config.js
pm2 save
echo "Updated to $(git log -1 --format='%h %s')"
