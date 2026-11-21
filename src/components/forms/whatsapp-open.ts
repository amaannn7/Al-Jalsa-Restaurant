"use client";

/** Opens WhatsApp in a new tab; if a popup blocker stops it, continues in the same tab. */
export function openWhatsApp(url: string) {
  const w = window.open(url, "_blank");
  if (!w) window.location.href = url;
  else w.opener = null;
}
