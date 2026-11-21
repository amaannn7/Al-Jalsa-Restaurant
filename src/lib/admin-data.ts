import "server-only";
import { db } from "./db";
import { settingsDefaults } from "@/content/settings-defaults";
import type { DayHours, SiteSettingsData, Socials } from "./types";

/** Uncached settings read for the admin (always shows the latest saved values). */
export async function getSettingsFresh(): Promise<SiteSettingsData> {
  const s = await db().siteSettings.findUnique({ where: { id: 1 } });
  if (!s) return settingsDefaults;
  const { id: _id, updatedAt: _u, hours, socials, ...rest } = s;
  // (rest includes buffetEnabled and the other plain fields)
  void _id;
  void _u;
  return {
    ...rest,
    hours: (hours as unknown as DayHours[]) ?? settingsDefaults.hours,
    socials: { ...settingsDefaults.socials, ...((socials as unknown as Partial<Socials>) ?? {}) },
  };
}
