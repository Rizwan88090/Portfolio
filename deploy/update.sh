#!/usr/bin/env bash
# Pulls the latest code from GitHub, rebuilds and restarts with near-zero downtime.
# Run on the server:  bash /var/www/pentacore/deploy/update.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"
git pull --ff-only
bash deploy/build.sh
pm2 startOrReload deploy/ecosystem.config.js
pm2 save
echo "Updated to $(git log -1 --format='%h %s')"
