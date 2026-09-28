#!/usr/bin/env bash
# Sets up Pentacore on an Ubuntu VPS that may already host other websites.
#
# Run as root:
#   ADMIN_INITIAL_PASSWORD='...' CERTBOT_EMAIL='you@example.com' bash setup-server.sh
#
# Shared-server rules this script follows:
#   - Never removes or edits other Nginx sites, PM2 apps, databases or firewall rules.
#   - Never upgrades the system Node.js; uses a private Node.js in /opt if needed.
#   - Picks free ports instead of assuming 3000/4000.
#   - Stops if another web server (Apache, LiteSpeed, Caddy...) owns port 80.
#   - Tests the Nginx config and removes only its own site file if the test fails.
# Safe to re-run: existing database, .env files, ports and admin passwords are kept.
set -euo pipefail

DOMAIN="${DOMAIN:-pentacore.world}"
REPO_URL="${REPO_URL:-https://github.com/Rizwan88090/Portfolio.git}"
APP_DIR="${APP_DIR:-/var/www/pentacore}"
DB_NAME="${DB_NAME:-pentacore}"
DB_USER="${DB_USER:-pentacore}"
NODE_MIN=20
PRIVATE_NODE_DIR=/opt/pentacore-node
: "${ADMIN_INITIAL_PASSWORD:?Set ADMIN_INITIAL_PASSWORD (initial password for new admin accounts)}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

log() { printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mSTOP: %s\033[0m\n' "$*"; exit 1; }
port_free() { ! ss -ltn "( sport = :$1 )" 2>/dev/null | grep -q LISTEN; }
pick_port() { local p=$1; while ! port_free "$p"; do p=$((p + 1)); done; echo "$p"; }

[ "$(id -u)" -eq 0 ] || die "Please run as root."
export DEBIAN_FRONTEND=noninteractive

# ---------------------------------------------------------------- pre-flight
log "Pre-flight checks (no changes yet)"
WEB80="$(ss -ltnp '( sport = :80 )' 2>/dev/null | grep -oE 'users:\(\("[^"]+' | head -1 | cut -d'"' -f2 || true)"
if [ -n "$WEB80" ] && [ "$WEB80" != "nginx" ]; then
  die "Port 80 is used by '$WEB80', not Nginx. Configure that web server to proxy $DOMAIN manually."
fi
echo "Port 80: ${WEB80:-free}"

if [ -f "$APP_DIR/.deploy.env" ]; then
  # shellcheck disable=SC1091
  . "$APP_DIR/.deploy.env"
  echo "Reusing ports from $APP_DIR/.deploy.env"
else
  WEB_PORT="$(pick_port 3100)"
  API_PORT="$(pick_port $((WEB_PORT + 1)))"
fi
echo "Pentacore web port: $WEB_PORT, API port: $API_PORT (both bound to 127.0.0.1)"

# ---------------------------------------------------------------- packages
log "Installing only missing packages"
NEED=()
for pkg in curl git nginx postgresql certbot python3-certbot-nginx openssl ca-certificates; do
  dpkg -s "$pkg" >/dev/null 2>&1 || NEED+=("$pkg")
done
if [ ${#NEED[@]} -gt 0 ]; then
  apt-get update -y
  apt-get install -y "${NEED[@]}"
else
  echo "All packages already installed."
fi

# ---------------------------------------------------------------- node.js
SYS_NODE_MAJOR=0
command -v node >/dev/null && SYS_NODE_MAJOR="$(node -v | cut -d. -f1 | tr -d v)"
if [ "$SYS_NODE_MAJOR" -ge "$NODE_MIN" ]; then
  NODE_BIN="$(command -v node)"
  echo "Using system Node.js $(node -v)"
elif [ "$SYS_NODE_MAJOR" -eq 0 ]; then
  log "Installing Node.js 22 (no Node.js was present)"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  NODE_BIN="$(command -v node)"
else
  log "System Node.js is v$SYS_NODE_MAJOR; installing a private Node.js 22 in $PRIVATE_NODE_DIR (system Node.js untouched)"
  if [ ! -x "$PRIVATE_NODE_DIR/bin/node" ]; then
    ARCH="$(uname -m | sed 's/x86_64/x64/; s/aarch64/arm64/')"
    VER="$(curl -fsSL https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt | grep -oE "node-v[0-9.]+-linux-$ARCH.tar.xz" | head -1)"
    mkdir -p "$PRIVATE_NODE_DIR"
    curl -fsSL "https://nodejs.org/dist/latest-v22.x/$VER" | tar -xJ -C "$PRIVATE_NODE_DIR" --strip-components=1
  fi
  NODE_BIN="$PRIVATE_NODE_DIR/bin/node"
fi
NODE_DIR="$(dirname "$NODE_BIN")"
export PATH="$NODE_DIR:$PATH"
command -v pm2 >/dev/null || npm install -g pm2
PM2_BIN="$(command -v pm2)"

# ---------------------------------------------------------------- code
log "Getting the code"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --ff-only
else
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO_URL" "$APP_DIR"
fi
cat > "$APP_DIR/.deploy.env" <<EOF
WEB_PORT=$WEB_PORT
API_PORT=$API_PORT
NODE_BIN=$NODE_BIN
EOF

# ---------------------------------------------------------------- database
log "Database (own role and database only)"
systemctl enable --now postgresql >/dev/null 2>&1 || true
if [ ! -f "$APP_DIR/backend/.env" ]; then
  DB_PASS="$(openssl rand -hex 24)"
  if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    die "A PostgreSQL role '$DB_USER' already exists but backend/.env is missing. Set DB_USER to another name and re-run."
  fi
  sudo -u postgres psql -c "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS';"
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
    && die "A database '$DB_NAME' already exists. Set DB_NAME to another name and re-run."
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
  PG_PORT="$(sudo -u postgres psql -tAc 'SHOW port' | tr -d ' ')"

  cat > "$APP_DIR/backend/.env" <<EOF
PORT=$API_PORT
HOST=127.0.0.1
FRONTEND_URL=https://$DOMAIN,https://www.$DOMAIN
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@127.0.0.1:$PG_PORT/$DB_NAME
DB_SYNC=true
DB_SSL=false
ADMIN_DEFAULT_PASSWORD=$ADMIN_INITIAL_PASSWORD
COOKIE_SECURE=true
TRUST_PROXY=loopback
EOF
  chmod 600 "$APP_DIR/backend/.env"
else
  echo "backend/.env already exists, keeping it."
fi

cat > "$APP_DIR/frontend/.env.local" <<EOF
NEXT_PUBLIC_API_URL=/api
BACKEND_URL=http://127.0.0.1:$API_PORT
EOF

# ---------------------------------------------------------------- build + run
log "Building (low CPU priority so other sites stay responsive)"
nice -n 10 bash "$APP_DIR/deploy/build.sh"

log "Starting Pentacore with PM2 (other PM2 apps untouched)"
cd "$APP_DIR"
"$PM2_BIN" startOrReload deploy/ecosystem.config.js
"$PM2_BIN" save
systemctl is-enabled --quiet pm2-root 2>/dev/null || "$PM2_BIN" startup systemd -u root --hp /root >/dev/null

for i in $(seq 1 30); do
  curl -fsS "http://127.0.0.1:$API_PORT/api/health" >/dev/null 2>&1 && curl -fsS "http://127.0.0.1:$WEB_PORT/" >/dev/null 2>&1 && break
  sleep 2
done
curl -fsS "http://127.0.0.1:$API_PORT/api/health" && echo

# ---------------------------------------------------------------- nginx
log "Nginx: adding only the $DOMAIN site"
SITE=/etc/nginx/sites-available/pentacore
sed -e "s/__DOMAIN__/$DOMAIN/g" -e "s/__WEB_PORT__/$WEB_PORT/g" "$APP_DIR/deploy/nginx-pentacore.conf" > "$SITE"
ln -sf "$SITE" /etc/nginx/sites-enabled/pentacore
if ! nginx -t; then
  rm -f /etc/nginx/sites-enabled/pentacore
  die "Nginx config test failed. The Pentacore site was removed again; other sites are unaffected."
fi
systemctl is-active --quiet nginx && systemctl reload nginx || systemctl enable --now nginx

if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 'Nginx Full' >/dev/null && echo "Firewall is active: allowed HTTP/HTTPS (other rules unchanged)."
fi

# ---------------------------------------------------------------- https
log "HTTPS certificate"
SERVER_IP="$(curl -fsS https://api.ipify.org || true)"
DOMAIN_IP="$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}')"
WWW_IP="$(getent ahostsv4 "www.$DOMAIN" | awk 'NR==1{print $1}')"
if [ -n "$SERVER_IP" ] && [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
  NAMES=(-d "$DOMAIN")
  [ "$SERVER_IP" = "$WWW_IP" ] && NAMES+=(-d "www.$DOMAIN")
  EMAIL_ARGS=(--register-unsafely-without-email)
  [ -n "$CERTBOT_EMAIL" ] && EMAIL_ARGS=(-m "$CERTBOT_EMAIL")
  certbot --nginx --non-interactive --agree-tos "${EMAIL_ARGS[@]}" --redirect --cert-name pentacore "${NAMES[@]}"
else
  echo "Skipping HTTPS for now: $DOMAIN points to '${DOMAIN_IP:-nothing}', this server is '$SERVER_IP'."
  echo "After DNS points here, re-run this script to add HTTPS."
fi

log "Done"
echo "Website: http://$DOMAIN   Admin: http://$DOMAIN/admin"
"$PM2_BIN" status
