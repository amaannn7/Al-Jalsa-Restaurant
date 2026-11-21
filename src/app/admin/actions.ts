"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { TAGS } from "@/lib/data";
import { attemptLogin, endSession, hashPassword, passwordProblem, requireAdmin, verifyPassword } from "@/lib/auth";
import { removeStoredImage, storeImage } from "@/lib/upload";
import { normalisePhone } from "@/lib/phone";
import type { DayHours } from "@/lib/types";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> } | null;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const intOrNull = (v: string) => (v === "" ? null : Number.isFinite(Number(v)) ? Math.round(Number(v)) : NaN);
/** "42" or "42.50" (riyals) -> 4200 / 4250 halalas; "" -> null. */
const riyalsToHalalas = (v: string) => (v === "" ? null : /^\d+(\.\d{1,2})?$/.test(v) ? Math.round(Number(v) * 100) : NaN);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || `item-${Date.now()}`;

function fail(errors: Record<string, string>, message = "Please fix the highlighted fields."): FormState {
  return { ok: false, message, errors };
}
function file(fd: FormData, k: string): File | null {
  const f = fd.get(k);
  return f instanceof File && f.size > 0 ? f : null;
}

/* ------------------------------------------------------------------ auth */

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const err = await attemptLogin(str(fd, "email"), String(fd.get("password") ?? ""));
  if (err) return { ok: false, message: err };
  const next = str(fd, "next");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

export async function changeOwnPassword(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const user = await db().adminUser.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(current, user.passwordHash))) return fail({ current: "Current password is incorrect." });
  const problem = passwordProblem(next);
  if (problem) return fail({ next: problem });
  if (next !== String(fd.get("confirm") ?? "")) return fail({ confirm: "Passwords do not match." });
  await db().adminUser.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(next), sessionVersion: { increment: 1 } } });
  await endSession();
  redirect("/admin/login?changed=1");
}

/* ------------------------------------------------------------------ menu items */

const itemSchema = z.object({
  nameEn: z.string().min(1, "Required").max(120),
  nameAr: z.string().max(120),
  descriptionEn: z.string().max(600),
  descriptionAr: z.string().max(600),
  categoryId: z.string().min(1, "Choose a category"),
  sortOrder: z.number().int().min(0).max(9999),
});

export async function saveMenuItem(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const parsed = itemSchema.safeParse({
    nameEn: str(fd, "nameEn"),
    nameAr: str(fd, "nameAr"),
    descriptionEn: str(fd, "descriptionEn"),
    descriptionAr: str(fd, "descriptionAr"),
    categoryId: str(fd, "categoryId"),
    sortOrder: Number(str(fd, "sortOrder") || 0),
  });
  if (!parsed.success) return fail(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));

  // Variants arrive as parallel arrays: variantNameEn[], variantNameAr[], variantPrice[].
  const names = fd.getAll("variantNameEn").map(String);
  const namesAr = fd.getAll("variantNameAr").map(String);
  const prices = fd.getAll("variantPrice").map((p) => String(p).trim());
  const cals = fd.getAll("variantCalories").map((p) => String(p).trim());
  const variants: { nameEn: string; nameAr: string; priceHalalas: number | null; calories: number | null; sortOrder: number }[] = [];
  for (let i = 0; i < prices.length; i++) {
    const price = riyalsToHalalas(prices[i]);
    if (Number.isNaN(price)) return fail({ variants: `Price ${i + 1} must be a number like 42 or 42.50 (or empty for "price on request").` });
    if (prices.length > 1 && !names[i]?.trim()) return fail({ variants: "Give each size a name (for example Small / Large)." });
    const calories = intOrNull(cals[i] ?? "");
    if (Number.isNaN(calories) || (calories != null && (calories < 0 || calories > 10000))) return fail({ variants: `Calories ${i + 1} must be a whole number, or empty.` });
    variants.push({ nameEn: names[i]?.trim() ?? "", nameAr: namesAr[i]?.trim() ?? "", priceHalalas: price, calories, sortOrder: i });
  }
  if (!variants.length) return fail({ variants: "Add at least one price." });

  let imageUrl: string | null | undefined;
  let cutoutUrl: string | null | undefined;
  const existing = id ? await db().menuItem.findUnique({ where: { id } }) : null;
  try {
    const photo = file(fd, "photo");
    const cut = file(fd, "cutout");
    if (photo) imageUrl = await storeImage(photo, "menu");
    if (cut) cutoutUrl = await storeImage(cut, "menu", true);
  } catch (e) {
    return fail({ photo: (e as Error).message }, (e as Error).message);
  }
  if (bool(fd, "removePhoto")) imageUrl = null;
  if (bool(fd, "removeCutout")) cutoutUrl = null;

  const data = {
    ...parsed.data,
    isAvailable: bool(fd, "isAvailable"),
    isActive: bool(fd, "isActive"),
    isFeatured: bool(fd, "isFeatured"),
    isPopular: bool(fd, "isPopular"),
    cutoutWhole: bool(fd, "cutoutWhole"),
    ...(imageUrl !== undefined ? { imageUrl } : {}),
    ...(cutoutUrl !== undefined ? { cutoutUrl } : {}),
  };

  if (existing) {
    await db().$transaction([
      db().menuItem.update({ where: { id }, data }),
      db().menuVariant.deleteMany({ where: { itemId: id } }),
      db().menuVariant.createMany({ data: variants.map((v) => ({ ...v, itemId: id })) }),
    ]);
    if (imageUrl !== undefined && existing.imageUrl !== imageUrl) await removeStoredImage(existing.imageUrl);
    if (cutoutUrl !== undefined && existing.cutoutUrl !== cutoutUrl) await removeStoredImage(existing.cutoutUrl);
  } else {
    let slug = slugify(parsed.data.nameEn);
    if (await db().menuItem.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    await db().menuItem.create({ data: { ...data, slug, source: "Added in admin", variants: { create: variants } } });
  }
  updateTag(TAGS.menu);
  refresh();
  if (!existing) redirect("/admin/menu?saved=1");
  return { ok: true, message: "Saved. The website is updated." };
}

export async function toggleMenuFlag(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const flag = str(fd, "flag");
  if (!["isAvailable", "isFeatured", "isPopular", "isActive"].includes(flag)) return;
  const item = await db().menuItem.findUniqueOrThrow({ where: { id } });
  await db().menuItem.update({ where: { id }, data: { [flag]: !item[flag as "isAvailable"] } });
  updateTag(TAGS.menu);
  refresh();
}

export async function deleteMenuItem(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const item = await db().menuItem.delete({ where: { id } });
  await removeStoredImage(item.imageUrl);
  await removeStoredImage(item.cutoutUrl);
  updateTag(TAGS.menu);
  refresh();
  redirect("/admin/menu?deleted=1");
}

/* ------------------------------------------------------------------ categories */

export async function saveCategory(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const nameEn = str(fd, "nameEn");
  const nameAr = str(fd, "nameAr");
  if (!nameEn) return fail({ nameEn: "Required" });
  const data = {
    nameEn,
    nameAr,
    descriptionEn: str(fd, "descriptionEn") || null,
    descriptionAr: str(fd, "descriptionAr") || null,
    sortOrder: Number(str(fd, "sortOrder") || 0) || 0,
    isActive: bool(fd, "isActive"),
  };
  if (id) await db().category.update({ where: { id }, data });
  else {
    let slug = slugify(nameEn);
    if (await db().category.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    await db().category.create({ data: { ...data, slug } });
  }
  updateTag(TAGS.menu);
  refresh();
  return { ok: true, message: id ? "Category saved." : "Category added." };
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const count = await db().menuItem.count({ where: { categoryId: id } });
  if (count > 0) redirect("/admin/categories?error=not-empty");
  await db().category.delete({ where: { id } });
  updateTag(TAGS.menu);
  refresh();
  redirect("/admin/categories?deleted=1");
}

/* ------------------------------------------------------------------ settings */

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function saveSettings(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const errors: Record<string, string> = {};
  const phone = normalisePhone(str(fd, "phone"));
  const whatsapp = normalisePhone(str(fd, "whatsapp"));
  if (!phone) errors.phone = "Enter a valid phone number, e.g. +966 56 671 5786.";
  if (!whatsapp) errors.whatsapp = "Enter a valid WhatsApp number, e.g. +966 56 671 5786.";
  const email = str(fd, "email");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email or leave empty.";
  for (const k of ["nameEn", "nameAr", "addressEn", "addressAr", "mapsUrl", "mapsEmbedQuery"]) if (!str(fd, k)) errors[k] = "Required";
  if (str(fd, "mapsUrl") && !/^https:\/\//.test(str(fd, "mapsUrl"))) errors.mapsUrl = "Must start with https://";

  const hours: DayHours[] = [];
  for (let d = 0; d < 7; d++) {
    const open = str(fd, `open-${d}`);
    const close = str(fd, `close-${d}`);
    const closed = bool(fd, `closed-${d}`);
    if (!closed && (!TIME.test(open) || !TIME.test(close))) errors[`hours-${d}`] = "Use 24-hour times like 06:00 and 01:00.";
    hours.push({ day: d, open: open || "00:00", close: close || "00:00", closed });
  }
  const socials: Record<string, string> = {};
  for (const k of ["facebook", "instagram", "tiktok", "snapchat", "x"]) {
    const v = str(fd, `social-${k}`);
    if (v && !/^https:\/\//.test(v)) errors[`social-${k}`] = "Paste the full link starting with https://";
    socials[k] = v;
  }
  const fee = riyalsToHalalas(str(fd, "deliveryFee"));
  if (Number.isNaN(fee)) errors.deliveryFee = "A number like 15 or 15.50, or empty if not fixed.";
  const rating = str(fd, "googleRating");
  const ratingNum = rating === "" ? null : Number(rating);
  if (ratingNum != null && (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5)) errors.googleRating = "Between 1 and 5, or empty.";
  const count = intOrNull(str(fd, "googleReviewCount"));
  if (Number.isNaN(count)) errors.googleReviewCount = "A whole number, or empty.";
  if (Object.keys(errors).length) return fail(errors);

  const data = {
    nameEn: str(fd, "nameEn"),
    nameAr: str(fd, "nameAr"),
    phone: phone!,
    whatsapp: whatsapp!.replace("+", ""),
    email: email || null,
    addressEn: str(fd, "addressEn"),
    addressAr: str(fd, "addressAr"),
    mapsUrl: str(fd, "mapsUrl"),
    mapsEmbedQuery: str(fd, "mapsEmbedQuery"),
    hours,
    socials,
    takeawayEnabled: bool(fd, "takeawayEnabled"),
    deliveryEnabled: bool(fd, "deliveryEnabled"),
    deliveryFeeHalalas: fee,
    deliveryNoteEn: str(fd, "deliveryNoteEn"),
    deliveryNoteAr: str(fd, "deliveryNoteAr"),
    buffetEnabled: bool(fd, "buffetEnabled"),
    googleRating: ratingNum,
    googleReviewCount: count,
    ratingCheckedOn: str(fd, "ratingCheckedOn") || null,
    unconfirmed: fd.getAll("unconfirmed").map(String),
  };
  await db().siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  updateTag(TAGS.settings);
  refresh();
  return { ok: true, message: "Restaurant details saved. The website is updated." };
}

/* ------------------------------------------------------------------ content */

export async function saveContent(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const keys = fd.getAll("key").map(String);
  await db().$transaction(
    keys.map((key) =>
      db().contentBlock.update({
        where: { key },
        data: { en: str(fd, `en:${key}`).slice(0, 4000), ar: str(fd, `ar:${key}`).slice(0, 4000) },
      }),
    ),
  );
  updateTag(TAGS.content);
  refresh();
  return { ok: true, message: `Saved ${keys.length} text blocks. The website is updated.` };
}

/* ------------------------------------------------------------------ catering packages */

export async function savePackage(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  if (!str(fd, "nameEn")) return fail({ nameEn: "Required" });
  const price = riyalsToHalalas(str(fd, "price"));
  if (Number.isNaN(price)) return fail({ price: "A number like 1500, or empty." });
  const min = intOrNull(str(fd, "minGuests"));
  if (Number.isNaN(min)) return fail({ minGuests: "A whole number, or empty." });
  let imageUrl: string | undefined;
  try {
    const img = file(fd, "image");
    if (img) imageUrl = await storeImage(img, "catering");
  } catch (e) {
    return fail({ image: (e as Error).message });
  }
  const data = {
    nameEn: str(fd, "nameEn"),
    nameAr: str(fd, "nameAr"),
    descriptionEn: str(fd, "descriptionEn"),
    descriptionAr: str(fd, "descriptionAr"),
    includesEn: str(fd, "includesEn"),
    includesAr: str(fd, "includesAr"),
    priceHalalas: price,
    priceNoteEn: str(fd, "priceNoteEn"),
    priceNoteAr: str(fd, "priceNoteAr"),
    minGuests: min,
    sortOrder: Number(str(fd, "sortOrder") || 0) || 0,
    isActive: bool(fd, "isActive"),
    ...(imageUrl ? { imageUrl } : {}),
  };
  if (id) await db().cateringPackage.update({ where: { id }, data });
  else await db().cateringPackage.create({ data });
  updateTag(TAGS.catering);
  refresh();
  return { ok: true, message: "Package saved." };
}

export async function deletePackage(fd: FormData) {
  await requireAdmin();
  const p = await db().cateringPackage.delete({ where: { id: str(fd, "id") } });
  await removeStoredImage(p.imageUrl);
  updateTag(TAGS.catering);
  refresh();
  redirect("/admin/catering?deleted=1");
}

/* ------------------------------------------------------------------ reviews */

export async function saveReview(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const author = str(fd, "author");
  // Review text is stored exactly as typed (verbatim), only trimmed at the ends.
  const text = String(fd.get("text") ?? "").trim();
  if (!author || !text) return fail({ ...(author ? {} : { author: "Required" }), ...(text ? {} : { text: "Required" }) });
  const rating = intOrNull(str(fd, "rating"));
  if (rating !== null && (Number.isNaN(rating) || rating < 1 || rating > 5)) return fail({ rating: "1 to 5, or empty." });
  const data = {
    author,
    text: text.slice(0, 3000),
    rating,
    source: str(fd, "source") || "Google",
    dateText: str(fd, "dateText") || null,
    lang: str(fd, "lang") === "ar" ? "ar" : "en",
    sortOrder: Number(str(fd, "sortOrder") || 0) || 0,
    isActive: bool(fd, "isActive"),
  };
  if (id) await db().review.update({ where: { id }, data });
  else await db().review.create({ data });
  updateTag(TAGS.reviews);
  refresh();
  return { ok: true, message: "Review saved." };
}

export async function deleteReview(fd: FormData) {
  await requireAdmin();
  await db().review.delete({ where: { id: str(fd, "id") } });
  updateTag(TAGS.reviews);
  refresh();
  redirect("/admin/reviews?deleted=1");
}

/* ------------------------------------------------------------------ gallery */

export async function addGalleryImage(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const img = file(fd, "image");
  if (!img) return fail({ image: "Choose an image." });
  if (!str(fd, "altEn")) return fail({ altEn: "Describe the photo (for screen readers and Google)." });
  let url: string;
  try {
    url = await storeImage(img, "gallery");
  } catch (e) {
    return fail({ image: (e as Error).message });
  }
  const last = await db().galleryImage.aggregate({ _max: { sortOrder: true } });
  await db().galleryImage.create({ data: { url, altEn: str(fd, "altEn"), altAr: str(fd, "altAr") || str(fd, "altEn"), sortOrder: (last._max.sortOrder ?? 0) + 1 } });
  updateTag(TAGS.gallery);
  refresh();
  return { ok: true, message: "Photo added to the gallery." };
}

export async function updateGalleryImage(fd: FormData) {
  await requireAdmin();
  await db().galleryImage.update({
    where: { id: str(fd, "id") },
    data: { altEn: str(fd, "altEn"), altAr: str(fd, "altAr"), sortOrder: Number(str(fd, "sortOrder") || 0) || 0, isActive: bool(fd, "isActive") },
  });
  updateTag(TAGS.gallery);
  refresh();
}

export async function deleteGalleryImage(fd: FormData) {
  await requireAdmin();
  const g = await db().galleryImage.delete({ where: { id: str(fd, "id") } });
  await removeStoredImage(g.url);
  updateTag(TAGS.gallery);
  refresh();
}

/* ------------------------------------------------------------------ enquiries */

export async function updateEnquiry(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status");
  await db().enquiry.update({
    where: { id: str(fd, "id") },
    data: {
      ...(["NEW", "CONTACTED", "CLOSED"].includes(status) ? { status: status as "NEW" | "CONTACTED" | "CLOSED" } : {}),
      ...(fd.has("notes") ? { notes: str(fd, "notes").slice(0, 4000) } : {}),
    },
  });
  refresh();
}

export async function deleteEnquiry(fd: FormData) {
  await requireAdmin("OWNER");
  await db().enquiry.delete({ where: { id: str(fd, "id") } });
  redirect("/admin/enquiries?deleted=1");
}

/* ------------------------------------------------------------------ users (owner only) */

export async function createUser(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("OWNER");
  const email = str(fd, "email").toLowerCase();
  const name = str(fd, "name");
  const password = String(fd.get("password") ?? "");
  const role = str(fd, "role") === "OWNER" ? "OWNER" : "EDITOR";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail({ email: "Enter a valid email." });
  if (!name) return fail({ name: "Required" });
  const problem = passwordProblem(password);
  if (problem) return fail({ password: problem });
  if (await db().adminUser.findUnique({ where: { email } })) return fail({ email: "An account with this email already exists." });
  await db().adminUser.create({ data: { email, name, role, passwordHash: await hashPassword(password) } });
  refresh();
  return { ok: true, message: `Account created for ${email}. Share the password with them privately.` };
}

export async function setUserActive(fd: FormData) {
  const me = await requireAdmin("OWNER");
  const id = str(fd, "id");
  if (id === me.id) redirect("/admin/users?error=self");
  const active = bool(fd, "active");
  if (!active) {
    const owners = await db().adminUser.count({ where: { role: "OWNER", isActive: true, NOT: { id } } });
    const target = await db().adminUser.findUniqueOrThrow({ where: { id } });
    if (target.role === "OWNER" && owners === 0) redirect("/admin/users?error=last-owner");
  }
  await db().adminUser.update({ where: { id }, data: { isActive: active, sessionVersion: { increment: 1 } } });
  redirect("/admin/users");
}

export async function resetUserPassword(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin("OWNER");
  const password = String(fd.get("password") ?? "");
  const problem = passwordProblem(password);
  if (problem) return fail({ password: problem });
  await db().adminUser.update({ where: { id: str(fd, "id") }, data: { passwordHash: await hashPassword(password), sessionVersion: { increment: 1 } } });
  return { ok: true, message: "Password reset. Their other sessions were signed out." };
}
