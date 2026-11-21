"use client";

import { useState } from "react";
import { IconClose, IconPlus } from "@/components/ui/Icons";

type Row = { key: number; nameEn: string; nameAr: string; price: string; calories: string };

/** Sizes and prices. One row with no size name means a single price. Empty price = "price on request". */
export function VariantsEditor({ initial, error }: { initial: { nameEn: string; nameAr: string; priceHalalas: number | null; calories?: number | null }[]; error?: string }) {
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.length ? initial : [{ nameEn: "", nameAr: "", priceHalalas: null, calories: null }]).map((v, i) => ({
      key: i,
      nameEn: v.nameEn,
      nameAr: v.nameAr,
      price: v.priceHalalas == null ? "" : String(v.priceHalalas / 100),
      calories: v.calories == null ? "" : String(v.calories),
    })),
  );
  const update = (key: number, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  return (
    <fieldset className="grid gap-3">
      <legend className="field-label mb-2">Sizes and prices (SAR)</legend>
      {rows.map((r, i) => (
        <div key={r.key} className="grid grid-cols-[1fr_1fr_6.5rem_6.5rem_auto] items-end gap-2">
          <label className="grid gap-1">
            <span className="meta">{i === 0 ? "Size name (English)" : ""}</span>
            <input name="variantNameEn" className="input" placeholder={rows.length > 1 ? "e.g. Small" : "Leave empty for one size"} value={r.nameEn} onChange={(e) => update(r.key, { nameEn: e.target.value })} />
          </label>
          <label className="grid gap-1">
            <span className="meta">{i === 0 ? "Size name (Arabic)" : ""}</span>
            <input name="variantNameAr" dir="rtl" lang="ar" className="input" placeholder={rows.length > 1 ? "مثال: صغير" : ""} value={r.nameAr} onChange={(e) => update(r.key, { nameAr: e.target.value })} />
          </label>
          <label className="grid gap-1">
            <span className="meta">{i === 0 ? "Price" : ""}</span>
            <input name="variantPrice" inputMode="decimal" className="input" placeholder="e.g. 42" value={r.price} onChange={(e) => update(r.key, { price: e.target.value })} />
          </label>
          <label className="grid gap-1">
            <span className="meta">{i === 0 ? "Calories" : ""}</span>
            <input name="variantCalories" inputMode="numeric" className="input" placeholder="e.g. 450" value={r.calories} onChange={(e) => update(r.key, { calories: e.target.value })} />
          </label>
          <button
            type="button"
            onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))}
            disabled={rows.length === 1}
            className="grid h-12 w-12 place-items-center border border-line text-sand hover:text-danger disabled:opacity-30"
            aria-label={`Remove size ${i + 1}`}
          >
            <IconClose size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setRows((x) => [...x, { key: Date.now(), nameEn: "", nameAr: "", price: "", calories: "" }])} className="action inline-flex items-center gap-2 justify-self-start text-gold">
        <IconPlus size={16} /> Add a size
      </button>
      <p className="meta">Leave a price empty only if it is not confirmed; the site then shows &ldquo;Price on request&rdquo;.</p>
      {error ? <p className="field-error">{error}</p> : null}
    </fieldset>
  );
}
