import type { Locale } from "@/i18n/config";
import type { DayHours } from "./types";

export const TIMEZONE = "Asia/Riyadh";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

/** "06:00" -> "6 AM", "13:30" -> "1:30 PM"; Arabic uses ص / م. */
export function formatTime(hhmm: string, locale: Locale): string {
  const [h, m] = hhmm.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const mins = m ? `:${String(m).padStart(2, "0")}` : "";
  if (locale === "ar") return `${hour12}${mins} ${h < 12 ? "ص" : "م"}`;
  return `${hour12}${mins} ${h < 12 ? "AM" : "PM"}`;
}

export function formatRange(d: DayHours, locale: Locale, closedLabel: string): string {
  if (d.closed) return closedLabel;
  const sep = locale === "ar" ? " إلى " : " to ";
  return `${formatTime(d.open, locale)}${sep}${formatTime(d.close, locale)}`;
}

/** Week ordered Saturday first (the local week), grouped where consecutive days share hours. */
export function groupHours(
  hours: DayHours[],
  dayNames: string[],
  locale: Locale,
  closedLabel: string,
): { days: string; range: string }[] {
  const order = [6, 0, 1, 2, 3, 4, 5];
  const byDay = new Map(hours.map((h) => [h.day, h]));
  const groups: { from: number; to: number; range: string }[] = [];
  for (const day of order) {
    const h = byDay.get(day);
    const range = h ? formatRange(h, locale, closedLabel) : closedLabel;
    const last = groups[groups.length - 1];
    if (last && last.range === range) last.to = day;
    else groups.push({ from: day, to: day, range });
  }
  const sep = locale === "ar" ? " إلى " : " to ";
  return groups.map((g) => ({
    days: g.from === g.to ? dayNames[g.from] : `${dayNames[g.from]}${sep}${dayNames[g.to]}`,
    range: g.range,
  }));
}

/** Day of week (0 = Sunday) and minutes since midnight in Riyadh for a given instant. */
export function riyadhClock(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

/**
 * Open-now check that understands closing after midnight (06:00 to 01:00 means open until 1 AM
 * the next morning, which counts as the previous day's opening).
 */
export function isOpenAt(hours: DayHours[], now: Date): boolean {
  const { day, minutes } = riyadhClock(now);
  const byDay = new Map(hours.map((h) => [h.day, h]));
  const today = byDay.get(day);
  if (today && !today.closed) {
    const o = toMinutes(today.open);
    const c = toMinutes(today.close);
    if (c > o ? minutes >= o && minutes < c : minutes >= o) return true;
  }
  const yesterday = byDay.get((day + 6) % 7);
  if (yesterday && !yesterday.closed) {
    const o = toMinutes(yesterday.open);
    const c = toMinutes(yesterday.close);
    if (c <= o && minutes < c) return true;
  }
  return false;
}
