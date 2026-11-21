import { z } from "zod";
import { normalisePhone } from "./phone";

/** Shared by the browser (instant feedback) and the server (authoritative check). */

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => z.string().trim().min(1, "required").max(max);
const phone = z
  .string()
  .trim()
  .min(1, "required")
  .transform((v, ctx) => {
    const n = normalisePhone(v);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "phone" });
      return z.NEVER;
    }
    return n;
  });
const email = z
  .string()
  .trim()
  .max(160)
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "email");
const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date");

/** Today's date in Riyadh as YYYY-MM-DD (dates before this are rejected). */
export function riyadhToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
const futureDate = isoDate.refine((v) => v >= riyadhToday(), "date");

export const cateringSchema = z.object({
  name: required(120),
  phone,
  email,
  eventType: required(80),
  eventDate: futureDate,
  eventLocation: required(200),
  guests: z.coerce.number({ message: "guests" }).int("guests").min(1, "guests").max(100000, "guests"),
  quantity: text(500),
  preferred: text(1000),
  budget: text(120),
  requirements: text(2000),
  packageName: text(160),
  website: z.string().max(0).optional(), // honeypot: must stay empty
});

export const meetingSchema = z.object({
  name: required(120),
  phone,
  email,
  date: futureDate,
  time: z.string().trim().regex(/^\d{2}:\d{2}$/, "required"),
  mode: z.enum(["visit", "call", "video"]),
  about: required(2000),
  website: z.string().max(0).optional(),
});

export const contactSchema = z.object({
  name: required(120),
  phone,
  message: required(2000),
  website: z.string().max(0).optional(),
});

export const orderSchema = z.object({
  name: required(120),
  phone,
  fulfilment: z.enum(["takeaway", "delivery"]),
  address: text(400),
  notes: text(1000),
  lines: z
    .array(
      z.object({
        itemId: z.string().min(1).max(60),
        variantId: z.string().min(1).max(60),
        quantity: z.number().int().min(1).max(50),
        note: text(200),
      }),
    )
    .min(1)
    .max(60),
}).refine((o) => o.fulfilment !== "delivery" || o.address.length >= 6, { path: ["address"], message: "required" });

export type CateringInput = z.input<typeof cateringSchema>;
export type MeetingInput = z.input<typeof meetingSchema>;
export type ContactInput = z.input<typeof contactSchema>;
export type OrderInputData = z.input<typeof orderSchema>;

const CODES = new Set(["required", "phone", "email", "date", "guests"]);

/** Flattens zod issues to { field: code }, first issue per field. Codes map to dictionary messages. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = CODES.has(issue.message) ? issue.message : "required";
  }
  return out;
}
