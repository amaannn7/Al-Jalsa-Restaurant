"use server";

import { headers } from "next/headers";
import { db, hasDatabase } from "@/lib/db";
import { getMenu, getSettings } from "@/lib/data";
import { cateringSchema, contactSchema, fieldErrors, meetingSchema, orderSchema } from "@/lib/validation";
import { buildOrderMessage, type OrderLine } from "@/lib/whatsapp";
import { isLocale, type Locale } from "@/i18n/config";
import type { EnquiryType } from "@/generated/prisma/enums";

type Result = { ok: true; saved: boolean } | { ok: false; errors: Record<string, string> };

/* Very small abuse guard: at most 8 enquiries per IP per 10 minutes (stored in the database). */
async function tooMany(type: EnquiryType): Promise<boolean> {
  if (!hasDatabase) return false;
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const key = `enquiry:${ip}`;
  const since = new Date(Date.now() - 10 * 60 * 1000);
  const recent = await db().loginAttempt.count({ where: { key, createdAt: { gte: since } } });
  await db().loginAttempt.create({ data: { key, success: true } });
  void type;
  return recent >= 8;
}

async function save(type: EnquiryType, locale: Locale, name: string, phone: string, email: string | null, payload: object, message: string) {
  if (!hasDatabase) return false;
  try {
    await db().enquiry.create({ data: { type, locale, name, phone, email, payload, message } });
    return true;
  } catch (e) {
    console.error("enquiry save failed", e);
    return false;
  }
}

/**
 * The WhatsApp message itself is built and opened in the browser so it is never blocked by a
 * slow request. These actions validate again on the server and keep a copy for the admin inbox.
 */
export async function logCatering(input: unknown, message: string, locale: string): Promise<Result> {
  const parsed = cateringSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (await tooMany("CATERING")) return { ok: true, saved: false };
  const { website: _hp, ...data } = parsed.data;
  void _hp;
  const saved = await save("CATERING", isLocale(locale) ? locale : "en", data.name, data.phone, data.email || null, data, String(message).slice(0, 5000));
  return { ok: true, saved };
}

export async function logMeeting(input: unknown, message: string, locale: string): Promise<Result> {
  const parsed = meetingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (await tooMany("MEETING")) return { ok: true, saved: false };
  const { website: _hp, ...data } = parsed.data;
  void _hp;
  const saved = await save("MEETING", isLocale(locale) ? locale : "en", data.name, data.phone, data.email || null, data, String(message).slice(0, 5000));
  return { ok: true, saved };
}

export async function logContact(input: unknown, message: string, locale: string): Promise<Result> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (await tooMany("CONTACT")) return { ok: true, saved: false };
  const { website: _hp, ...data } = parsed.data;
  void _hp;
  const saved = await save("CONTACT", isLocale(locale) ? locale : "en", data.name, data.phone, null, data, String(message).slice(0, 5000));
  return { ok: true, saved };
}

/**
 * Orders are re-priced on the server from the live menu, so the saved copy always reflects
 * real prices even if someone edits the page in their browser.
 */
export async function logOrder(input: unknown, locale: string): Promise<Result & { message?: string }> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const loc: Locale = isLocale(locale) ? locale : "en";
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);
  const index = new Map(menu.flatMap((c) => c.items.flatMap((i) => i.variants.map((v) => [`${i.id}::${v.id}`, { i, v }] as const))));
  const lines: OrderLine[] = [];
  for (const l of parsed.data.lines) {
    const hit = index.get(`${l.itemId}::${l.variantId}`);
    if (!hit || !hit.i.isAvailable) return { ok: false, errors: { lines: "unavailable" } };
    lines.push({
      nameEn: hit.i.nameEn,
      nameAr: hit.i.nameAr,
      variantEn: hit.i.variants.length > 1 ? hit.v.nameEn : "",
      variantAr: hit.i.variants.length > 1 ? hit.v.nameAr : "",
      unitHalalas: hit.v.priceHalalas,
      quantity: l.quantity,
      note: l.note,
    });
  }
  if (parsed.data.fulfilment === "delivery" && !settings.deliveryEnabled) return { ok: false, errors: { fulfilment: "required" } };
  if (parsed.data.fulfilment === "takeaway" && !settings.takeawayEnabled) return { ok: false, errors: { fulfilment: "required" } };
  const message = buildOrderMessage({
    locale: loc,
    restaurantName: loc === "ar" ? settings.nameAr : settings.nameEn,
    name: parsed.data.name,
    phone: parsed.data.phone,
    fulfilment: parsed.data.fulfilment,
    address: parsed.data.address,
    notes: parsed.data.notes,
    lines,
    deliveryFeeHalalas: settings.deliveryFeeHalalas,
  });
  if (await tooMany("ORDER")) return { ok: true, saved: false, message };
  const saved = await save("ORDER", loc, parsed.data.name, parsed.data.phone, null, { ...parsed.data, lines }, message);
  return { ok: true, saved, message };
}
