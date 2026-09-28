#!/usr/bin/env bash
# Read-only report of what is already running on the server. Changes nothing.
set -uo pipefail

section() { printf '\n===== %s =====\n' "$*"; }

section "System"
. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME"
echo "CPU: $(nproc)  |  $(free -h | awk '/Mem:/{print "RAM: "$2" total, "$7" available"}')"
df -h / | awk 'NR==2{print "Disk: "$2" total, "$4" free"}'

section "Listening ports"
ss -ltnp 2>/dev/null | awk 'NR>1{print $4, $6}' | sort -u

section "Web server on port 80/443"
ss -ltnp 2>/dev/null | grep -E ':(80|443)\s' || echo "nothing on 80/443"
for s in nginx apache2 httpd lshttpd openlitespeed caddy; do
  systemctl is-active --quiet "$s" 2>/dev/null && echo "active service: $s"
done
command -v docker >/dev/null && { echo "docker containers:"; docker ps --format '  {{.Names}}  {{.Ports}}' 2>/dev/null; }

section "Nginx sites"
if command -v nginx >/dev/null; then
  nginx -v 2>&1
  ls -l /etc/nginx/sites-enabled/ 2>/dev/null
  ls /etc/nginx/conf.d/ 2>/dev/null
  grep -rhoE 'server_name[^;]+' /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | sort -u
fi

section "Control panels"
for d in /usr/local/CyberCP /usr/local/cpanel /usr/local/hestia /usr/local/vesta /www/server/panel /opt/coolify /data/coolify; do
  [ -e "$d" ] && echo "found: $d"
done
echo "(end)"

section "Runtimes"
command -v node >/dev/null && echo "node $(node -v) at $(command -v node)" || echo "node: not installed"
command -v pm2 >/dev/null && { echo "pm2 apps:"; pm2 jlist 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{JSON.parse(s).forEach(a=>console.log("  "+a.name+"  "+a.pm2_env.status))}catch{console.log("  (could not read)")}})' 2>/dev/null; } || echo "pm2: not installed"
command -v psql >/dev/null && echo "postgres: $(psql --version)" || echo "postgres: not installed"
systemctl is-active --quiet postgresql 2>/dev/null && echo "postgresql service active"

section "Firewall and SSH"
command -v ufw >/dev/null && ufw status 2>/dev/null | head -20
grep -E '^\s*Port\s' /etc/ssh/sshd_config 2>/dev/null || echo "ssh port: 22 (default)"

section "Existing app folder"
ls -la /var/www 2>/dev/null
