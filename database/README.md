# Database Setup

## Local development

1. Install MySQL 8 (or Docker MySQL 8)
2. Run schema:
   ```bash
   mysql -u root -p < schema.sql
   ```
3. Run seed data:
   ```bash
   mysql -u root -p drtapan < seed.sql
   ```
4. Create an application user (recommended):
   ```sql
   CREATE USER 'drtapan_app'@'%' IDENTIFIED BY 'change-me-strong-password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON drtapan.* TO 'drtapan_app'@'%';
   FLUSH PRIVILEGES;
   ```

## Docker quick start

```bash
docker run -d --name drtapan-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpw \
  -e MYSQL_DATABASE=drtapan \
  -p 3306:3306 \
  mysql:8.0

# Wait ~15s for MySQL to start
docker exec -i drtapan-mysql mysql -uroot -prootpw drtapan < schema.sql
docker exec -i drtapan-mysql mysql -uroot -prootpw drtapan < seed.sql
```

## Connection string for the backend `.env`

```
DATABASE_URL=mysql://drtapan_app:password@localhost:3306/drtapan
```

## Production (Railway)

1. Create a new Railway project → Add MySQL service
2. Copy the connection URL from Railway → put in backend `DATABASE_URL`
3. Run schema + seed against the Railway DB:
   ```bash
   mysql -h <host> -u <user> -p<password> -P <port> <database> < schema.sql
   mysql -h <host> -u <user> -p<password> -P <port> <database> < seed.sql
   ```

## Tables overview

| Table | Purpose |
|---|---|
| `appointments` | Patient appointment requests |
| `contact_messages` | Contact-form submissions |
| `admin_users` | Admin/staff login accounts |
| `services` | Urology services pages (kidney stone, prostate, etc.) |
| `blog_posts` | Patient education articles |
| `faqs` | FAQ page entries (used for FAQPage JSON-LD) |
| `testimonials` | Published patient testimonials |
| `site_settings` | Key/value clinic info (phone, hours, address) |
