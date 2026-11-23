"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/menu", label: "Menu items" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Restaurant details" },
  { href: "/admin/content", label: "Website text" },
  { href: "/admin/catering", label: "Catering packages" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/gallery", label: "Gallery" },
];

export function AdminNav({ role }: { role: "OWNER" | "EDITOR" }) {
  const path = usePathname();
  const links = role === "OWNER" ? [...LINKS, { href: "/admin/users", label: "Admin users" }] : LINKS;
  return (
    <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-0.5 lg:pb-5">
      {links.map((l) => {
        const on = l.href === "/admin" ? path === "/admin" : path?.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? "page" : undefined}
            className={`block shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[0.9375rem] transition-colors lg:rounded-[12px] lg:px-3 ${on ? "bg-gold/15 text-gold" : "text-sand hover:bg-ivory/5 hover:text-ivory"}`}
          >
            {l.label}
          </Link>
        );
      })}
      {/* On phones the sidebar footer is hidden, so these live at the end of the scrolling strip. */}
      <Link href="/admin/account" className="block shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[0.9375rem] text-sand lg:hidden">
        Account
      </Link>
      <a href="/en" target="_blank" rel="noopener" className="block shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[0.9375rem] text-gold lg:hidden">
        View website
      </a>
      <form action={logoutAction} className="shrink-0 lg:hidden">
        <button type="submit" className="block whitespace-nowrap rounded-full px-4 py-2.5 text-[0.9375rem] text-sand">
          Sign out
        </button>
      </form>
    </nav>
  );
}
