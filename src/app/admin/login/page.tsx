import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/admin/LoginForm";

/** Admin pages read the session on every request; they block instead of streaming a shell. */
export const instant = false;

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  return (
    <div className="stone grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-sm">
        <Image src="/brand/logo-full-light.png" alt="Al Jalsa Restaurant" width={240} height={190} className="mx-auto h-auto w-48" preload />
        <div className="mt-10 border border-line bg-ink/85 p-7">
          <h1 className="font-display text-xl uppercase">Admin sign in</h1>
          {sp.changed ? <p className="mt-3 text-ok">Password changed. Please sign in again.</p> : null}
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
