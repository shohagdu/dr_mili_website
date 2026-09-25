#!/usr/bin/env bash
# ============================================================
# Import the Dr. Tapan database schema + seed data into a
# MySQL database (e.g. on cPanel shared hosting).
#
# Imports all 7 migrations IN ORDER. It uses the cPanel-stripped
# 0001 (no CREATE DATABASE / USE), so it loads into the database
# you pass on the command line — which must already exist.
#
# Usage:
#   deploy/import-db.sh <db_user> <db_name> [db_host]
#
# Examples:
#   deploy/import-db.sh CPUSER_dbuser CPUSER_drtapan
#   deploy/import-db.sh CPUSER_dbuser CPUSER_drtapan localhost
#
# You'll be prompted for the DB password (never pass it on the
# command line — it would leak into shell history / process list).
# ============================================================
set -euo pipefail

DB_USER="${1:-}"
DB_NAME="${2:-}"
DB_HOST="${3:-localhost}"

if [[ -z "$DB_USER" || -z "$DB_NAME" ]]; then
  echo "Usage: $0 <db_user> <db_name> [db_host]" >&2
  echo "Example: $0 CPUSER_dbuser CPUSER_drtapan" >&2
  exit 1
fi

# Resolve paths relative to THIS script, so it works from any cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MIG_DIR="$REPO_DIR/backend/migrations"

# 0001 comes from the cPanel-stripped copy; 0002..0007 from migrations/.
FILES=(
  "$SCRIPT_DIR/0001_init_cpanel.sql"
  "$MIG_DIR/0002_doctors_and_content.sql"
  "$MIG_DIR/0003_homepage_hero.sql"
  "$MIG_DIR/0004_doctor_slug_name.sql"
  "$MIG_DIR/0005_themes.sql"
  "$MIG_DIR/0006_update_doctor_content.sql"
  "$MIG_DIR/0007_hero_and_about_content.sql"
)

# Fail early if any file is missing.
for f in "${FILES[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "ERROR: missing SQL file: $f" >&2
    exit 1
  fi
done

echo "Importing ${#FILES[@]} migrations into '$DB_NAME' as '$DB_USER' on '$DB_HOST'..."
echo "You will be prompted for the database password."

# Concatenate in order and pipe once into mysql. --show-warnings surfaces
# anything non-fatal; set -e + mysql's exit code stop us on a real error.
cat "${FILES[@]}" | mysql --show-warnings -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME"

echo
echo "Schema + seed imported."
echo "Next, run these two one-time steps (see DEPLOYMENT.md section 3):"
echo "  1. Activate the hero row:"
echo "       mysql -h $DB_HOST -u $DB_USER -p $DB_NAME \\"
echo "         -e \"UPDATE webpage_contents SET is_active = 1 WHERE type = 9;\""
echo "  2. Insert your admin user (generate hash with: cargo run --bin hash_password -- 'YourPassword')."
