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
| Facebook | https://www.facebook.com/aljalsarestaurant/ | Web search result | **Needs confirmation** |
| Email | aljalsarestaurant.sa@gmail.com | Third-party listing | **Needs confirmation** (not shown on the site until confirmed) |
| Instagram | https://www.instagram.com/aljalsarestaurant/ | Supplied by client | Verified |
| TikTok, Snapchat | Not found | - | Add in admin if they exist |
| Google reviews | 8 reviews | Screenshots supplied by client, typed verbatim | Verified; overall rating not supplied |
| Delivery | Listed on Ninja (Al Murabba branch) and HungerStation | ananinja.com, hungerstation.com | Verified that delivery apps list it. Own delivery via WhatsApp and its fee: **needs confirmation** |
| Catering packages | None published | - | Configurable in admin; hidden until added |
| History, founding year, awards | None published | - | Not stated anywhere on the site |

Google Maps and HungerStation refuse automated access ("unusual traffic" / Cloudflare block). We
did not try to get around that.

## 2. Menu

Source: the restaurant's printed menu (supplied 22 Nov 2026): 12 sections, 124 dishes, 137 prices,
with calories. It replaced the first version, taken from the Ninja delivery listing. Corrections,
conflicts and removed dishes are listed in `docs/content-changes.md`.

## 3. Design inspiration analysis

| Reference | What it does | What we take |
|---|---|---|
| 1. Snack World menu | Near-black concrete texture; huge centred caps title between two hairlines; two half-plates meeting in the middle; circular category icons above; dish name in condensed gold caps, short description, price; prev/next spoon controls; centred footer logo with nav either side | Stone background, centred hairline titles, the split-plate hero, circular plate tabs on the menu page, gold dish names, footer layout |
| 2. Little Red Hen bakery | Dark flour-dusted surface; sketch logo top left; editorial caps serif headline; one hero object with tight crop; dark product tiles (photo, price, weight, serif name, small Add button); one tile highlighted in the accent colour with a tick | High-contrast serif for dish names, product tile anatomy, "added" state shown by a coloured tile with a tick, small accent buttons |
| 3. Steakhouse menu | Black wood, plates alternating left and right in a zigzag, flour and spice splashes behind plates, typewriter category labels, herbs scattered, events and booking blocks | The zigzag category showcase with dust splashes behind plates, scattered garnish rhythm, booking-style CTA block |

Shared language: dark textured ground, food as cut-out plates seen from above, warm single accent
colour, generous negative space, centred symmetric compositions, small tracked labels.

Brand adaptation: the accent is the logo's gold, the secondary is the logo's maroon (used for
bands and the "added to order" state), and the hairline + diamond divider comes straight from the
logo.

## 4. Design system

### Colour (contrast measured on `--ink`)
| Token | Hex | Use | Contrast on ink |
|---|---|---|---|
| ink | #110E0C | page ground | - |
| ink-2 | #1A1613 | tiles, panels | - |
| line | #3A2F27 | hairlines | - |
| ivory | #F3E9D8 | headings, primary text | 16.0:1 |
| sand | #CDBFA8 | body text | 10.6:1 |
| muted | #9A8C78 | meta text | 5.9:1 |
| gold | #C9973F | labels, prices, buttons (ink text on gold 7.3:1) | 7.3:1 |
| gold-soft | #E2BF7A | small labels over photos | 11.0:1 |
| maroon | #5B1B13 | bands, active tile | ivory on maroon 10.8:1, gold on maroon 5.0:1 |
| maroon-deep | #3B1410 | app icon, band shadow | - |

### Type
- Display: **Cinzel 700** (EN, caps only); **El Messiri 700** (AR).
- Dish names and editorial lines: **Bodoni Moda** 500 / italic 500 (EN); El Messiri 600 (AR).
- Body and UI: **Jost** 400/500 (EN); **Readex Pro** 400/500 (AR).
- Scale (fluid): display-xl clamp(3.5rem, 11vw, 10rem); display clamp(2.25rem, 5vw, 4.25rem);
  title clamp(1.6rem, 2.6vw, 2.25rem); dish 1.375rem; body 1.0625rem / 1.65; small 0.9375rem.
- Small-text scale, defined once: `.eyebrow` (12px, 500, caps, 0.32em, gold), `.action`
  (13px, 500, caps, 0.18em), `.meta` (14px). Nothing under 12px. Arabic never gets letter-spacing
  or uppercase.

### Space, borders, radius
- 4px base; section padding clamp(5rem, 12vw, 10rem); content width 1240px; text measure 60ch.
- Hairlines 1px `line`. Radius: 2px on buttons and inputs, 0 on tiles; plates are circles.
  No glassmorphism, no gradients except neutral photo scrims, no drop shadows except a soft
  contact shadow under cut-out plates.

### Buttons
- Primary: gold fill, ink text, caps `.action`, 2px radius; hover fills from the start edge
  (direction flips in RTL).
- Secondary: 1px ivory outline. Tertiary: text with animated underline.

### Image treatment
- Cut-out plates (background removed with Apple Vision from the restaurant's own photos) on the
  stone ground with a dust splash and contact shadow. Only full, uncropped plates rotate.
- Original square photos for the gallery and for plates cropped by the original frame.
- No colour tint on food photos.

### Motion principles
- Scroll-linked with GSAP ScrollTrigger (`scrub`), not play-once. Few pins: hero, story,
  featured horizontal gallery.
- Rotation max 40 degrees on entry, settling to 0; scale 0.85 to 1.15; 3D tilt max 18 degrees.
- Lenis smooth scroll on desktop pointer devices only, synced to the GSAP ticker; off for
  reduced motion.
- `gsap.matchMedia`: full effects at 900px+ with no reduced-motion preference; simplified
  (no pins, smaller movement) under 900px; none with `prefers-reduced-motion: reduce`.
- Content is visible without JavaScript; the hero heading is never hidden (LCP).
- Directional effects read `dir` and mirror in Arabic.

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
1. Do you deliver yourselves (not only through apps)? If yes, the delivery fee and area.
2. Is facebook.com/aljalsarestaurant yours? TikTok / Snapchat?
3. The two price conflicts on the printed menu (Methi Chaman, Green Salad).
4. Descriptions for Mutton Fry and Matka Kheer.
5. Original photo files (the printed menu photos are small) and photos for the 77 dishes without one.
6. Overall Google rating and review count, if you want them shown.
7. Catering packages, if you want fixed packages shown.
