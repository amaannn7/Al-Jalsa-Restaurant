"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { CategoryData, MenuItemData } from "@/lib/types";
import { formatCalories, formatPrice, lowestPrice } from "@/lib/money";
import { useCart } from "@/store/cart";
import { dirSign, gsap, MQ, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { getLenis } from "@/components/motion/scroll-lock";
import { Plate } from "@/components/ui/Plate";
import { IconCheck, IconClose, IconInfo, IconPlus, IconSearch } from "@/components/ui/Icons";
import { ItemSheet } from "./ItemSheet";

type Section = { slug: string; name: string; description: string; items: MenuItemData[]; thumb: MenuItemData | undefined };

/** Normalises text for search: lower case, Arabic letter variants folded, diacritics removed. */
function fold(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[̀-ͯ]/g, "");
}

export function MenuExplorer({ locale, dict, menu, note }: { locale: Locale; dict: Dictionary; menu: CategoryData[]; note?: string }) {
  const reduce = useReducedMotion();
  const cart = useCart();
  const root = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const [active, setActive] = useState<string>("");
  const [sheet, setSheet] = useState<MenuItemData | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const name = useCallback((x: { nameEn: string; nameAr: string }) => (locale === "ar" && x.nameAr ? x.nameAr : x.nameEn), [locale]);

  const sections: Section[] = useMemo(() => {
    const base = menu.map((c) => ({
      slug: c.slug,
      name: name(c),
      description: (locale === "ar" ? c.descriptionAr : c.descriptionEn) ?? "",
      items: c.items,
      thumb: c.items.find((i) => i.cutoutWhole && i.isFeatured) ?? c.items.find((i) => i.cutoutWhole) ?? c.items.find((i) => i.imageUrl),
    }));
    const all = menu.flatMap((c) => c.items);
    const featured = all.filter((i) => i.isFeatured);
    const popular = all.filter((i) => i.isPopular);
    const extra: Section[] = [];
    if (popular.length) extra.push({ slug: "popular", name: dict.menu.popular, description: "", items: popular, thumb: popular.find((i) => i.cutoutWhole) ?? popular[0] });
    if (featured.length) extra.push({ slug: "featured", name: dict.menu.featured, description: "", items: featured, thumb: featured.find((i) => i.cutoutWhole) ?? featured[0] });
    return [...extra, ...base];
  }, [menu, locale, name, dict.menu.featured, dict.menu.popular]);

  const q = fold(deferred.trim());
  const filtered = useMemo(() => {
    if (!q) return sections;
    // While searching, show each dish once (skip the Featured/Popular duplicates).
    return sections
      .filter((s) => s.slug !== "featured" && s.slug !== "popular")
      .map((s) => ({
        ...s,
        items: s.items.filter((i) => fold(`${i.nameEn} ${i.nameAr} ${i.descriptionEn} ${i.descriptionAr} ${s.name}`).includes(q)),
      }))
      .filter((s) => s.items.length);
  }, [sections, q]);
  const resultCount = filtered.reduce((n, s) => n + s.items.length, 0);

  // Scroll-spy for the category tabs.
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-menu-section]")];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered]);

  // Keep the active tab in view inside the horizontal tab bar.
  useEffect(() => {
    const tab = tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    tab?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  // Open the right section when arriving with #slug.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    const t = window.setTimeout(() => jump(hash), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function jump(slug: string) {
    const el = document.getElementById(slug);
    if (!el) return;
    const offset = -(tabsRef.current?.getBoundingClientRect().height ?? 0) - 90;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.2 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", `#${slug}`);
  }

  // Plates turn gently as the tiles cross the screen (scroll-linked, desktop and mobile).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>("[data-tile-plate]", root.current).forEach((el, i) => {
          const dir = (i % 2 ? 1 : -1) * dirSign();
          gsap.fromTo(el, { rotate: -14 * dir }, { rotate: 14 * dir, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });
        gsap.utils.toArray<HTMLElement>("[data-section-plate]", root.current).forEach((el) => {
          gsap.fromTo(el, { rotate: -60 * dirSign(), scale: 0.8 }, { rotate: 0, scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "center 40%", scrub: 0.6 } });
        });
      });
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: root, dependencies: [filtered], revertOnUpdate: true },
  );

  const quickAdd = (item: MenuItemData) => {
    if (item.variants.length !== 1) return setSheet(item);
    const v = item.variants[0];
    cart.add({
      itemId: item.id,
      variantId: v.id,
      slug: item.slug,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      variantEn: "",
      variantAr: "",
      unitHalalas: v.priceHalalas,
      note: "",
      image: item.imageUrl ?? item.cutoutUrl,
    });
    setFlash(item.id);
    window.setTimeout(() => setFlash((f) => (f === item.id ? null : f)), 1500);
  };

  const inCart = useMemo(() => {
    const m = new Map<string, number>();
    cart.lines.forEach((l) => m.set(l.itemId, (m.get(l.itemId) ?? 0) + l.quantity));
    return m;
  }, [cart.lines]);

  return (
    <div ref={root}>
      {/* Sticky tools: circular category tabs (reference 1) and search */}
      <div className="sticky top-[var(--hdr-offset,var(--hdr-h))] z-30 border-y border-line/70 bg-ink/90 backdrop-blur-md transition-[top] duration-500 ease-[var(--ease-out-expo)] [html[data-menu-open]_&]:hidden">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-8 lg:flex-row lg:items-center lg:gap-8">
          <div ref={tabsRef} className="no-scrollbar -mx-4 flex flex-1 gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label={dict.menu.categories}>
            {sections.map((s) => {
              const on = active === s.slug;
              const disabled = q && !filtered.some((f) => f.slug === s.slug);
              return (
                <button
                  key={s.slug}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  data-tab={s.slug}
                  disabled={!!disabled}
                  onClick={() => jump(s.slug)}
                  className="group flex w-[96px] shrink-0 flex-col items-center gap-1.5 rounded-sm px-1 py-1.5 text-center transition-opacity disabled:opacity-30"
                >
                  <span className={`relative grid h-12 w-12 place-items-center rounded-full border transition-all duration-500 ${on ? "border-gold bg-gold/10" : "border-line group-hover:border-ivory/40"}`}>
                    {s.thumb ? (
                      <span className="relative h-10 w-10 transition-transform duration-700 group-hover:rotate-45">
                        <Image src={s.thumb.cutoutWhole && s.thumb.cutoutUrl ? s.thumb.cutoutUrl : s.thumb.imageUrl ?? ""} alt="" fill sizes="40px" className={s.thumb.cutoutWhole ? "object-contain" : "rounded-full object-cover"} />
                      </span>
                    ) : (
                      <span className="diamond text-gold/70" aria-hidden />
                    )}
                  </span>
                  <span className={`line-clamp-2 min-h-[2lh] text-[0.8125rem] leading-tight transition-colors ${on ? "text-gold" : "text-sand group-hover:text-ivory"}`}>{s.name}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full lg:w-[300px]">
            <label htmlFor="menu-search" className="sr-only">
              {dict.menu.searchLabel}
            </label>
            <IconSearch size={18} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.menu.searchPlaceholder}
              className="input !min-h-11 !ps-10 !pe-10"
              autoComplete="off"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="absolute end-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ivory" aria-label={dict.menu.clearSearch}>
                <IconClose size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {q ? `${resultCount} ${dict.menu.dishes}` : ""}
      </p>

      <div className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-8">
        {q && !filtered.length ? (
          <div className="py-32 text-center">
            <p className="font-dish text-2xl">{dict.menu.noResults}</p>
            <button type="button" onClick={() => setQuery("")} className="btn btn-line action mt-6">
              {dict.menu.clearSearch}
            </button>
          </div>
        ) : null}

        {note ? <p className="mx-auto mt-10 max-w-2xl text-center text-sand">{note}</p> : null}

        {filtered.map((s, si) => (
          <section key={s.slug} id={s.slug} data-menu-section aria-labelledby={`${s.slug}-title`} className="scroll-mt-48 pt-20 lg:pt-28">
            <header className="mb-10 grid items-end gap-6 border-b border-line pb-8 md:grid-cols-[1fr_auto]">
              <div className="flex items-end gap-5">
                {s.thumb && !q ? (
                  <div data-section-plate className="hidden w-24 shrink-0 sm:block lg:w-28">
                    <Plate item={s.thumb} name={name(s.thumb)} sizes="112px" />
                  </div>
                ) : null}
                <div>
                  <p className="eyebrow">
                    {String(si + 1).padStart(2, "0")} · {s.items.length} {dict.menu.dishes}
                  </p>
                  <h2 id={`${s.slug}-title`} className="font-display text-display mt-3 uppercase text-ivory">
                    {s.name}
                  </h2>
                </div>
              </div>
              {s.description ? <p className="max-w-[44ch] text-sand md:text-end">{s.description}</p> : null}
            </header>

            <motion.ul layout={!reduce} className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {s.items.map((item, ii) => {
                  const low = lowestPrice(item.variants);
                  const added = flash === item.id;
                  const count = inCart.get(item.id) ?? 0;
                  const sizes = item.variants.length > 1 ? item.variants.map((v) => name(v)).join(" / ") : "";
                  return (
                    <motion.li
                      key={item.id}
                      layout={!reduce}
                      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={`group relative flex flex-col overflow-hidden border p-5 transition-colors duration-500 ${added ? "border-maroon bg-maroon" : "border-line/80 bg-ink-2/85 hover:border-ivory/25"}`}
                    >
                      {count > 0 ? (
                        <span className="action absolute start-4 top-4 z-10 grid h-9 min-w-9 place-items-center rounded-full border border-gold/70 px-2 text-gold" aria-label={`${count} ${dict.cart.items}`}>
                          {count}
                        </span>
                      ) : null}
                      <button type="button" onClick={() => setSheet(item)} className="absolute end-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full text-sand transition-colors hover:text-gold" aria-label={`${dict.menu.details}: ${name(item)}`}>
                        <IconInfo size={20} />
                      </button>
                      <button type="button" onClick={() => setSheet(item)} className="relative mx-auto mt-2 block w-[78%]" tabIndex={-1} aria-hidden>
                        <div data-tile-plate>
                          <Plate item={item} name={name(item)} priority={si === 0 && ii < 4} sizes="(max-width: 520px) 70vw, (max-width: 1024px) 38vw, 22vw" imgClassName="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.07] group-hover:rotate-12" />
                        </div>
                      </button>
                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-lg ${added ? "text-ivory" : "text-gold"}`}>
                            {low == null ? dict.common.priceOnRequest : `${item.variants.length > 1 ? `${dict.common.from} ` : ""}${formatPrice(low, locale)}`}
                          </p>
                          {sizes ? <p className="meta">{sizes}</p> : null}
                          {formatCalories(item.variants.map((v) => v.calories), locale) ? (
                            <p className="meta">{formatCalories(item.variants.map((v) => v.calories), locale)}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-4">
                        <h3 className="font-dish text-[1.3rem] leading-tight text-ivory">{name(item)}</h3>
                        {item.isAvailable ? (
                          <button
                            type="button"
                            onClick={() => quickAdd(item)}
                            className={`btn action !min-h-10 shrink-0 !px-3.5 ${added ? "btn-gold" : "btn-gold"}`}
                            aria-label={`${dict.menu.add}: ${name(item)}`}
                          >
                            {added ? <IconCheck size={16} /> : <IconPlus size={16} />}
                            <span>{added ? dict.menu.added : dict.menu.add}</span>
                          </button>
                        ) : (
                          <span className="meta shrink-0">{dict.common.unavailable}</span>
                        )}
                      </div>
                      <p className="meta mt-3 line-clamp-2">{locale === "ar" && item.descriptionAr ? item.descriptionAr : item.descriptionEn}</p>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          </section>
        ))}
      </div>

      <ItemSheet locale={locale} dict={dict} item={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
