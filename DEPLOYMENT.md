# Deploying to cPanel shared hosting (drtaponckdu.com)

Target layout:

| Part | Lives at | Public URL |
|---|---|---|
| Frontend (Next.js) | `drtaponckdu_site/` = the domain's document root | `https://drtaponckdu.com` |
| Backend (Rust API) | `~/drtaponckdu_api/` (home root, **not** web-accessible) | `https://api.drtaponckdu.com` (proxied) |
| Uploads | `~/drtaponckdu_api/uploads/` | `https://api.drtaponckdu.com/uploads/...` |
| Database | cPanel MySQL | — |

> **Why a separate API subdomain?** The browser calls the API directly (contact/appointment forms via `lib/api.ts`, and images load from `/uploads`). So the API needs a real public HTTPS URL — localhost-only won't work. We keep the binary private in your home dir and expose it through a tiny proxy `.htaccess` on the `api.` subdomain.

---

## 0. Architecture in one picture

```
Browser ──► https://drtaponckdu.com                  (Next.js via cPanel "Setup Node.js App" / Passenger)
   │
   └──────► https://api.drtaponckdu.com/api/v1/...    (Apache .htaccess [P] proxy)
                         │
                         └──► 127.0.0.1:3001  (Rust binary, kept alive by cron)
                                      │
                                      └──► cPanel MySQL
```

---

## 1. Prerequisites (on YOUR machine, not cPanel)

Shared hosting can't reliably compile Next.js or Rust (memory/toolchain limits — a classic source of failed deploys). **Build locally, upload artifacts.**

- Node.js 18+ and npm
- Rust + the static musl target: `rustup target add x86_64-unknown-linux-musl`
  (Linux: also install `musl-tools`. macOS/Windows: use [`cross`](https://github.com/cross-rs/cross) + Docker, or build inside a Linux box/WSL.)
- `zip`

The whole stack uses **rustls**, not system OpenSSL, so a fully static musl binary runs on any cPanel box with no glibc/OpenSSL version surprises.

---

## 2. Build the release zip

```bash
# 1. The production env is already set for drtaponckdu.com in frontend/.env:
#      NEXT_PUBLIC_BASE_PATH=            (empty — root domain)
#      NEXT_PUBLIC_API_URL=https://api.drtaponckdu.com/api/v1
#      NEXT_PUBLIC_SITE_URL=https://drtaponckdu.com
#    (Template: deploy/frontend.env.production.example)
#
#    ⚠️ If frontend/.env.local exists, rename it to .env.local.devbak first —
#    it OVERRIDES .env during the build and would bake localhost URLs in.

# 2. Build everything and package:
bash deploy/build-and-package.sh
```

Produces `drtaponckdu.zip`:

```
drtaponckdu/
├── drtaponckdu_site/   → becomes the Node app root (the domain's document root)
└── drtaponckdu_api/    → goes into  ~/drtaponckdu_api
    ├── drtapan-api  (static binary)
    ├── migrations/  (0001 … 0007 .sql)
    ├── run-backend.sh
    ├── .env.example
    └── uploads/
```

Upload `drtaponckdu.zip` via cPanel File Manager and **Extract**, then move the two inner folders to their destinations.

---

## 3. Database (cPanel MySQL)

1. **MySQL Databases** → create a database (e.g. `CPUSER_drtapan`) and a user, and **add the user to the database with All Privileges**.
2. Import the schema. In **phpMyAdmin**, select your DB, then **Import** each file in order: `0001` → `0007`.
   - ⚠️ `0001_init.sql` starts with `CREATE DATABASE … ; USE drtapan;`. On cPanel you can't create databases from SQL — **delete those first two statements** before importing 0001 (you're importing into your already-created `CPUSER_drtapan`). The pre-edited `deploy/0001_init_cpanel.sql` already has them removed.
3. After 0007, run this once (the seeded hero row ships inactive):
   ```sql
   UPDATE webpage_contents SET is_active = 1 WHERE type = 9;
   ```
4. Create your admin login. Generate a hash locally with the bundled tool:
   ```bash
   cd backend && cargo run --bin hash_password -- 'YourAdminPassword'
   ```
   then insert the row:
   ```sql
   INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
   VALUES ('you@example.com', '<hash>', 'Admin', 'admin', 1);
   ```

Put the DB name/user/password into `~/drtaponckdu_api/.env` (next step).

---

## 4. Backend (Rust API)

1. `cd ~/drtaponckdu_api`, then `cp .env.example .env` and edit it:
   - `HOST=127.0.0.1`, `PORT=3001`
   - `DATABASE_URL=mysql://CPUSER_dbuser:PASS@localhost:3306/CPUSER_drtapan`
   - `ALLOWED_ORIGINS=https://drtaponckdu.com,https://www.drtaponckdu.com`
   - `JWT_SECRET=` (a long random string — `openssl rand -base64 64`)
2. Make scripts/binary executable: `chmod +x drtapan-api run-backend.sh`
3. **Expose it publicly.** In cPanel → **Subdomains**, create `api.drtaponckdu.com` (document root e.g. `public_html/api.drtaponckdu.com`). Put `deploy/api.htaccess` there as `.htaccess` (rename it). Make sure the port in it matches `PORT` (3001).
4. **Keep it running** via cron (cPanel → **Cron Jobs**):
   ```
   */5 * * * * /home/CPANELUSER/drtaponckdu_api/run-backend.sh
   @reboot     /home/CPANELUSER/drtaponckdu_api/run-backend.sh
   ```
   Start it now without waiting: run `~/drtaponckdu_api/run-backend.sh` from **Terminal** (or just let cron fire).
5. Verify:
   ```bash
   curl https://api.drtaponckdu.com/health
   # {"status":"ok",...}
   ```

---

## 5. Frontend (Next.js via Passenger)

cPanel → **Setup Node.js App** → **Create Application**:

- **Node.js version:** 18+ (match what you built with)
- **Application mode:** Production
- **Application root:** the folder you put `drtaponckdu_site` in (the domain's document root)
- **Application URL:** `drtaponckdu.com`  ← root, no subfolder path
- **Application startup file:** `server.js`  ← the file from the standalone bundle

Then **Run** the app. (No `npm install` needed — the standalone bundle already contains its `node_modules`.)

cPanel auto-creates the `.htaccess` in the app root that hands requests to Passenger. The Next standalone server listens on the port Passenger gives it and serves its own `/_next/static` assets.

Verify: open `https://drtaponckdu.com` — the homepage should render with images, and `https://drtaponckdu.com/admin/login` should let you log in.

---

## 6. Post-deploy checklist

- [ ] `https://drtaponckdu.com` loads with **CSS + images**.
- [ ] Theme colors apply (admin → Theme).
- [ ] Contact / appointment forms submit (browser → `api.drtaponckdu.com`; check CORS = `ALLOWED_ORIGINS`).
- [ ] Admin login works at `/admin/login`.
- [ ] Image upload in admin works (`/uploads` is served by the API subdomain).

---

## 7. Troubleshooting (the usual cPanel pain points)

| Symptom | Cause → Fix |
|---|---|
| All CSS/JS 404, unstyled page | `basePath` mismatch. For a root-domain deploy `NEXT_PUBLIC_BASE_PATH` must be **empty**. If you serve under a subfolder it must equal that folder **and** match the Node App "Application URL" path. Rebuild after changing it (baked at build time). |
| Localhost URLs baked into the live site | A `frontend/.env.local` was present during build (it overrides `.env`). Rename it to `.env.local.devbak` and rebuild. |
| Forms/login fail, CORS error in console | API `ALLOWED_ORIGINS` must include `https://drtaponckdu.com`. Restart the binary after editing `.env`. |
| Mixed-content blocked | `NEXT_PUBLIC_API_URL` must be **https**. |
| API 502 / "connection refused" via subdomain | Binary not running (`pgrep -f drtapan-api`) or wrong `PORT` in `api.htaccess`. Check `~/drtaponckdu_api/app.log`. |
| `[P]` proxy "not allowed" | Host disabled `mod_proxy`. Since your previous Rust project worked, it's likely enabled — open a ticket if not. |
| Binary won't start (glibc errors) | You built a non-musl binary. Rebuild with `--target x86_64-unknown-linux-musl`. |
| DB import error on 0001 | Remove the `CREATE DATABASE`/`USE` lines before importing (or use `deploy/0001_init_cpanel.sql`). |

---

## 8. Updating later

- **Frontend change:** rebuild (`build-and-package.sh`), replace the contents of the domain's document root with the new `drtaponckdu_site`, then **Restart** the Node app in cPanel.
- **Backend change:** rebuild the musl binary, replace `~/drtaponckdu_api/drtapan-api`, then `pkill -f drtapan-api` (cron restarts it within 5 min, or run `run-backend.sh`).
- **New DB migration:** import the new `.sql` in phpMyAdmin.
- Never overwrite `~/drtaponckdu_api/uploads/` or the live `.env`.
