"use client";

import { useSyncExternalStore } from "react";
import { riyadhToday } from "@/lib/validation";

const noop = () => () => {};

/** Today's Riyadh date for date-input minimums, computed in the browser (never at build time). */
export function useToday(): string | undefined {
  return useSyncExternalStore(noop, riyadhToday, () => undefined);
}
