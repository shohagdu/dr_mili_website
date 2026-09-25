# Dr. Tapan API — Rust + Actix-web

REST API backend for the Dr. Md. Touhid Belal Tapan website.

## Tech

- **Rust 1.82+** with edition 2021
- **actix-web 4** — high-performance async web framework
- **sqlx** — async, compile-time-checked SQL for MySQL
- **argon2 + jsonwebtoken** — secure admin auth
- **lettre** — SMTP email sending
- **reqwest** — HTTP client for SMS gateway

## Run locally

```bash
# 1. Make sure MySQL is running and seeded (see ../01-database/)

# 2. Copy and edit env
cp .env.example .env
# edit DATABASE_URL, JWT_SECRET (run: openssl rand -base64 64)

# 3. Build & run
cargo run

# Server: http://localhost:8080
# Health: http://localhost:8080/health
```

## Routes

### Public

| Method | Path | Body |
|---|---|---|
| GET | `/health` | — |
| POST | `/api/v1/appointments` | `{patient_name, phone, email?, age?, gender?, problem_summary, preferred_date, preferred_slot}` |
| POST | `/api/v1/contact` | `{name, email?, phone?, subject?, message}` |
| GET | `/api/v1/services` | — |
| GET | `/api/v1/services/{slug}` | — |
| GET | `/api/v1/blog?limit=10&offset=0` | — |
| GET | `/api/v1/blog/{slug}` | — |
| GET | `/api/v1/testimonials` | — |
| GET | `/api/v1/faqs?category=` | — |
| GET | `/api/v1/settings` | — |
| POST | `/api/v1/auth/login` | `{email, password}` → `{token, user}` |

### Admin (require `Authorization: Bearer <jwt>`)

| Method | Path | Body |
|---|---|---|
| GET | `/api/v1/admin/appointments?status=&limit=&offset=` | — |
| PATCH | `/api/v1/admin/appointments/{id}` | `{status?, admin_notes?}` |
| GET | `/api/v1/admin/messages` | — |
| PATCH | `/api/v1/admin/messages/{id}/read` | — |

## Create an admin user

The seed inserts a placeholder hash. Replace it with a real argon2 hash. Quickest way — a small Rust helper:

```rust
use argon2::{password_hash::{rand_core::OsRng, PasswordHasher, SaltString}, Argon2};

fn main() {
    let password = "YourStrongPassword!";
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default().hash_password(password.as_bytes(), &salt).unwrap().to_string();
    println!("{}", hash);
}
```

Then:
```sql
UPDATE admin_users SET password_hash = '<paste-hash>' WHERE email = 'admin@drtapan.com';
```

## Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login

# In this directory
railway init
railway up                # uses Dockerfile
railway domain            # get the public URL
```

Set env vars in Railway dashboard: `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS=https://drtapan.com`, SMTP/SMS settings.

## Test

```bash
# Create an appointment
curl -X POST http://localhost:8080/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "Test Patient",
    "phone": "+8801711000000",
    "email": "test@example.com",
    "problem_summary": "Persistent flank pain for 3 days",
    "preferred_date": "2026-06-01",
    "preferred_slot": "evening"
  }'

# List services
curl http://localhost:8080/api/v1/services

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@drtapan.com","password":"YourStrongPassword!"}'
```
