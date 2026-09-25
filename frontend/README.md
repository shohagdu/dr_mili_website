# Dr. Mili Website — Frontend (Next.js)

Next.js 14 (App Router) + TypeScript + Tailwind frontend for Prof. Dr. Maksuda Farida Akhtar (Mili)'s urology practice.

## Tech

- **Next.js 14.2** App Router with SSR + ISR
- **TypeScript** strict mode
- **Tailwind CSS** with custom editorial-medical palette
- **lucide-react** for icons
- **Google Fonts**: Fraunces (display) + DM Sans (body) — loaded via `next/font`

## Design Direction

**Editorial Medical** — not the generic blue/white medical template:
- Deep teal `#0f4c5c` (clinical primary) + warm amber `#c47a3d` (accent)
- Warm off-white paper `#faf8f3` background with subtle noise texture
- Display serif (Fraunces) for headings, clean sans (DM Sans) for body
- Asymmetric layouts, generous whitespace, italicized accent words

## Run locally

```bash
# 1. Set env
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL to point to your running backend

# 2. Install
npm install

# 3. Dev
npm run dev    # → http://localhost:3000
```

The backend (Rust API at `02-backend/`) must also be running for data to appear.
Pages have graceful fallbacks if the API is unavailable.

## Routes

| Path | Page |
|---|---|
| `/` | Home — hero, services, philosophy, FAQ |
| `/about` | About Dr. Mili + credentials + full FAQ |
| `/services` | Services index |
| `/services/[slug]` | Individual service detail page |
| `/blog` | Articles index |
| `/blog/[slug]` | Article detail with MedicalScholarlyArticle JSON-LD |
| `/appointment` | Online appointment request form |
| `/contact` | Contact info + form |
| `/sitemap.xml` | Auto-generated sitemap (static + dynamic routes) |
| `/robots.txt` | Crawler directives (AI bots explicitly allowed) |
| `/llms.txt` | AI-friendly content discovery file |

## SEO Features

- ✅ Per-page metadata (title, description, OG, Twitter cards, canonical)
- ✅ JSON-LD schemas:
  - `Physician` + `MedicalBusiness` (homepage)
  - `FAQPage` (homepage + about)
  - `BreadcrumbList` (all inner pages)
  - `MedicalScholarlyArticle` (blog posts)
- ✅ Auto sitemap from dynamic content
- ✅ robots.txt with explicit allows for GPTBot, ClaudeBot, PerplexityBot, etc.
- ✅ Open Graph + Twitter card metadata
- ✅ Semantic HTML, accessible nav, server-rendered for crawlers

## Build & Deploy

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel
vercel login

# In this directory
vercel              # follow prompts
vercel --prod       # deploy production
```

Set these env vars in Vercel dashboard:
- `NEXT_PUBLIC_SITE_URL=https://drtapan.com`
- `NEXT_PUBLIC_API_URL=https://api.drtapan.com/api/v1`

### DNS

Point `drtapan.com` → Vercel (A/CNAME).
Point `api.drtapan.com` → Railway backend.

## Project structure

```
03-frontend/
├── app/
│   ├── layout.tsx              ← root layout, fonts, Physician JSON-LD
│   ├── page.tsx                ← home
│   ├── globals.css             ← Tailwind base + custom components
│   ├── not-found.tsx           ← 404 page
│   ├── sitemap.ts              ← dynamic sitemap
│   ├── about/page.tsx
│   ├── services/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── appointment/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── Header.tsx              ← sticky nav with mobile menu
│   ├── Footer.tsx              ← chamber info + sitemap
│   ├── AppointmentForm.tsx     ← client-side form
│   ├── ContactForm.tsx         ← client-side form
│   └── seo/
│       ├── PhysicianSchema.tsx
│       ├── FAQSchema.tsx
│       └── BreadcrumbSchema.tsx
├── lib/
│   ├── api.ts                  ← typed API client
│   └── utils.ts                ← cn() helper
├── public/
│   ├── robots.txt              ← AI-friendly
│   └── llms.txt                ← AI content discovery
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## Before going live

1. Add real images to `public/`:
   - `og-image.jpg` (1200×630 for social sharing)
   - `doctor-portrait.jpg` (referenced in PhysicianSchema)
   - `favicon.ico`, `apple-touch-icon.png`
2. Add Google Search Console verification code in `app/layout.tsx`
3. Add Google Analytics (set `NEXT_PUBLIC_GA_ID` env var)
4. Replace placeholder testimonial in homepage with consented real ones
5. Add the chamber's Google Map embed (in `app/contact/page.tsx`)
6. Final content review with Dr. Mili
