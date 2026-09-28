#!/usr/bin/env bash
# One-time setup of a fresh Ubuntu 22.04/24.04 VPS for Pentacore.
#
# Run as root:
#   ADMIN_INITIAL_PASSWORD='...' CERTBOT_EMAIL='you@example.com' bash setup-server.sh
#
# Safe to re-run: existing database, .env files and admin passwords are kept.
set -euo pipefail

DOMAIN="${DOMAIN:-pentacore.world}"
REPO_URL="${REPO_URL:-https://github.com/Rizwan88090/Portfolio.git}"
APP_DIR="${APP_DIR:-/var/www/pentacore}"
DB_NAME="${DB_NAME:-pentacore}"
DB_USER="${DB_USER:-pentacore}"
: "${ADMIN_INITIAL_PASSWORD:?Set ADMIN_INITIAL_PASSWORD (initial password for new admin accounts)}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

log() { printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "Please run as root."; exit 1; }
export DEBIAN_FRONTEND=noninteractive

log "Installing system packages"
apt-get update -y
apt-get install -y curl git nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw openssl ca-certificates gnupg

if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]; then
  log "Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
command -v pm2 >/dev/null || npm install -g pm2

log "Firewall: allow SSH, HTTP and HTTPS only"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null

log "Getting the code"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --ff-only
else
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO_URL" "$APP_DIR"
fi

log "Database"
systemctl enable --now postgresql
if [ ! -f "$APP_DIR/backend/.env" ]; then
  DB_PASS="$(openssl rand -hex 24)"
  if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    sudo -u postgres psql -c "ALTER ROLE $DB_USER WITH PASSWORD '$DB_PASS';"
  else
    sudo -u postgres psql -c "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS';"
  fi
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
    || sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

  log "Writing backend/.env"
  cat > "$APP_DIR/backend/.env" <<EOF
PORT=4000
HOST=127.0.0.1
FRONTEND_URL=https://$DOMAIN,https://www.$DOMAIN
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME
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

if [ ! -f "$APP_DIR/frontend/.env.local" ]; then
  cat > "$APP_DIR/frontend/.env.local" <<EOF
NEXT_PUBLIC_API_URL=/api
BACKEND_URL=http://127.0.0.1:4000
EOF
fi

log "Installing dependencies and building"
bash "$APP_DIR/deploy/build.sh"

log "Starting the apps with PM2"
cd "$APP_DIR"
pm2 startOrReload deploy/ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null

log "Nginx"
sed "s/__DOMAIN__/$DOMAIN/g" "$APP_DIR/deploy/nginx-pentacore.conf" > /etc/nginx/sites-available/pentacore
ln -sf /etc/nginx/sites-available/pentacore /etc/nginx/sites-enabled/pentacore
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

log "HTTPS certificate"
SERVER_IP="$(curl -fsS https://api.ipify.org || true)"
DOMAIN_IP="$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}')"
if [ -n "$SERVER_IP" ] && [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
  if [ -n "$CERTBOT_EMAIL" ]; then
    certbot --nginx --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect -d "$DOMAIN" -d "www.$DOMAIN"
  else
    certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email --redirect -d "$DOMAIN" -d "www.$DOMAIN"
  fi
else
  echo "Skipping HTTPS: $DOMAIN points to '${DOMAIN_IP:-nothing}', this server is '$SERVER_IP'."
  echo "Point the DNS A records to this server, wait a few minutes, then re-run this script."
fi

log "Done"
echo "Website: http://$DOMAIN (https once the certificate is issued)"
echo "Admin:   http://$DOMAIN/admin"
pm2 status
