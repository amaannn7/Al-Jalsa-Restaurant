/**
 * Idempotent seed. Safe to run on every deploy: it only fills tables that are empty, and only
 * creates the first admin when no admin exists. It never overwrites edits made in the admin.
 *
 *   npx prisma db seed            (or: npx tsx prisma/seed.ts)
 *   SEED_RESET_MENU=1 npx tsx prisma/seed.ts       (replaces the menu with the seed menu)
 *   SEED_RESET_SETTINGS=1 npx tsx prisma/seed.ts   (overwrites restaurant details with the defaults)
 *   SEED_RESET_GALLERY=1 npx tsx prisma/seed.ts    (replaces the home gallery with the seed photos)
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { contentDefaults } from "../src/content/defaults";
import { settingsDefaults } from "../src/content/settings-defaults";
import { seedGallery, seedMenu, seedReviews } from "../src/lib/seed-source";
import { directDatabaseUrl } from "../src/lib/db-url";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: directDatabaseUrl() }),
});

async function seedMenuTables() {
  if (process.env.SEED_RESET_MENU === "1") {
    await prisma.menuVariant.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
  }
  if ((await prisma.category.count()) > 0) return console.log("menu: already present, skipped");
  for (const c of seedMenu.categories) {
    const cat = await prisma.category.create({
      data: {
        slug: c.slug,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        descriptionEn: c.descriptionEn,
        descriptionAr: c.descriptionAr,
        sortOrder: c.sortOrder,
      },
    });
    for (const i of seedMenu.items.filter((x) => x.category === c.slug)) {
      await prisma.menuItem.create({
        data: {
          slug: i.slug,
          categoryId: cat.id,
          nameEn: i.nameEn,
          nameAr: i.nameAr,
          descriptionEn: i.descriptionEn,
          descriptionAr: i.descriptionAr,
          imageUrl: i.imageUrl,
          cutoutUrl: i.cutoutUrl,
          cutoutWhole: i.cutoutWhole,
          isFeatured: i.isFeatured,
          isPopular: i.isPopular,
          isAvailable: i.isAvailable,
          sortOrder: i.sortOrder,
          source: i.source,
          variants: { create: i.variants },
        },
      });
    }
  }
  console.log(`menu: ${seedMenu.categories.length} categories, ${seedMenu.items.length} items`);
}

async function seedSettings() {
  const { hours, socials, ...rest } = settingsDefaults;
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: process.env.SEED_RESET_SETTINGS === "1" ? { ...rest, hours, socials } : {},
    create: { id: 1, ...rest, hours, socials },
  });
  console.log("settings: ensured");
}

async function seedContent() {
  let added = 0;
  for (const [n, c] of contentDefaults.entries()) {
    const exists = await prisma.contentBlock.findUnique({ where: { key: c.key } });
    if (exists) continue;
    await prisma.contentBlock.create({
      data: { key: c.key, group: c.group, label: c.label, en: c.en, ar: c.ar, multiline: !!c.multiline, sortOrder: n },
    });
    added++;
  }
  console.log(`content: ${added} new blocks`);
}

async function seedGalleryTable() {
  if (process.env.SEED_RESET_GALLERY === "1") await prisma.galleryImage.deleteMany();
  if ((await prisma.galleryImage.count()) > 0) return console.log("gallery: already present, skipped");
  await prisma.galleryImage.createMany({
    data: seedGallery.map((g, n) => ({ url: `/images/menu/${g.slug}.webp`, altEn: g.altEn, altAr: g.altAr, sortOrder: n })),
  });
  console.log(`gallery: ${seedGallery.length} images`);
}

async function seedReviewsTable() {
  if ((await prisma.review.count()) > 0) return console.log("reviews: already present, skipped");
  await prisma.review.createMany({ data: seedReviews.map((r, n) => ({ ...r, sortOrder: n })) });
  console.log(`reviews: ${seedReviews.length} added`);
}

async function seedAdmin() {
  if ((await prisma.adminUser.count()) > 0) return console.log("admin: exists, skipped");
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return console.warn("admin: ADMIN_EMAIL / ADMIN_PASSWORD not set, no admin created");
  if (password.length < 12) {
    // Do not fail the whole deploy over this: say so clearly and let the next deploy create the admin.
    console.warn("\n*** admin: ADMIN_PASSWORD is shorter than 12 characters, so NO admin account was created.");
    console.warn("*** Set a longer ADMIN_PASSWORD in Vercel (Settings > Environment Variables) and redeploy.\n");
    return;
  }
  await prisma.adminUser.create({
    data: { email, name: "Owner", role: "OWNER", passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`admin: created ${email}`);
}

async function main() {
  await seedMenuTables();
  await seedSettings();
  await seedContent();
  await seedGalleryTable();
  await seedReviewsTable();
  await seedAdmin();
}

main()
  .catch((e) => {
    // Print a plain explanation first (host only, never the password), then the raw error.
    let host = "(none)";
    try {
      host = new URL(directDatabaseUrl() ?? "").host;
    } catch {}
    const msg = `${String((e as Error)?.message ?? e)} ${(e as { code?: string })?.code ?? ""}`;
    console.error("\n*** Seeding the database failed. Database host: " + host);
    if (/P1001|P1002|reach database|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|timeout|connect/i.test(msg)) console.error("*** Could not reach the database. Check that the database is connected to this project in Vercel > Storage.");
    else if (/P1000|password authentication|authentication failed/i.test(msg)) console.error("*** The database rejected the username/password. Reconnect the database in Vercel > Storage.");
    else if (/does not exist|relation/i.test(msg)) console.error("*** Tables are missing: the migration step did not run against this database.");
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
