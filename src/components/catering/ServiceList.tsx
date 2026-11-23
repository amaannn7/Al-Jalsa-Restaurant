import Image from "next/image";

type Service = { title: string; text: string; image: string };

/**
 * Catering services as white photo cards. On large screens the first two cards share the top row
 * and the rest share the second, so the grid never leaves an empty cell (2 + 3 for five services).
 */
export function ServiceList({ services }: { services: Service[] }) {
  const top = services.length === 5 ? 2 : 0;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {services.map((s, i) => (
        <li
          key={s.title}
          data-reveal
          style={{ transitionDelay: `${(i % 3) * 70}ms` }}
          className={`card group flex flex-col p-2.5 ${top ? (i < top ? "lg:col-span-3" : "lg:col-span-2") : "lg:col-span-2"} ${services.length % 2 && i === services.length - 1 ? "sm:col-span-2 lg:col-span-2" : ""}`}
        >
          <div className={`zoom-on-hover relative overflow-hidden rounded-[18px] bg-stone ${i < top ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
            <Image src={s.image} alt="" fill sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 600px" quality={85} className="object-cover" />
          </div>
          <div className="px-3 pb-4 pt-5">
            <p className="text-sm font-medium text-bronze tabular-nums">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="font-dish mt-2 text-[1.45rem] leading-tight text-ink">{s.title}</h3>
            <p className="mt-2 text-muted">{s.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
