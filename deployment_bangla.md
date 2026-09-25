# cPanel-এ ডিপ্লয় ও আপডেট গাইড (drtaponckdu.com)

> এই গাইডটা `drtaponckdu.com` সাইটের জন্য — যা cPanel + LiteSpeed শেয়ার্ড হোস্টিং-এ চলছে।

---

## ১. পুরো সিস্টেম এক নজরে

| অংশ | সার্ভারে যেখানে থাকে | পাবলিক ঠিকানা |
|---|---|---|
| Frontend (ওয়েবসাইট, Next.js) | `~/drtaponckdu_site/` | `https://drtaponckdu.com` |
| Backend (API, Rust) | `~/drtaponckdu_api/` | `https://api.drtaponckdu.com` |
| আপলোড করা ছবি | `~/drtaponckdu_api/uploads/` | `https://api.drtaponckdu.com/uploads/...` |
| ডাটাবেস | cPanel MySQL | — |

```
ব্রাউজার ──► https://drtaponckdu.com          (Next.js, Node.js App / Passenger দিয়ে চলে)
   │
   └────────► https://api.drtaponckdu.com      (.htaccess proxy → 127.0.0.1:3001)
                        │
                        └──► Rust binary (cron দিয়ে চালু থাকে) ──► MySQL
```

---

## ২. তিন ধরনের আপডেট

| কী পরিবর্তন করেছেন | কোনটা deploy করবেন |
|---|---|
| ওয়েবসাইটের ডিজাইন/লেখা/পেজ | শুধু **Frontend** (অংশ ৪) |
| API / সার্ভারের Rust কোড | শুধু **Backend** (অংশ ৫) |
| নতুন টেবিল / ডাটাবেস পরিবর্তন | **Database** (অংশ ৬) |

---

## ৩. বিল্ড করা (সব আপডেটের আগে — নিজের কম্পিউটারে)

শেয়ার্ড হোস্টিং-এ Next.js বা Rust কম্পাইল করা যায় না। তাই **নিজের কম্পিউটারে বিল্ড করে**, তারপর ফাইল আপলোড করতে হয়।

```bash
cd /var/www/personal/doctors_website_touhid_belal
bash deploy/build-and-package.sh
```

এতে `drtaponckdu.zip` তৈরি হবে। এর ভেতরে থাকে:
```
drtaponckdu/
├── drtaponckdu_site/   → ওয়েবসাইটের ফাইল (Frontend)
└── drtaponckdu_api/    → API-র binary ও migration (Backend)
```

> ⚠️ বিল্ড করার আগে নিশ্চিত হোন `frontend/.env.local` ফাইলটা **নেই**। থাকলে নাম বদলে `.env.local.devbak` করুন — নাহলে বিল্ডে ভুল করে `localhost` ঠিকানা ঢুকে যাবে এবং লাইভ সাইট নষ্ট হবে।

---

## ৪. 🟢 Frontend আপডেট (ওয়েবসাইট)

1. **নিজের কম্পিউটারে** অংশ ৩ অনুযায়ী `drtaponckdu.zip` বানান।
2. cPanel → **File Manager** → `drtaponckdu.zip` আপলোড → **Extract** করুন।
3. cPanel → **Terminal** → নতুন ফাইলগুলো ঠিক জায়গায় কপি করুন:
   ```bash
   cp -a ~/drtaponckdu/drtaponckdu_site/. ~/drtaponckdu_site/
   ```
   *(zip যেখানে extract হয়েছে সেই path অনুযায়ী `~/drtaponckdu/` অংশটা বদলাতে পারে)*
4. ঠিকমতো কপি হয়েছে কিনা দেখুন — এই ৪টা থাকতে হবে: `server.js` (বড় সাইজ), `.next`, `node_modules`, `public`:
   ```bash
   ls -la ~/drtaponckdu_site/
   ```
5. cPanel → **Setup Node.js App** → আপনার app-এ **RESTART** ক্লিক করুন।
6. ব্রাউজারে **Ctrl + Shift + R** দিয়ে `https://drtaponckdu.com` দেখুন।

> ❗ Frontend পরিবর্তনের পর **RESTART অবশ্যই দিতে হবে**, নাহলে পুরনো সাইটই দেখাবে।

---

## ৫. 🔵 Backend আপডেট (API / Rust)

1. **নিজের কম্পিউটারে** অংশ ৩ অনুযায়ী নতুন zip বানান।
2. cPanel-এ zip আপলোড + extract করুন।
3. **Terminal**-এ শুধু নতুন binary ফাইলটা বসান:
   ```bash
   cp ~/drtaponckdu/drtaponckdu_api/drtapan-api ~/drtaponckdu_api/drtapan-api
   chmod +x ~/drtaponckdu_api/drtapan-api
   ```
4. পুরনো API বন্ধ করে নতুনটা চালু করুন:
   ```bash
   pkill -f drtapan-api
   ~/drtaponckdu_api/run-backend.sh
   ```
   *(cron এমনিতেও ৫ মিনিটে আবার চালু করে দেয়)*
5. চেক করুন — ব্রাউজারে খুলুন: `https://api.drtaponckdu.com/health` → `{"status":"ok"}` দেখালে ঠিক আছে।

---

## ৬. 🟠 Database আপডেট (নতুন migration)

1. cPanel → **phpMyAdmin** → আপনার ডাটাবেস সিলেক্ট করুন।
2. **Import** ট্যাবে গিয়ে নতুন `.sql` ফাইলটা import করুন।

---

## ৭. ⚠️ কখনো মুছবেন না / বদলাবেন না

- ❌ `~/drtaponckdu_api/.env` — ডাটাবেস পাসওয়ার্ড, JWT সিক্রেট এখানে।
- ❌ `~/drtaponckdu_api/uploads/` — আপলোড করা সব ছবি এখানে। মুছলে ছবি চিরতরে হারাবে।
- ❌ `api.drtaponckdu.com` এর `.htaccess` — এটাই API-কে চালু রাখে।

---

## ৮. সমস্যা হলে (Troubleshooting)

| যা দেখছেন | কারণ ও সমাধান |
|---|---|
| ওয়েবসাইটে **"It works! NodeJS"** দেখাচ্ছে | আসল ফাইল `~/drtaponckdu_site/`-এ কপি হয়নি। অংশ ৪-এর ধাপ ৩ করুন, তারপর RESTART। |
| ওয়েবসাইটে **CSS/ডিজাইন নাই**, এলোমেলো | নতুন ফাইল কপির পর RESTART দেননি, অথবা ব্রাউজার ক্যাশ। RESTART + **Ctrl+Shift+R**। |
| **ছবি আসছে না** | বেশিরভাগ সময় ব্রাউজার ক্যাশ — **Ctrl+Shift+R** বা Incognito-তে দেখুন। API চালু আছে কিনা: `https://api.drtaponckdu.com/health`। |
| **Access denied for user ...** (API লগে) | ডাটাবেসের নাম/পাসওয়ার্ড ভুল, অথবা user-কে DB-তে যোগ করা হয়নি। cPanel → MySQL Databases-এ ঠিক করুন, তারপর API restart। |
| **AddrInUse / Address in use** | API আগে থেকেই চালু আছে (ভালো খবর)। কিছু করার দরকার নেই। পরিষ্কার করতে: `pkill -f drtapan-api` তারপর `run-backend.sh`। |
| API **403 Forbidden** | `api.drtaponckdu.com` এর docroot-এ `.htaccess` নাই বা ভুল। ফাইলে থাকতে হবে: `RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]` |
| Terminal-এ `curl` দিলে **403** আসে | এটা স্বাভাবিক — সার্ভার `curl`-কে ব্লক করে। টেস্টের সময় ব্রাউজার দিয়ে দেখুন, অথবা curl-এ ব্রাউজারের User-Agent দিন। |
| **অ্যাডমিন লগইন কাজ করে না** (`/api/auth/login` → 404) | API subdomain-এর ফোল্ডার যেন **`public_html`-এর ভেতরে `api` নামে না থাকে**। থাকলে `drtaponckdu.com/api/...` ভুল করে ঐ ফোল্ডারে চলে যায়, Next.js-এ যায় না। সমাধান: ফোল্ডারটার নাম `apiproxy` করে subdomain-এর Document Root সেখানে সেট করুন। চেক: `https://drtaponckdu.com/api/health` — **404 হওয়া উচিত** (200 এলে সমস্যা আছে)। |
| **fork: Resource temporarily unavailable** | অনেক process জমে গেছে (limit শেষ)। `pkill -9 -f drtapan-api` চালান, তারপর cPanel থেকে Node app STOP → START। সার্ভারে `npm`/`cargo build` চালাবেন না। |

---

## ৯. দরকারি ঠিকানা ও তথ্য

- ওয়েবসাইট: `https://drtaponckdu.com`
- API: `https://api.drtaponckdu.com` (health: `/health`)
- অ্যাডমিন লগইন: `https://drtaponckdu.com/admin/login`
- Node.js App root: `~/drtaponckdu_site` · startup file: `server.js` · Node 18
- API port: `3001` (localhost only, `.htaccess` proxy দিয়ে পাবলিক)
- API চালু রাখে: cron job (`*/5 * * * *` → `run-backend.sh`)
