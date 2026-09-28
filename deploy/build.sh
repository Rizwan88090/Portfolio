#!/usr/bin/env bash
# Installs dependencies and builds both apps. Used by setup-server.sh and update.sh.
# Uses the Node.js chosen by setup-server.sh (see ../.deploy.env), never changing the system one.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ -f "$ROOT/.deploy.env" ]; then
  # shellcheck disable=SC1091
  . "$ROOT/.deploy.env"
  [ -n "${NODE_BIN:-}" ] && export PATH="$(dirname "$NODE_BIN"):$PATH"
fi
echo "Building with Node.js $(node -v)"

cd "$ROOT/backend"
npm ci --no-audit --no-fund
npm run build

cd "$ROOT/frontend"
npm ci --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=1536" npx next build
