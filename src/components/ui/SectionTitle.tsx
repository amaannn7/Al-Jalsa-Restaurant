import { SplitHeading } from "@/components/motion/SplitHeading";

/**
 * Reference 1's centred title between hairlines, using the logo's diamond.
 * `align="start"` gives a left (or right in Arabic) aligned variant.
 */
export function SectionTitle({
  title,
  eyebrow,
  text,
  as = "h2",
  align = "center",
  id,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  text?: string;
  as?: "h1" | "h2";
  align?: "center" | "start";
  id?: string;
  className?: string;
}) {
  if (align === "start") {
    return (
      <div className={`px-5 sm:px-8 ${className}`}>
        {eyebrow ? (
          <p className="eyebrow mb-5 flex items-center gap-3">
            <span className="diamond" aria-hidden /> {eyebrow}
          </p>
        ) : null}
        <SplitHeading text={title} as={as} id={id} mode="chars" className="font-display text-display uppercase text-ivory" />
        {text ? <p className="measure mt-6 text-sand">{text}</p> : null}
      </div>
    );
  }
  return (
    <div className={`px-5 text-center sm:px-8 ${className}`}>
      {eyebrow ? <p className="eyebrow mb-5">{eyebrow}</p> : null}
      <div className="rule mx-auto max-w-4xl gap-5 sm:gap-8">
        <SplitHeading
          text={title}
          as={as}
          id={id}
          mode="chars"
          className="font-display text-display shrink-0 px-1 uppercase text-ivory"
        />
      </div>
      {text ? <p className="measure mx-auto mt-6 text-sand">{text}</p> : null}
    </div>
  );
}
