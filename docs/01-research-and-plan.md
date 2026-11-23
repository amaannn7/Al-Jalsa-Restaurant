# Al Jalsa Restaurant: research, design system and plan

Prepared 21 Nov 2026. This file records what is verified, where it came from, what still
needs the restaurant's confirmation, and the design decisions behind the site.

## 1. Restaurant information

| Fact | Value | Source | Status |
|---|---|---|---|
| Name (EN) | AL JALSA RESTAURANT | Logo, Ninja listing, Google share link query | Verified |
| Name (AR) | مطعم الجلسة | Logo, Google share link query | Verified |
| Tagline | Multi-Cuisine Restaurant | Logo | Verified |
| Address | Ibn Al Nadeem Street, Al Murabba, Riyadh 12626, Saudi Arabia | Supplied by client (from Google Maps) | Verified by client |
| Landmark | Behind the Chamber of Commerce, Al Murabba | Restaurant's buffet posters | Verified |
| Lunch buffet | Sun to Wed, 12:30 PM to 3:30 PM; adult SAR 32 (regular 45), kids 5 to 10 SAR 23 (regular 30), incl. VAT, limited-time offer | Restaurant's poster | Verified (editable in admin) |
| Chicken supplier | "We use only Tanmiah fresh chicken" | Printed menu | Verified |
| Phone | +966 56 671 5786 | Supplied by client; also on Facebook page | Verified by client |
| WhatsApp number for orders | +966 56 671 5786 | Restaurant's buffet posters (printed with the WhatsApp icon) | Verified |
| Opening hours | Sat to Wed 6 AM to 1 AM; Thu and Fri 6 AM to 2 AM | Supplied by client (Google Maps) | Verified by client |
| Google Maps link | https://share.google/Q3kOWnG8Lw7v25VOw (knowledge-graph id /g/11x73bjxj3) | Client brief | Verified |
| Facebook | https://www.facebook.com/aljalsarestaurant/ | Confirmed by the restaurant (22 Nov 2026) | Verified |
| Email | aljalsarestaurant.sa@gmail.com | Third-party listing | **Needs confirmation** (not shown on the site until confirmed) |
| Instagram | https://www.instagram.com/aljalsarestaurant/ | Supplied by client | Verified |
| TikTok, Snapchat | Not found | - | Add in admin if they exist |
| Google reviews | 8 reviews | Screenshots supplied by client, typed verbatim | Verified; overall rating not supplied |
| Delivery | The restaurant delivers (also listed on Ninja and HungerStation) | Confirmed by the restaurant (22 Nov 2026) | Verified. Delivery fee and area: **needs confirmation** |
| Catering packages | None published | - | Configurable in admin; hidden until added |
| History, founding year, awards | None published | - | Not stated anywhere on the site |

Google Maps and HungerStation refuse automated access ("unusual traffic" / Cloudflare block). We
did not try to get around that.

## 2. Menu

Source: the restaurant's printed menu (supplied 22 Nov 2026): 12 sections, 124 dishes, 137 prices,
with calories. It replaced the first version, taken from the Ninja delivery listing. Corrections,
conflicts and removed dishes are listed in `docs/content-changes.md`.

## 3. Design direction (v2, 23 Nov 2026)

The first design (dark stone ground, cut-out plates, Cinzel caps) was replaced at the client's
request with a clean, modern, premium restaurant layout based on a reference the client supplied
(a "fine dining" landing page; kept privately in `docs/brand/inspiration/`, not committed).

| Reference does | We take |
|---|---|
| Dark rounded hero card with a full-bleed moody food photo, nav pills inside it | Hero and every inner-page header are dark rounded photo cards; the header sits inside their top |
| Pill navigation (active pill white), hamburger circle, centred logo, dark "Book a Table" pill | Same, with "Order Now"; the circle opens every page in a full-screen panel |
| Small caps label, large transitional serif headline, short intro, sand pill "Explore Menu", round play button | Same, with WhatsApp in place of the video button (there is no video) |
| "Visit our location" round arrow button | Links to Google Maps |
| Signature-dish card with 01 to 04 counter, glass text card, photo card, prev/next circles | Featured dishes carousel (desktop) |
| White band under the hero: round photo with arrow, fork-and-knife icon, large line | Same, linking to About |

Below the hero the page continues in the same language: white rounded cards on a warm linen ground,
dark photo cards for feature bands (buffet, catering), rounded photos, pill buttons.

## 4. Design system

### Colour
| Token | Hex | Use | Contrast |
|---|---|---|---|
| linen | #F4EFE8 | page ground | - |
| card | #FFFFFF | cards, white band | - |
| stone / hair | #E7DFD4 / #E3DACD | photo placeholders / hairlines | - |
| ink | #16120F | text, dark cards, primary buttons | 17.5:1 on linen |
| muted | #6B6158 | body text on light | 5.6:1 on linen |
| bronze | #7A5C33 | small labels, prices on light | 5.4:1 on linen |
| sand | #D9C2A0 | accent pill buttons (ink text), labels on dark | ink on sand 10.8:1 |

### Type
- Display and dish names: **Newsreader** 400/500 (EN), chosen after rendering candidates against the
  reference headline; **Noto Naskh Arabic** 500/600 (AR).
- Body and UI: **DM Sans** 400/500/600 (EN); **Readex Pro** 400/500 (AR).
- Scale: hero clamp(2.6rem, 5.6vw, 4.6rem); display clamp(2.1rem, 4vw, 3.4rem); title clamp(1.45rem, 2.2vw, 1.9rem).
- Small text: `.eyebrow` (12px, 500, caps, 0.16em, bronze), `.action` (15px, 500), `.meta` (14px).
  Nothing under 12px. Arabic never gets letter-spacing or uppercase.

### Shape
- Cards 24px radius, hero and feature cards 28px, photos inside cards 16 to 20px, buttons and tabs pills.
- No borders on cards (white on linen), one soft shadow on floating bars and dialogs only.

### Photos
- Representative Unsplash stock photos (free licence, credits in `docs/photo-credits.md`), one per
  dish where a good match exists (115 of 124 dishes). Dishes without a match show a neutral tile.
- Original full-resolution downloads, saved as 3840px WebP (quality 88); the 11 originals under
  3840px were upscaled first with Upscayl (Standard model). Served by `next/image` at quality 85.
- No restaurant interiors are used, so nothing suggests a room that is not Al Jalsa's.

### Motion (light, CSS only)
- Hero text rises on load, the hero photo settles from 106% to 100% once.
- Text fades up once as it enters (one IntersectionObserver); photos in editorial blocks and the
  gallery open from a slightly inset frame; card photos zoom 5% on hover.
- Reviews scroll as a marquee that pauses on hover, keyboard focus and while a review is expanded.
- All motion is off with `prefers-reduced-motion`; content is visible without JavaScript.

## 5. Architecture

- Next.js 16.4 App Router, TypeScript, Tailwind CSS 4, Cache Components.
- Routes under `app/[lang]` (`en`, `ar`); `proxy.ts` sends `/` to the saved or browser language.
  `<html lang dir>` is set per locale, so the whole layout mirrors in Arabic.
- Postgres via Prisma 7 (`@prisma/adapter-pg`). Free hosting: Vercel Hobby + Neon (Vercel
  Marketplace). Uploads: Vercel Blob (local `public/uploads` in development).
- Public pages read through cached data functions tagged `menu`, `settings`, `content`;
  admin changes call `updateTag`, so edits go live without a deploy.
- With no `DATABASE_URL`, the site renders from the seed data (read-only) so a preview deploy
  never breaks.
- Admin: email + password (bcrypt), signed httpOnly session cookie (jose), roles OWNER and
  EDITOR, login throttling, zod validation, server-side checks on every action.
- WhatsApp: order, catering and meeting messages are built by tested pure functions and opened
  with `wa.me`. Catering and meeting requests are also saved for the admin inbox.

## 6. Site map
`/en`, `/en/menu`, `/en/order`, `/en/catering`, `/en/book-meeting`, `/en/about`, `/en/contact`
and the same under `/ar`. `/admin` (login, dashboard, menu, categories, settings, content,
catering packages, reviews, enquiries, users).

## 7. Open questions for the client
1. TikTok / Snapchat links, if any.
2. Original photo files (the printed menu photos are small) and photos for the 77 dishes without one.
3. Overall Google rating and review count, if you want them shown.
4. Catering packages, if you want fixed packages shown.
