import type { Metadata } from "next";
import { Suspense } from "react";
import "../globals.css";
import { arabicFonts, latinFonts } from "../fonts";
import { AdminChrome } from "@/components/admin/AdminChrome";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Al Jalsa Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" dir="ltr" className={`${latinFonts} ${arabicFonts} bg-ink`}>
      <body className="theme-dark min-h-dvh bg-ink text-ivory">
        <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Loading...</div>}>
          <AdminChrome>{children}</AdminChrome>
        </Suspense>
      </body>
    </html>
  );
}
