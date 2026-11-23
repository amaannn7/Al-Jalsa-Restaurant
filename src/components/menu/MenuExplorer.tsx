"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { CategoryData, MenuItemData } from "@/lib/types";
import { formatCalories, formatPrice, lowestPrice } from "@/lib/money";
import { useCart } from "@/store/cart";
import { IconCheck, IconClose, IconCutlery, IconPlus, IconSearch } from "@/components/ui/Icons";
import { ItemSheet } from "./ItemSheet";

type Section = { slug: string; name: string; description: string; items: MenuItemData[] };

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

/** Each kind of section gets its own structure, so the long menu does not repeat one card shape. */
const LIST_SECTIONS = new Set(["rice", "bread", "desserts", "beverages", "mojitos"]);
function layoutFor(slug: string): "spotlight" | "list" | "cards" {
  if (slug === "featured" || slug === "popular") return "spotlight";
  return LIST_SECTIONS.has(slug) ? "list" : "cards";
}

export function MenuExplorer({ locale, dict, menu, note }: { locale: Locale; dict: Dictionary; menu: CategoryData[]; note?: string }) {
  const reduce = useReducedMotion();
  const cart = useCart();
  const root = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
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
    }));
    const all = menu.flatMap((c) => c.items);
    const featured = all.filter((i) => i.isFeatured);
    const popular = all.filter((i) => i.isPopular);
    const extra: Section[] = [];
    if (popular.length) extra.push({ slug: "popular", name: dict.menu.popular, description: "", items: popular });
    if (featured.length) extra.push({ slug: "featured", name: dict.menu.featured, description: "", items: featured });
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

  // While a tapped tab is scrolling the page to its section, the highlight stays on that tab.
  const lockRef = useRef<string | null>(null);
  const unlockTimer = useRef<number | undefined>(undefined);

  /** Where the tool bar's bottom edge sits once it is stuck (sticky top + its height). */
  const barBottom = useCallback(() => {
    const sticky = tabsRef.current?.closest<HTMLElement>("[data-menu-tools]");
    const top = sticky ? parseFloat(getComputedStyle(sticky).top) : NaN;
    return sticky && Number.isFinite(top) ? top + sticky.offsetHeight : 170;
  }, []);

  // Scroll-spy: the current section is the last one whose top has passed under the tool bar
  // (the last section once the page bottom is reached). One rAF-throttled scroll listener.
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-menu-section]")];
    if (!els.length) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      if (lockRef.current) return;
      const line = barBottom() + 32;
      let cur = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = els[els.length - 1].id;
      setActive(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [filtered, barBottom]);

  // Keep the active tab in view inside the horizontal tab bar.
  useEffect(() => {
    // Scroll only the tab bar (scrollIntoView would also cancel the page's smooth scroll on the way
    // to a section). Works in both directions because it measures on-screen positions.
    const bar = tabsRef.current;
    const tab = bar?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!bar || !tab) return;
    const t = tab.getBoundingClientRect();
    const c = bar.getBoundingClientRect();
    bar.scrollBy({ left: t.left + t.width / 2 - (c.left + c.width / 2), behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  // Arriving with #slug (e.g. from a home category): highlight that tab from the first frame and
  // place the section exactly under the tool bar in the same frame, so there is no visible second jump.
  useLayoutEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash || !document.getElementById(hash)) return;
    lockRef.current = hash; // the scroll-spy leaves the highlight alone; jump() sets it next frame
    const raf = requestAnimationFrame(() => jump(hash, true));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function jump(slug: string, instant = false) {
    const el = document.getElementById(slug);
    if (!el) return;
    setActive(slug);
    lockRef.current = slug;
    const target = el.getBoundingClientRect().top + window.scrollY - barBottom() - 16;
    // Far sections jump instantly (a long smooth scroll is a blur on phones); near ones glide.
    const far = Math.abs(target - window.scrollY) > window.innerHeight * 2;
    window.scrollTo({ top: target, behavior: instant || reduce || far ? "auto" : "smooth" });
    history.replaceState(null, "", `#${slug}`);
    // Release the highlight lock once scrolling has been quiet for a moment.
    const release = () => {
      window.clearTimeout(unlockTimer.current);
      unlockTimer.current = window.setTimeout(() => {
        lockRef.current = null;
        window.removeEventListener("scroll", release);
      }, 200);
    };
    window.addEventListener("scroll", release, { passive: true });
    release();
  }


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
      {/* Sticky tools: pill category tabs and search in one solid white bar. On phones and tablets the
          search box opens from a button at the end of the tab row, so the bar stays one row high. */}
      <div data-menu-tools className="sticky top-[5.5rem] z-30 mt-4 px-3 sm:px-4 lg:top-[6.25rem] [html[data-menu-open]_&]:hidden">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 rounded-[26px] bg-card p-1.5 shadow-[0_10px_30px_rgb(22_18_15/0.10)] ring-1 ring-hair sm:p-2 lg:flex-row lg:items-center lg:rounded-full">
          <div className="flex min-w-0 flex-1 items-center gap-1">
          <div ref={tabsRef} className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto" role="tablist" aria-label={dict.menu.categories}>
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
                  className={`action h-11 shrink-0 whitespace-nowrap rounded-full px-4 transition-colors disabled:opacity-30 ${on ? "bg-ink text-white" : "text-ink-3 hover:bg-linen"}`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                window.setTimeout(() => searchRef.current?.focus(), 50);
              }}
              aria-expanded={searchOpen || !!query}
              aria-controls="menu-search-box"
              aria-label={dict.menu.searchLabel}
              className={`icon-btn shrink-0 lg:hidden ${searchOpen || query ? "bg-ink text-white" : "bg-linen text-ink"}`}
            >
              <IconSearch size={18} />
            </button>
          </div>
          <div id="menu-search-box" className={`relative w-full lg:block lg:w-[280px] ${searchOpen || query ? "block" : "hidden"}`}>
            <label htmlFor="menu-search" className="sr-only">
              {dict.menu.searchLabel}
            </label>
            <IconSearch size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              ref={searchRef}
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.menu.searchPlaceholder}
              className="input !min-h-11 !rounded-full !border-transparent !bg-linen !ps-11 !pe-10"
              autoComplete="off"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="absolute end-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink" aria-label={dict.menu.clearSearch}>
                <IconClose size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {q ? `${resultCount} ${dict.menu.dishes}` : ""}
      </p>

      <div className="mx-auto max-w-[var(--container-site)] px-5 pb-24 sm:px-8">
        {q && !filtered.length ? (
          <div className="py-32 text-center">
            <p className="font-dish text-2xl">{dict.menu.noResults}</p>
            <button type="button" onClick={() => setQuery("")} className="btn btn-outline action mt-6">
              {dict.menu.clearSearch}
            </button>
          </div>
        ) : null}

        {note ? <p className="mx-auto mt-12 max-w-2xl text-center text-muted">{note}</p> : null}

        {filtered.map((s, si) => (
          <section key={s.slug} id={s.slug} data-menu-section aria-labelledby={`${s.slug}-title`} className="scroll-mt-[10rem] pt-16 lg:scroll-mt-[11rem] lg:pt-24">
            <header className="mb-8 grid items-end gap-4 md:grid-cols-[1fr_auto] md:gap-10">
              <div>
                <p className="eyebrow">
                  {String(si + 1).padStart(2, "0")} · {s.items.length} {dict.menu.dishes}
                </p>
                <h2 id={`${s.slug}-title`} className="font-display text-display mt-3 text-ink">
                  {s.name}
                </h2>
              </div>
              {s.description ? <p className="max-w-[44ch] text-muted md:text-end">{s.description}</p> : null}
            </header>

            {layoutFor(s.slug) === "spotlight" ? (
              /* Featured / Popular: tall photo cards with the details over the photo */
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {s.items.map((item, ii) => {
                  const low = lowestPrice(item.variants);
                  const added = flash === item.id;
                  const count = inCart.get(item.id) ?? 0;
                  return (
                    <li key={item.id} className="group relative aspect-[3/4] overflow-hidden rounded-[22px] bg-ink-2 text-white">
                      <button type="button" onClick={() => setSheet(item)} className="zoom-on-hover absolute inset-0 block" aria-label={`${dict.menu.details}: ${name(item)}`}>
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt="" fill sizes="(max-width: 1024px) 46vw, 300px" quality={85} loading={si === 0 && ii < 4 ? "eager" : "lazy"} className="object-cover" />
                        ) : null}
                        <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" aria-hidden />
                      </button>
                      {count > 0 ? (
                        <span className="action pointer-events-none absolute start-3 top-3 grid h-8 min-w-8 place-items-center rounded-full bg-white px-2 text-ink" aria-label={`${count} ${dict.cart.items}`}>
                          {count}
                        </span>
                      ) : null}
                      <span className="pointer-events-none absolute end-3 top-3 rounded-full bg-black/45 px-3 py-1.5 text-sm font-medium text-white backdrop-blur">
                        {low == null ? dict.common.priceOnRequest : `${item.variants.length > 1 ? `${dict.common.from} ` : ""}${formatPrice(low, locale)}`}
                      </span>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <h3 className="font-dish text-[1.15rem] leading-tight sm:text-[1.4rem]">{name(item)}</h3>
                        <p className="mt-1.5 line-clamp-2 text-sm text-white/75 max-sm:hidden">{locale === "ar" && item.descriptionAr ? item.descriptionAr : item.descriptionEn}</p>
                        {item.isAvailable ? (
                          <button
                            type="button"
                            onClick={() => quickAdd(item)}
                            className={`btn action pointer-events-auto mt-3 !min-h-10 !px-3.5 sm:mt-4 ${added ? "bg-white text-ink" : "btn-sand"}`}
                            aria-label={`${dict.menu.add}: ${name(item)}`}
                          >
                            {added ? <IconCheck size={16} /> : <IconPlus size={16} />}
                            <span>{added ? dict.menu.added : dict.menu.add}</span>
                          </button>
                        ) : (
                          <p className="mt-3 text-sm text-white/70">{dict.common.unavailable}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : layoutFor(s.slug) === "list" ? (
              /* Rice, bread, desserts, drinks: a printed-menu style list with dotted leaders */
              <ul className="card grid px-4 py-2 sm:px-8 md:grid-cols-2 md:gap-x-12 md:py-4">
                {s.items.map((item) => {
                  const low = lowestPrice(item.variants);
                  const added = flash === item.id;
                  const count = inCart.get(item.id) ?? 0;
                  const sizes = item.variants.length > 1 ? item.variants.map((v) => `${name(v)} ${v.priceHalalas != null ? formatPrice(v.priceHalalas, locale) : ""}`.trim()).join(" · ") : "";
                  const priceText = low == null ? dict.common.priceOnRequest : `${item.variants.length > 1 ? `${dict.common.from} ` : ""}${formatPrice(low, locale)}`;
                  const cal = formatCalories(item.variants.map((v) => v.calories), locale);
                  return (
                    <li key={item.id} className="flex items-center gap-4 border-b border-hair py-4 last:border-b-0 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                      <button
                        type="button"
                        onClick={() => setSheet(item)}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-stone sm:h-[72px] sm:w-[72px]"
                        aria-label={`${dict.menu.details}: ${name(item)}`}
                      >
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt="" fill sizes="72px" quality={80} className="object-cover transition-transform duration-500 hover:scale-105" />
                        ) : (
                          <span className="absolute inset-0 grid place-items-center text-ink/25">
                            <IconCutlery size={22} />
                          </span>
                        )}
                        {count > 0 ? (
                          <span className="absolute inset-x-0 bottom-0 bg-ink/80 text-center text-[0.75rem] font-medium text-white" aria-label={`${count} ${dict.cart.items}`}>
                            ×{count}
                          </span>
                        ) : null}
                      </button>
                      <div className="min-w-0 flex-1">
                        {/* Phones: the name wraps and the price sits on its own line below.
                            Wider screens: name, dotted leader, price on one line (printed-menu style). */}
                        <div className="flex items-baseline gap-2">
                          <h3 className="font-dish min-w-0 text-[1.1rem] leading-tight text-ink sm:max-w-[70%] sm:text-[1.2rem]">
                            <button type="button" onClick={() => setSheet(item)} className="py-1 text-start hover:text-bronze">
                              {name(item)}
                            </button>
                          </h3>
                          <span className="hidden min-w-4 flex-1 -translate-y-1 border-b border-dotted border-muted/50 sm:block" aria-hidden />
                          <span className="hidden shrink-0 font-medium text-ink sm:inline">{priceText}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[0.875rem] text-muted">{locale === "ar" && item.descriptionAr ? item.descriptionAr : item.descriptionEn}</p>
                        {sizes || cal ? <p className="mt-0.5 text-[0.8125rem] text-muted">{[sizes, cal].filter(Boolean).join(" · ")}</p> : null}
                        <p className="mt-1.5 font-medium text-ink sm:hidden">{priceText}</p>
                      </div>
                      {item.isAvailable ? (
                        <button
                          type="button"
                          onClick={() => quickAdd(item)}
                          className={`icon-btn shrink-0 transition-colors ${added ? "bg-sand text-ink" : "bg-ink text-white hover:bg-ink-3"}`}
                          aria-label={`${dict.menu.add}: ${name(item)}`}
                        >
                          {added ? <IconCheck size={17} /> : <IconPlus size={17} />}
                        </button>
                      ) : (
                        <span className="meta shrink-0">{dict.common.unavailable}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {s.items.map((item, ii) => {
                const low = lowestPrice(item.variants);
                const added = flash === item.id;
                const count = inCart.get(item.id) ?? 0;
                const sizes = item.variants.length > 1 ? item.variants.map((v) => name(v)).join(" / ") : "";
                const cal = formatCalories(item.variants.map((v) => v.calories), locale);
                return (
                  <li key={item.id} className="card group relative grid grid-cols-[112px_1fr] gap-4 p-2.5 sm:flex sm:flex-col sm:gap-0">
                    <button
                      type="button"
                      onClick={() => setSheet(item)}
                      className="zoom-on-hover relative block aspect-square overflow-hidden rounded-[16px] bg-stone sm:aspect-[4/3] sm:rounded-[18px]"
                      aria-label={`${dict.menu.details}: ${name(item)}`}
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 112px, (max-width: 1024px) 46vw, 300px"
                          quality={85}
                          loading={si === 0 && ii < 4 ? "eager" : "lazy"}
                          className="object-cover"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-ink/25">
                          <IconCutlery size={34} />
                        </span>
                      )}
                      {count > 0 ? (
                        <span className="action absolute start-2 top-2 grid h-8 min-w-8 place-items-center rounded-full bg-ink px-2 text-white" aria-label={`${count} ${dict.cart.items}`}>
                          {count}
                        </span>
                      ) : null}
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col py-1 pe-1 sm:px-2.5 sm:pb-2 sm:pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-dish text-[1.1rem] leading-tight text-ink sm:text-[1.25rem]">
                          <button type="button" onClick={() => setSheet(item)} className="py-1.5 text-start hover:underline hover:decoration-hair hover:underline-offset-4">
                            {name(item)}
                          </button>
                        </h3>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[0.9rem] leading-snug text-muted">{locale === "ar" && item.descriptionAr ? item.descriptionAr : item.descriptionEn}</p>
                      {sizes || cal ? <p className="mt-1.5 text-[0.8125rem] text-muted">{[sizes, cal].filter(Boolean).join(" · ")}</p> : null}
                      <div className="mt-auto flex items-center justify-between gap-3 pt-3 sm:pt-4">
                        <p className="font-medium text-ink">
                          {low == null ? dict.common.priceOnRequest : `${item.variants.length > 1 ? `${dict.common.from} ` : ""}${formatPrice(low, locale)}`}
                        </p>
                        {item.isAvailable ? (
                          <button
                            type="button"
                            onClick={() => quickAdd(item)}
                            className={`btn action !min-h-10 shrink-0 !px-3.5 ${added ? "btn-sand" : "btn-dark"}`}
                            aria-label={`${dict.menu.add}: ${name(item)}`}
                          >
                            {added ? <IconCheck size={16} /> : <IconPlus size={16} />}
                            <span>{added ? dict.menu.added : dict.menu.add}</span>
                          </button>
                        ) : (
                          <span className="meta shrink-0">{dict.common.unavailable}</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            )}
          </section>
        ))}
      </div>

      <ItemSheet locale={locale} dict={dict} item={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
