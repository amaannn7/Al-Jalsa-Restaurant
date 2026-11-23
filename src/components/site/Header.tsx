"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { useCart } from "@/store/cart";
import { Logo } from "./Logo";
import { navLinks, switchLocalePath } from "./nav";
import { IconArrow, IconBag, IconClose, IconMenu } from "@/components/ui/Icons";
import { lockScroll } from "@/components/motion/scroll-lock";

/**
 * Sits inside the top of each page's dark hero card; after scrolling it becomes a floating dark
 * pill bar. The circle button opens every page in a full-screen panel (all screen sizes).
 */
export function Header({ locale, dict, contact }: { locale: Locale; dict: Dictionary; contact: { phone: string; phoneLabel: string; address: string; whatsappHref: string } }) {
  const pathname = usePathname() || `/${locale}`;
  const { count, open: openCart } = useCart();
  const reduce = useReducedMotion();
  const [floating, setFloating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const links = navLinks(dict);
  const pills = [{ path: "", label: dict.nav.home }, links[0], links[2], links[4]];
  const other: Locale = locale === "ar" ? "en" : "ar";
  // The language links are plain <a> (full page load): English and Arabic have separate root layouts
  // (lang/dir on <html>), so a client-side transition would only prefetch and then reload anyway.

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback((returnFocus = true) => {
    setMenuOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // Close on route change (adjusting state during render, as React recommends).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Escape to close, focus trap, scroll lock while the menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    document.documentElement.dataset.menuOpen = "true";
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("a,button")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = [toggleRef.current, ...panelRef.current.querySelectorAll<HTMLElement>("a,button")].filter(Boolean) as HTMLElement[];
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    lockScroll(true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      delete document.documentElement.dataset.menuOpen;
    };
  }, [menuOpen, closeMenu]);

  const isActive = (path: string) => (path ? pathname === `/${locale}${path}` || pathname.startsWith(`/${locale}${path}/`) : pathname === `/${locale}`);
  const bar = floating && !menuOpen;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={`pointer-events-auto mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-3 transition-[max-width,background-color,padding,box-shadow,margin] duration-500 ease-[var(--ease-out-expo)] ${
            bar
              ? "mt-1 h-16 max-w-[1180px] rounded-full bg-ink/85 px-2.5 shadow-[0_18px_40px_rgb(0_0_0/0.25)] ring-1 ring-white/10 backdrop-blur-md sm:px-3"
              : "h-[4.75rem] max-w-[1600px] px-3 sm:px-5 lg:px-8"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              ref={toggleRef}
              type="button"
              className={`icon-btn shrink-0 text-white transition-colors ${menuOpen ? "bg-white !text-ink" : "bg-black/50 hover:bg-black/70"} ${bar ? "" : "!h-12 !w-12"}`}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <IconClose size={18} /> : <IconMenu size={20} />}
            </button>
            <nav aria-label={dict.nav.primary} className="hidden items-center gap-1.5 min-[1380px]:flex">
              {pills.map((l) => (
                <Link
                  key={l.path}
                  href={href(locale, l.path || "/")}
                  aria-current={isActive(l.path) ? "page" : undefined}
                  className={`action inline-flex h-11 items-center whitespace-nowrap rounded-full transition-colors ${bar ? "px-4" : "px-5"} ${
                    isActive(l.path) ? "bg-white text-ink" : "border border-white/20 text-white/90 hover:border-white/60 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <Logo locale={locale} size="sm" priority className="justify-self-center max-[360px]:scale-90" />

          <div className="flex items-center justify-end gap-2">
            <a
              href={switchLocalePath(pathname, other)}
              hrefLang={other}
              lang={other}
              title={dict.nav.languageLabel}
              className={`hidden h-11 items-center rounded-full border border-white/20 px-4 text-white/90 transition-colors hover:border-white/60 hover:text-white sm:inline-flex ${other === "ar" ? "font-[family-name:var(--font-readex)] text-[0.95rem]" : "action"}`}
            >
              {dict.nav.language}
            </a>
            <button
              type="button"
              onClick={openCart}
              className="icon-btn relative bg-black/50 text-white hover:bg-black/70"
              aria-label={`${dict.cart.open}${count ? ` (${count})` : ""}`}
            >
              <IconBag size={19} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-sand px-1 text-[0.75rem] font-semibold leading-none text-ink"
                    aria-hidden
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <Link href={href(locale, "/menu")} className="btn btn-dark action hidden !min-h-11 bg-black/80 !px-5 ring-1 ring-white/10 md:inline-flex">
              <IconBag size={17} /> {dict.nav.orderNow}
            </Link>
          </div>
        </div>
      </header>

      {/* Full-screen menu (all pages, all sizes) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-menu"
            ref={panelRef}
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.primary}
            className="fixed inset-0 z-40 overflow-y-auto bg-ink text-white sm:inset-3 sm:rounded-[28px]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0 round 28px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0 0 0% 0 round 28px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0 round 28px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mx-auto grid min-h-full max-w-[1280px] content-start gap-8 px-6 pb-8 pt-24 sm:gap-12 sm:px-10 sm:pt-28 lg:grid-cols-[1.4fr_1fr] lg:gap-20 lg:pt-36">
              <nav aria-label={dict.nav.primary}>
                <ul className="grid">
                  {[{ path: "", label: dict.nav.home }, ...links].map((l, i) => (
                    <motion.li
                      key={l.path}
                      initial={reduce ? false : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={href(locale, l.path || "/")}
                        onClick={() => closeMenu(false)}
                        aria-current={isActive(l.path) ? "page" : undefined}
                        className="group flex items-baseline gap-4 border-b border-white/10 py-2.5 text-white/85 transition-colors hover:text-white aria-[current=page]:text-sand sm:gap-5 sm:py-4"
                      >
                        <span className="meta w-6 shrink-0 !text-white/40 tabular-nums" aria-hidden>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-[clamp(1.5rem,4.4vw,3rem)] leading-tight">{l.label}</span>
                        <IconArrow size={22} className="ms-auto self-center opacity-0 transition-opacity group-hover:opacity-60" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <motion.div
                className="flex flex-col gap-5 sm:gap-8 lg:pt-4"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
              >
                <div>
                  <p className="eyebrow !text-sand">{dict.common.address}</p>
                  <p className="mt-3 max-w-[32ch] text-white/80">{contact.address}</p>
                </div>
                <div>
                  <p className="eyebrow !text-sand">{dict.common.phone}</p>
                  <a href={`tel:${contact.phone}`} dir="ltr" className="mt-3 inline-block text-xl text-white hover:text-sand">
                    {contact.phoneLabel}
                  </a>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={href(locale, "/menu")} onClick={() => closeMenu(false)} className="btn btn-sand action">
                    {dict.nav.orderNow} <IconArrow size={17} />
                  </Link>
                  <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost action">
                    {dict.common.whatsapp}
                  </a>
                  <a
                    href={switchLocalePath(pathname, other)}
                    hrefLang={other}
                    lang={other}
                    onClick={() => closeMenu(false)}
                    className={`btn btn-ghost ${other === "ar" ? "font-[family-name:var(--font-readex)]" : "action"}`}
                  >
                    {dict.nav.language}
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
