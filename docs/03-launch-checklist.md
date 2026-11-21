# Launch checklist

## 1. Confirm with the restaurant (shown as reminders in Admin → Overview)
- [x] Delivery offered (confirmed 22 Nov 2026).
- [x] Delivery fee: confirmed per order on WhatsApp (customers see a note and an "Ask about the
      delivery charge" link). Enter a fixed fee in Admin → Restaurant details if one is set later.
- [x] Facebook page https://www.facebook.com/aljalsarestaurant/ confirmed. TikTok / Snapchat links, if any.
- [x] Price conflicts: use the menu picture prices (Methi Chaman 18, Green Salad 6).
- [x] Descriptions for Mutton Fry and Matka Kheer written.
- [ ] Whether the 6 dishes on the old Ninja listing but not on the printed menu are still served.
- [ ] Original photo files for the printed menu's photo pages, and photos for dishes without one.
- [ ] Lunch buffet: still Sunday to Wednesday, still SAR 32 / 23? (A review mentions a Saturday buffet.)
      Edit in Admin → Website text → Buffet, or switch it off in Restaurant details.
- [ ] Email address to show (none is shown now) and the overall Google rating (optional).
- [ ] Rights to the food photos (from the restaurant's Ninja listing and printed menu).
- [ ] Review the wording in Admin → Website text and the corrections in `docs/content-changes.md`.

## 2. Staging
- [ ] Deploy on Vercel with `NEXT_PUBLIC_ALLOW_INDEXING=false` (robots.txt disallows everything and
      every page has `noindex`).
- [ ] Sign in to `/admin`, change the password, create accounts for staff (Editors).
- [ ] Place a test order on a phone; check the WhatsApp message arrives correctly.
- [ ] Send a test catering enquiry and a meeting request.
- [ ] Upload one photo in the admin to confirm Vercel Blob is connected.

## 3. Go live
- [ ] Add the domain in Vercel and point DNS as instructed (lower the TTL a day before).
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the domain and `NEXT_PUBLIC_ALLOW_INDEXING=true`; redeploy.
- [ ] Google Search Console: add the domain, submit `https://your-domain/sitemap.xml`.
- [ ] Google Business Profile: set the website link to the new domain.
- [ ] Put the website link on Instagram / Facebook and delivery-app profiles.

## 4. Rollback
- Vercel → Deployments → pick the previous deployment → Promote to Production (instant).
- Database changes made in the admin are not rolled back by this; Neon keeps point-in-time history
  on its free plan for a short window (Neon console → Restore).
