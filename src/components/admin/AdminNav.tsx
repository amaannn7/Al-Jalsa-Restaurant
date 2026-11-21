"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
            className={`block shrink-0 whitespace-nowrap rounded-sm px-3 py-2 text-[0.9375rem] transition-colors ${on ? "bg-gold/15 text-gold" : "text-sand hover:bg-ivory/5 hover:text-ivory"}`}
          >
            {l.label}
          </Link>
        );
      })}
      <Link href="/admin/account" className="block shrink-0 whitespace-nowrap rounded-sm px-3 py-2 text-[0.9375rem] text-sand lg:hidden">
        Account
      </Link>
    </nav>
  );
}
