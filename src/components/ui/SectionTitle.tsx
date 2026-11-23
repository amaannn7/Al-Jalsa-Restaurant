import type { ReactNode } from "react";

/** Section heading: small bronze label, serif title, optional text; an action can sit at the end. */
export function SectionTitle({
  title,
  eyebrow,
  text,
  as: Tag = "h2",
  align = "start",
  id,
  action,
  className = "",
  tone = "light",
}: {
  title: string;
  eyebrow?: string;
  text?: string;
  as?: "h1" | "h2";
  align?: "center" | "start";
  id?: string;
  action?: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  const center = align === "center";
  return (
    <div className={`flex flex-col gap-6 ${center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"} ${className}`}>
      <div className={center ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? (
          <p data-reveal className={`eyebrow mb-4 ${tone === "dark" ? "!text-sand" : ""}`}>
            {eyebrow}
          </p>
        ) : null}
        <Tag data-reveal id={id} className={`font-display text-display [text-wrap:balance] ${tone === "dark" ? "text-white" : "text-ink"}`}>
          {title}
        </Tag>
        {text ? (
          <p data-reveal className={`mt-4 max-w-[52ch] text-lg ${center ? "mx-auto" : ""} ${tone === "dark" ? "text-white/75" : "text-muted"}`}>
            {text}
          </p>
        ) : null}
      </div>
      {action ? <div data-reveal className="shrink-0">{action}</div> : null}
    </div>
  );
}
