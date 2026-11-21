import Image from "next/image";
import type { MenuItemData } from "@/lib/types";

/**
 * A dish seen from above. Uses the background-removed plate when it is whole; otherwise the
 * original square photo cropped to a circle; otherwise a typographic tile (never a fake photo).
 */
export function Plate({
  item,
  name,
  sizes,
  priority = false,
  dust = 0,
  className = "",
  imgClassName = "",
  preferPhoto = false,
}: {
  item: Pick<MenuItemData, "slug" | "imageUrl" | "cutoutUrl" | "cutoutWhole" | "nameEn">;
  name: string;
  sizes: string;
  priority?: boolean;
  dust?: 0 | 1 | 2 | 3;
  className?: string;
  imgClassName?: string;
  preferPhoto?: boolean;
}) {
  const cutout = !preferPhoto && item.cutoutWhole && item.cutoutUrl ? item.cutoutUrl : null;
  return (
    <div className={`relative aspect-square ${className}`}>
      {dust ? (
        <Image
          src={`/images/texture/dust-${dust}.webp`}
          alt=""
          fill
          sizes={sizes}
          className="pointer-events-none scale-[1.45] object-contain opacity-90"
          data-dust
        />
      ) : null}
      {cutout ? (
        <Image
          src={cutout}
          alt={name}
          fill
          sizes={sizes}
          preload={priority}
          quality={85}
          className={`plate-shadow object-contain ${imgClassName}`}
          data-plate
        />
      ) : item.imageUrl ? (
        <div className={`plate-shadow absolute inset-[4%] overflow-hidden rounded-full ring-1 ring-ivory/10 ${imgClassName}`} data-plate>
          <Image src={item.imageUrl} alt={name} fill sizes={sizes} preload={priority} quality={85} className="scale-110 object-cover" />
        </div>
      ) : (
        <div
          className={`absolute inset-[6%] grid place-items-center rounded-full border border-gold/40 bg-ink-2 p-[12%] text-center ${imgClassName}`}
          data-plate
          role="img"
          aria-label={name}
        >
          <span className="font-dish text-[clamp(0.9rem,2.2vw,1.35rem)] leading-tight text-gold-soft">{name}</span>
        </div>
      )}
    </div>
  );
}
