import Image from "next/image";
import Link from "next/link";
import { lang } from "next/root-params";
import { href, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function NotFound() {
  const l = await lang().catch(() => "en");
  const locale = isLocale(l) ? l : "en";
  const dict = getDictionary(locale);
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-6 pt-28 text-center">
      <div className="relative h-40 w-32 opacity-60">
        <Image src="/brand/logo-mark-light.png" alt="" fill sizes="128px" className="object-contain" />
      </div>
      <p className="eyebrow mt-8">404</p>
      <h1 className="font-display text-display mt-4 uppercase">{dict.common.notFoundTitle}</h1>
      <p className="mt-5 max-w-md text-sand">{dict.common.notFoundText}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={href(locale)} className="btn btn-gold action">
          {dict.common.backHome}
        </Link>
        <Link href={href(locale, "/menu")} className="btn btn-line action">
          {dict.common.viewMenu}
        </Link>
      </div>
    </section>
  );
}
