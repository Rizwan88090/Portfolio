#!/usr/bin/env bash
# Installs dependencies and builds both apps. Used by setup-server.sh and update.sh.
# Uses the Node.js chosen by setup-server.sh (see ../.deploy.env), never changing the system one.
#
# The website is built into .next-build and only swapped into .next once the build
# succeeds, so the live site keeps serving the previous version during the build.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ -f "$ROOT/.deploy.env" ]; then
  # shellcheck disable=SC1091
  . "$ROOT/.deploy.env"
  [ -n "${NODE_BIN:-}" ] && export PATH="$(dirname "$NODE_BIN"):$PATH"
fi
echo "Building with Node.js $(node -v)"

# Reinstall packages only when package-lock.json changed, so running apps keep their modules.
install_if_changed() {
  local hash
  hash="$(sha256sum package-lock.json | cut -d' ' -f1)"
  if [ -d node_modules ] && [ -f node_modules/.lock-hash ] && [ "$(cat node_modules/.lock-hash)" = "$hash" ]; then
    echo "$(basename "$PWD"): dependencies unchanged, skipping install."
  else
    npm ci --no-audit --no-fund
    echo "$hash" > node_modules/.lock-hash
  fi
}

cd "$ROOT/backend"
install_if_changed
npm run build

cd "$ROOT/frontend"
install_if_changed
rm -rf .next-build
NEXT_DIST_DIR=.next-build NODE_OPTIONS="--max-old-space-size=1536" npx next build

# Atomic-ish swap: the running server keeps its open files until PM2 reloads it.
rm -rf .next-old
[ -d .next ] && mv .next .next-old
mv .next-build .next
rm -rf .next-old
echo "Frontend build swapped in."
