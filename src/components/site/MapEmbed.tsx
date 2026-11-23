import { IconArrowUpRight } from "@/components/ui/Icons";

/**
 * Google Maps embed, always shown. The iframe loads lazily (only when it nears the screen), so it
 * does not slow the top of the page. A small "Open in Google Maps" pill sits on top.
 */
export function MapEmbed({
  query,
  title,
  address,
  openHref,
  openLabel,
  className = "",
}: {
  query: string;
  title: string;
  address: string;
  openHref: string;
  openLabel: string;
  className?: string;
}) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <div className={`relative overflow-hidden bg-stone ${className}`}>
      <iframe
        title={title}
        src={src}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <span className="sr-only">{address}</span>
      <a
        href={openHref}
        target="_blank"
        rel="noopener noreferrer"
        className="action absolute bottom-3 end-3 inline-flex items-center gap-2 min-h-11 rounded-full bg-ink px-4 py-2.5 text-white shadow-lg transition-colors hover:bg-bronze"
      >
        {openLabel} <IconArrowUpRight size={15} />
      </a>
    </div>
  );
}
