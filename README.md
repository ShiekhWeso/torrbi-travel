# TORRBI TRAVEL

Travel platform for TORRBI TRAVEL: tour packages, activities and flights, with online booking, WhatsApp booking, Stripe payments and a full admin dashboard. Built in Arabic and English (RTL/LTR).

## Features

- Home page with destinations, featured packages, activities and offers
- Tour packages by country and city, each with its own detail page
- WhatsApp booking button that sends the program name automatically
- Activities and tours with online booking, Stripe payment and e-tickets
- Customer accounts and a "My Bookings" page
- Admin dashboard at `/admin` for programs, activities, destinations, offers, coupons, bookings, payments, emails and page content
- Email confirmations and tickets with editable templates
- Provider API layer (hotels, flights, activities) built with one adapter per provider
- Arabic / English with RTL / LTR support, SEO and mobile-first design

## Tech Stack

| Area | Tool |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Languages | next-intl |
| Database and auth | PostgreSQL (Supabase or Neon) |
| Payments | Stripe |
| Email | Resend |
| Hosting | Vercel (testing), Hostinger VPS (production) |

## Getting Started

```bash
git clone https://github.com/<your-username>/torrbi-travel.git
cd torrbi-travel
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000

## Environment Variables

Add these to `.env.local` locally, and to Vercel under Settings → Environment Variables.

```
NEXT_PUBLIC_WHATSAPP_NUMBER=      # digits only, with country code
NEXT_PUBLIC_SITE_URL=

DATABASE_URL=
# Supabase only:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

RESEND_API_KEY=
EMAIL_FROM=
```

Never commit `.env` files or API keys.

## Project Structure

```
src/
  app/            pages and routes (public site, /admin, API)
  components/     UI components
  lib/            database, Stripe, email, helpers
  providers/      one adapter per external provider (hotels, flights, activities)
  messages/       ar.json and en.json translations
public/           images and static files
```

## Deployment

**Test (Vercel):** every push to `main` deploys automatically.

**Production (Hostinger VPS):**

```bash
git pull
npm install
npm run build
pm2 restart torrbi
```

Server setup: Node 20+, PM2, Nginx reverse proxy to port 3000, and a Certbot SSL certificate.

## Roadmap

1. Home page design with AR/EN and RTL
2. Database and admin dashboard
3. Public pages and WhatsApp booking
4. Data import
5. Customer accounts and booking flow
6. Stripe, emails and tickets
7. Provider API layer
8. SEO, speed, backups and testing

## Notes

A successful payment is not a final booking until the external provider confirms it.

## License

Private project. All rights reserved.