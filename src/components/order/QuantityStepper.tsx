"use client";

import { IconMinus, IconPlus } from "@/components/ui/Icons";

export function QuantityStepper({
  value,
  onChange,
  labels,
  min = 0,
  max = 50,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  labels: { decrease: string; increase: string; quantity: string };
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  return (
    <div className="inline-flex items-center rounded-full border border-line" role="group" aria-label={labels.quantity}>
      <button
        type="button"
        className={`${box} grid place-items-center rounded-full text-ivory transition-colors hover:bg-ivory/10 disabled:opacity-40`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={labels.decrease}
      >
        <IconMinus size={16} />
      </button>
      <output className="min-w-8 text-center tabular-nums" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={`${box} grid place-items-center rounded-full text-ivory transition-colors hover:bg-ivory/10 disabled:opacity-40`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={labels.increase}
      >
        <IconPlus size={16} />
      </button>
    </div>
  );
}
