import Link from "next/link";
import { lang } from "next/root-params";
import { href, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PageHero } from "@/components/site/PageHero";

export default async function NotFound() {
  const l = await lang().catch(() => "en");
  const locale = isLocale(l) ? l : "en";
  const dict = getDictionary(locale);
  return (
    <div className="pb-16">
      <PageHero eyebrow="404" title={dict.common.notFoundTitle} text={dict.common.notFoundText} image="/images/menu/mutton-dum-biryani.webp" compact>
        <div className="flex flex-wrap gap-3">
          <Link href={href(locale)} className="btn btn-sand action">
            {dict.common.backHome}
          </Link>
          <Link href={href(locale, "/menu")} className="btn btn-ghost action">
            {dict.common.viewMenu}
          </Link>
        </div>
      </PageHero>
    </div>
  );
}
