"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { useCart } from "@/store/cart";
import { Logo } from "./Logo";
import { IconBag } from "@/components/ui/Icons";
import { lockScroll } from "@/components/motion/scroll-lock";

export function navLinks(dict: Dictionary) {
  return [
    { path: "/menu", label: dict.nav.menu },
    { path: "/order", label: dict.nav.order },
    { path: "/catering", label: dict.nav.catering },
    { path: "/book-meeting", label: dict.nav.meeting },
    { path: "/about", label: dict.nav.about },
    { path: "/contact", label: dict.nav.contact },
  ];
}

export function switchLocalePath(pathname: string, to: Locale) {
  const parts = pathname.split("/");
  parts[1] = to;
  return parts.join("/") || `/${to}`;
}

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname() || `/${locale}`;
  const { count, open: openCart } = useCart();
  const reduce = useReducedMotion();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const links = navLinks(dict);
  const other: Locale = locale === "ar" ? "en" : "ar";

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 320 && y > last + 4 && !menuOpen);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  // Sticky elements below the header (menu tabs) follow it as it hides and shows.
  useEffect(() => {
    document.documentElement.style.setProperty("--hdr-offset", hidden ? "0px" : "var(--hdr-h)");
  }, [hidden]);

  const closeMenu = useCallback((returnFocus = true) => {
    setMenuOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // Close on route change (adjusting state during render, as React recommends) and on resize to desktop.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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

  const isActive = (path: string) => pathname === `/${locale}${path}` || pathname.startsWith(`/${locale}${path}/`);
  const linkCls = (path: string) =>
    `action relative py-2 text-ivory/85 transition-colors hover:text-ivory after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-[inherit] after:bg-gold after:transition-transform after:duration-500 ${
      isActive(path) ? "text-ivory after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-out-expo)] ${
          solid || menuOpen ? "border-b border-line/70 bg-ink/92 backdrop-blur-md" : "border-b border-transparent"
        } ${hidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="mx-auto grid h-[4.5rem] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:h-20 lg:px-10">
          {/* Start side */}
          <div className="flex items-center gap-7">
            <button
              ref={toggleRef}
              type="button"
              className="action group inline-flex h-11 items-center gap-3 rounded-full border border-ivory/30 px-4 text-ivory transition-colors hover:border-ivory xl:hidden"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="relative block h-3 w-5" aria-hidden>
                <span className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300 ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300 ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
              </span>
              <span className="hidden min-[400px]:inline">{menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}</span>
            </button>
            <nav aria-label={dict.nav.primary} className="hidden items-center gap-7 xl:flex">
              {links.slice(0, 4).map((l) => (
                <Link key={l.path} href={href(locale, l.path)} className={linkCls(l.path)} aria-current={isActive(l.path) ? "page" : undefined}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <Logo locale={locale} size="sm" priority className="justify-self-center max-[380px]:scale-90" />

          {/* End side */}
          <div className="flex items-center justify-end gap-3 sm:gap-5">
            <nav aria-label={locale === "ar" ? "روابط إضافية" : "More pages"} className="hidden items-center gap-7 xl:flex">
              {links.slice(4).map((l) => (
                <Link key={l.path} href={href(locale, l.path)} className={linkCls(l.path)} aria-current={isActive(l.path) ? "page" : undefined}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <Link
              href={switchLocalePath(pathname, other)}
              hrefLang={other}
              lang={other}
              title={dict.nav.languageLabel}
              className={`hidden h-11 items-center px-1 text-ivory/85 transition-colors hover:text-gold sm:inline-flex ${other === "ar" ? "font-[family-name:var(--font-readex)] text-[0.95rem]" : "action"}`}
            >
              {dict.nav.language}
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30 text-ivory transition-colors hover:border-gold hover:text-gold"
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
                    className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.75rem] font-medium leading-none text-ink"
                    aria-hidden
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <Link href={href(locale, "/menu")} className="btn btn-gold action hidden !min-h-11 !px-5 md:inline-flex">
              {dict.nav.orderNow}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile / tablet menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="scrim"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeMenu(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="site-menu"
            ref={panelRef}
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.primary}
            className="stone fixed inset-x-3 top-[5.1rem] z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-sm border border-line p-6 sm:inset-x-6 sm:p-8 xl:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, clipPath: "inset(0 0 100% 0)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent
          >
            <nav aria-label={dict.nav.primary}>
              <ul className="grid gap-1">
                {[{ path: "", label: dict.nav.home }, ...links].map((l, i) => (
                  <motion.li
                    key={l.path}
                    initial={reduce ? false : { opacity: 0, x: locale === "ar" ? 24 : -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.045, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={href(locale, l.path || "/")}
                      onClick={() => closeMenu(false)}
                      aria-current={(l.path ? isActive(l.path) : pathname === `/${locale}`) ? "page" : undefined}
                      className="font-display flex items-center justify-between border-b border-line/60 py-3 text-[1.55rem] uppercase text-ivory transition-colors hover:text-gold aria-[current=page]:text-gold rtl:text-[1.5rem]"
                    >
                      {l.label}
                      <span className="diamond text-gold opacity-0 transition-opacity [[aria-current=page]_&]:opacity-100" aria-hidden />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={href(locale, "/menu")} onClick={() => closeMenu(false)} className="btn btn-gold action flex-1">
                {dict.nav.orderNow}
              </Link>
              <Link
                href={switchLocalePath(pathname, other)}
                hrefLang={other}
                lang={other}
                onClick={() => closeMenu(false)}
                className={`btn btn-line flex-1 ${other === "ar" ? "font-[family-name:var(--font-readex)]" : "action"}`}
              >
                {dict.nav.language}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
