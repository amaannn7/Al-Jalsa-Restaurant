"use client";

import { memo, useEffect, useRef } from "react";

export type TabItem = { slug: string; name: string; disabled?: boolean };

/**
 * Category tabs. The menu shows one category at a time: a tab selects it (no long scrolling, no
 * scroll-spy). The strip never moves a tab that is already fully visible, so quick taps land where
 * the finger aims; a tab cut off at the edge is nudged into view.
 */
export const MenuTabs = memo(function MenuTabs({
  tabs,
  active,
  onSelect,
  label,
}: {
  tabs: TabItem[];
  active: string;
  onSelect: (slug: string) => void;
  label: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const tab = strip?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!strip || !tab) return;
    const t = tab.getBoundingClientRect();
    const c = strip.getBoundingClientRect();
    if (t.left >= c.left - 1 && t.right <= c.right + 1) return;
    const partly = t.right > c.left && t.left < c.right;
    const delta = partly ? (t.left < c.left ? t.left - c.left - 12 : t.right - c.right + 12) : t.left + t.width / 2 - (c.left + c.width / 2);
    strip.scrollBy({ left: delta, behavior: "smooth" });
  }, [active]);

  return (
    <div ref={stripRef} className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto" role="tablist" aria-label={label}>
      {tabs.map((s) => {
        const on = active === s.slug;
        return (
          <button
            key={s.slug}
            type="button"
            role="tab"
            aria-selected={on}
            aria-controls="menu-results"
            data-tab={s.slug}
            disabled={!!s.disabled}
            onClick={() => onSelect(s.slug)}
            className={`action h-11 shrink-0 touch-manipulation whitespace-nowrap rounded-full px-4 transition-colors disabled:opacity-30 ${on ? "bg-ink text-white" : "text-ink-3 hover:bg-linen"}`}
          >
            {s.name}
          </button>
        );
      })}
    </div>
  );
});
