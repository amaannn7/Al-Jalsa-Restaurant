import type { Socials } from "@/lib/types";
import { IconFacebook, IconInstagram, IconSnapchat, IconTikTok, IconX } from "@/components/ui/Icons";

const META = [
  { key: "instagram", name: "Instagram", Icon: IconInstagram },
  { key: "facebook", name: "Facebook", Icon: IconFacebook },
  { key: "tiktok", name: "TikTok", Icon: IconTikTok },
  { key: "snapchat", name: "Snapchat", Icon: IconSnapchat },
  { key: "x", name: "X", Icon: IconX },
] as const;

/** Renders only the accounts that are filled in the admin. */
export function SocialLinks({ socials, label, className = "", tone = "dark" }: { socials: Socials; label: string; className?: string; tone?: "dark" | "light" }) {
  const items = META.filter((m) => socials[m.key]?.startsWith("http"));
  if (!items.length) return null;
  return (
    <ul className={`flex items-center gap-2 ${className}`} aria-label={label}>
      {items.map(({ key, name, Icon }) => (
        <li key={key}>
          <a
            href={socials[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            className={`grid h-11 w-11 place-items-center rounded-full border transition-colors ${tone === "dark" ? "border-white/15 text-white hover:bg-white hover:text-ink" : "border-hair text-ink hover:bg-ink hover:text-white"}`}
          >
            <Icon size={18} />
          </a>
        </li>
      ))}
    </ul>
  );
}
