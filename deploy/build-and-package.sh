#!/usr/bin/env bash
# ============================================================
# Build frontend + backend and assemble drtaponckdu.zip
# Run this on YOUR machine (not on cPanel — shared hosting can't
# reliably compile Next.js or Rust). Requires: node 18+, npm,
# rustup with the musl target, zip.
#
#   bash deploy/build-and-package.sh
#
# Output: ./drtaponckdu.zip  with this layout:
#   drtaponckdu/
#   ├── drtaponckdu_site/   -> becomes the Node app root (the domain's docroot)
#   └── drtaponckdu_api/    -> upload to  ~/drtaponckdu_api  (home root)
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
STAGE="$DIST/drtaponckdu"
FE_OUT="$STAGE/drtaponckdu_site"
BE_OUT="$STAGE/drtaponckdu_api"
RUST_TARGET="x86_64-unknown-linux-musl"   # static binary — avoids glibc/OpenSSL issues

echo "==> Clean dist"
rm -rf "$DIST"; mkdir -p "$FE_OUT" "$BE_OUT"

# ---------- FRONTEND (Next.js standalone) ----------
echo "==> Build frontend (standalone)"
cd "$ROOT/frontend"
[ -f .env ] || { echo "!! frontend/.env missing (see deploy/frontend.env.production.example)"; exit 1; }
npm ci
npm run build

# Assemble the self-contained standalone bundle.
cp -r .next/standalone/. "$FE_OUT/"
mkdir -p "$FE_OUT/.next"
cp -r .next/static "$FE_OUT/.next/static"
[ -d public ] && cp -r public "$FE_OUT/public"
cp .env "$FE_OUT/.env"
echo "   frontend bundle -> $FE_OUT"

# ---------- BACKEND (Rust static binary) ----------
echo "==> Build backend (Rust, $RUST_TARGET)"
cd "$ROOT/backend"
rustup target add "$RUST_TARGET" >/dev/null 2>&1 || true
cargo build --release --target "$RUST_TARGET"

cp "target/$RUST_TARGET/release/drtapan-api" "$BE_OUT/drtapan-api"
chmod +x "$BE_OUT/drtapan-api"
cp -r migrations "$BE_OUT/migrations"
mkdir -p "$BE_OUT/uploads"
cp "$ROOT/deploy/run-backend.sh" "$BE_OUT/run-backend.sh"; chmod +x "$BE_OUT/run-backend.sh"
cp "$ROOT/deploy/backend.env.example" "$BE_OUT/.env.example"
echo "   backend bundle -> $BE_OUT"

# ---------- ZIP ----------
echo "==> Zip"
cd "$DIST"
zip -rqy "$ROOT/drtaponckdu.zip" drtaponckdu
echo "==> Done: $ROOT/drtaponckdu.zip"
