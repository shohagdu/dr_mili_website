#!/usr/bin/env bash
# ============================================================
# Keep the Rust API running on cPanel shared hosting.
# Shared hosts kill stray processes, so run this from cron:
#
#   */5 * * * * /home/CPANELUSER/drtaponckdu_api/run-backend.sh
#   @reboot     /home/CPANELUSER/drtaponckdu_api/run-backend.sh
#
# It starts the binary only if it isn't already running, loading
# config from the .env next to it. The API listens on 127.0.0.1
# (private); Apache proxies to it (see deploy/api.htaccess).
# ============================================================
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN="$APP_DIR/drtapan-api"
LOG="$APP_DIR/app.log"

cd "$APP_DIR" || exit 1

# Already running? do nothing.
if pgrep -f "$BIN" >/dev/null 2>&1; then
  exit 0
fi

# Load .env into the environment (dotenvy also reads it, this is a belt-and-braces).
set -a
[ -f "$APP_DIR/.env" ] && . "$APP_DIR/.env"
set +a

echo "[$(date '+%F %T')] starting drtapan-api" >> "$LOG"
nohup "$BIN" >> "$LOG" 2>&1 &
