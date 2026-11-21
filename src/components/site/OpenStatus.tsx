"use client";

import { useEffect, useState } from "react";
import { isOpenAt } from "@/lib/hours";
import type { DayHours } from "@/lib/types";

/** "Open now" / "Closed now", computed in the browser against Riyadh time (never cached). */
export function OpenStatus({ hours, labels }: { hours: DayHours[]; labels: { open: string; closed: string } }) {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const update = () => setOpen(isOpenAt(hours, new Date()));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [hours]);
  if (open === null) return <span className="inline-block h-7" aria-hidden />;
  return (
    <span className={`action inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${open ? "border-ok/50 text-ok" : "border-danger/50 text-danger"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-ok" : "bg-danger"}`} aria-hidden />
      {open ? labels.open : labels.closed}
    </span>
  );
}
