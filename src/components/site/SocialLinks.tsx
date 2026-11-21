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
export function SocialLinks({ socials, label, className = "" }: { socials: Socials; label: string; className?: string }) {
  const items = META.filter((m) => socials[m.key]?.startsWith("http"));
  if (!items.length) return <span className="diamond" aria-hidden />;
  return (
    <ul className={`flex items-center gap-2 ${className}`} aria-label={label}>
      {items.map(({ key, name, Icon }) => (
        <li key={key}>
          <a
            href={socials[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            className="grid h-10 w-10 place-items-center rounded-full text-ivory transition-colors hover:bg-ivory hover:text-ink"
          >
            <Icon size={18} />
          </a>
        </li>
      ))}
    </ul>
  );
}
