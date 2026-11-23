import Image from "next/image";
import type { GalleryImageData } from "@/lib/types";

/**
 * Bento grid of rounded photos. Layouts are fixed per count so there are never empty cells:
 * 5 or more photos fill a 4 x 2 grid (one large square), fewer fall back to an even row.
 */
export function Gallery({ images, locale }: { images: GalleryImageData[]; locale: "en" | "ar" }) {
  const bento = images.length >= 5;
  const list = images.slice(0, bento ? 5 : 4);
  if (!list.length) return null;
  return (
    <div className={`mt-12 grid gap-3 sm:gap-4 ${bento ? "grid-cols-2 md:grid-cols-4 md:grid-rows-2" : ["grid-cols-1", "grid-cols-2", "grid-cols-2 md:grid-cols-3", "grid-cols-2 md:grid-cols-4"][list.length - 1]}`}>
      {list.map((g, i) => {
        const big = bento && i === 0;
        return (
          <figure
            key={g.id}
            data-reveal="photo"
            className={`relative overflow-hidden rounded-[22px] bg-stone ${big ? "col-span-2 aspect-square md:row-span-2 md:aspect-auto" : "aspect-square"}`}
          >
            <Image
              src={g.url}
              alt={locale === "ar" ? g.altAr : g.altEn}
              fill
              sizes={big ? "(max-width: 768px) 92vw, 620px" : "(max-width: 768px) 46vw, 300px"}
              quality={85}
              className="object-cover"
            />
          </figure>
        );
      })}
    </div>
  );
}
