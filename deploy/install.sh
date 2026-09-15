#!/bin/sh
set -eu
[ "$(id -u)" -eq 0 ] || { echo "Ejecuta como root"; exit 1; }
id alpinefilm >/dev/null 2>&1 || adduser -S -D -H -s /sbin/nologin alpinefilm
for dir in /srv/alpinefilm/videos /srv/alpinefilm/posters /srv/alpinefilm/subtitles /srv/alpinefilm/uploads /srv/alpinefilm/database /srv/alpinefilm/backups; do mkdir -p "$dir"; done
chown -R alpinefilm:alpinefilm /srv/alpinefilm /opt/alpinefilm/backend
chmod 750 /srv/alpinefilm
[ -f /opt/alpinefilm/backend/.env ] || { cp /opt/alpinefilm/backend/.env.example /opt/alpinefilm/backend/.env; chmod 600 /opt/alpinefilm/backend/.env; echo "EDITA .env ANTES DE INICIAR"; }
cd /opt/alpinefilm/backend
npm ci
npm run build
cp deploy/alpinefilm.initd /etc/init.d/alpinefilm
chmod 755 /etc/init.d/alpinefilm
rc-update add alpinefilm default
echo "Instalado. Edita .env, crea el admin y ejecuta: rc-service alpinefilm start"
