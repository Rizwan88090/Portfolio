#!/usr/bin/env bash
# Installs dependencies and builds both apps. Used by setup-server.sh and update.sh.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT/backend"
npm ci --no-audit --no-fund
npm run build

cd "$ROOT/frontend"
npm ci --no-audit --no-fund
npx next build
