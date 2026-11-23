"use client";

import { startTransition, useActionState } from "react";
import {
  addGalleryImage,
  changeOwnPassword,
  createUser,
  resetUserPassword,
  saveCategory,
  saveContent,
  saveMenuItem,
  savePackage,
  saveReview,
  saveSettings,
  type FormState,
} from "@/app/admin/actions";
import { AdminForm, Check, Panel } from "./AdminForm";
import { ImageInput } from "./ImageInput";
import { VariantsEditor } from "./VariantsEditor";
import { SelectField, TextArea, TextField } from "@/components/forms/Field";
import type { DayHours, SiteSettingsData } from "@/lib/types";

const err = (s: FormState, k: string) => s?.errors?.[k];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* ------------------------------------------------------------------ menu item */

export type EditableItem = {
  id?: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  categoryId: string;
  sortOrder: number;
  imageUrl: string | null;
  cutoutUrl: string | null;
  cutoutWhole: boolean;
  isAvailable: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  variants: { nameEn: string; nameAr: string; priceHalalas: number | null; calories: number | null }[];
  source?: string | null;
};

export function MenuItemEditor({ item, categories }: { item: EditableItem; categories: { id: string; nameEn: string }[] }) {
  return (
    <AdminForm action={saveMenuItem} submitLabel={item.id ? "Save dish" : "Add dish"}>
      {(s) => (
        <>
          {item.id ? <input type="hidden" name="id" value={item.id} /> : null}
          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <div className="grid content-start gap-5">
              <Panel title="Name and description">
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField id="nameEn" label="Name (English)" required defaultValue={item.nameEn} error={err(s, "nameEn")} />
                  <TextField id="nameAr" label="Name (Arabic)" dir="rtl" lang="ar" defaultValue={item.nameAr} />
                  <TextArea id="descriptionEn" label="Description (English)" rows={3} defaultValue={item.descriptionEn} />
                  <TextArea id="descriptionAr" label="Description (Arabic)" rows={3} dir="rtl" lang="ar" defaultValue={item.descriptionAr} />
                </div>
              </Panel>
              <Panel title="Prices">
                <VariantsEditor initial={item.variants} error={err(s, "variants")} />
              </Panel>
              <Panel title="Photo" description="A landscape (4:3) photo of the dish works best, at least 2000 px wide. It is shown on the menu card and in the dish details.">
                <ImageInput name="photo" label="Photo" current={item.imageUrl} error={err(s, "photo")} removable removeName="removePhoto" />
              </Panel>
            </div>
            <div className="grid content-start gap-5">
              <Panel title="Placement">
                <SelectField id="categoryId" label="Category" required defaultValue={item.categoryId} placeholder="Choose..." options={categories.map((c) => ({ value: c.id, label: c.nameEn }))} error={err(s, "categoryId")} />
                <TextField id="sortOrder" label="Order within category" type="number" min={0} defaultValue={item.sortOrder} hint="Lower numbers show first." />
              </Panel>
              <Panel title="Visibility">
                <Check name="isActive" label="Show on the website" defaultChecked={item.isActive} />
                <Check name="isAvailable" label="Available to order" hint="Untick to show the dish as currently unavailable." defaultChecked={item.isAvailable} />
                <Check name="isFeatured" label="Featured" hint="Shown in the home page carousel and the Featured tab." defaultChecked={item.isFeatured} />
                <Check name="isPopular" label="Popular" hint="Adds a Popular tab on the menu. Only tick dishes you know are popular." defaultChecked={item.isPopular} />
              </Panel>
              {item.source ? <p className="meta">Source: {item.source}</p> : null}
            </div>
          </div>
        </>
      )}
    </AdminForm>
  );
}

/* ------------------------------------------------------------------ category */

export function CategoryEditor({
  category,
}: {
  category?: { id: string; nameEn: string; nameAr: string; descriptionEn: string | null; descriptionAr: string | null; sortOrder: number; isActive: boolean };
}) {
  return (
    <AdminForm action={saveCategory} submitLabel={category ? "Save category" : "Add category"} resetOnSuccess={!category}>
      {(s) => (
        <>
          {category ? <input type="hidden" name="id" value={category.id} /> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <TextField id="nameEn" label="Name (English)" required defaultValue={category?.nameEn} error={err(s, "nameEn")} />
            <TextField id="nameAr" label="Name (Arabic)" dir="rtl" lang="ar" defaultValue={category?.nameAr} />
            <TextArea id="descriptionEn" label="Short description (English)" rows={2} defaultValue={category?.descriptionEn ?? ""} />
            <TextArea id="descriptionAr" label="Short description (Arabic)" rows={2} dir="rtl" lang="ar" defaultValue={category?.descriptionAr ?? ""} />
            <TextField id="sortOrder" label="Order" type="number" min={0} defaultValue={category?.sortOrder ?? 0} />
            <div className="self-end pb-3">
              <Check name="isActive" label="Show on the website" defaultChecked={category?.isActive ?? true} />
            </div>
          </div>
        </>
      )}
    </AdminForm>
  );
}

/* ------------------------------------------------------------------ settings */

const UNCONFIRMABLE = [
  ["whatsapp", "WhatsApp number"],
  ["phone", "Phone"],
  ["hours", "Opening hours"],
  ["addressEn", "Address"],
  ["socials.facebook", "Facebook link"],
  ["deliveryEnabled", "Delivery offered"],
  ["deliveryFeeHalalas", "Delivery fee"],
  ["email", "Email"],
] as const;

export function SettingsEditor({ s: settings }: { s: SiteSettingsData }) {
  const hours = new Map<number, DayHours>(settings.hours.map((h) => [h.day, h]));
  return (
    <AdminForm action={saveSettings} submitLabel="Save restaurant details">
      {(s) => (
        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title="Name and contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField id="nameEn" label="Restaurant name (English)" required defaultValue={settings.nameEn} error={err(s, "nameEn")} />
              <TextField id="nameAr" label="Restaurant name (Arabic)" required dir="rtl" lang="ar" defaultValue={settings.nameAr} error={err(s, "nameAr")} />
              <TextField id="phone" label="Phone (for calls)" required dir="ltr" defaultValue={settings.phone} error={err(s, "phone")} />
              <TextField id="whatsapp" label="WhatsApp number (orders and enquiries)" required dir="ltr" defaultValue={`+${settings.whatsapp}`} error={err(s, "whatsapp")} hint="All orders and enquiries are sent here." />
              <TextField id="email" label="Email (optional)" type="email" dir="ltr" defaultValue={settings.email ?? ""} error={err(s, "email")} className="sm:col-span-2" />
            </div>
          </Panel>
          <Panel title="Location">
            <TextArea id="addressEn" label="Address (English)" rows={2} required defaultValue={settings.addressEn} error={err(s, "addressEn")} />
            <TextArea id="addressAr" label="Address (Arabic)" rows={2} required dir="rtl" lang="ar" defaultValue={settings.addressAr} error={err(s, "addressAr")} />
            <TextField id="mapsUrl" label="Google Maps link (Get Directions button)" required dir="ltr" defaultValue={settings.mapsUrl} error={err(s, "mapsUrl")} />
            <TextField id="mapsEmbedQuery" label="Map search text (for the embedded map)" required defaultValue={settings.mapsEmbedQuery} error={err(s, "mapsEmbedQuery")} />
          </Panel>
          <Panel title="Opening hours" description="24-hour times. A closing time earlier than the opening time means after midnight (06:00 to 01:00).">
            <div className="grid gap-2">
              {DAYS.map((d, i) => {
                const h = hours.get(i) ?? { day: i, open: "06:00", close: "01:00", closed: false };
                return (
                  <div key={d} className="grid grid-cols-2 items-center gap-2 border-b border-line/60 pb-3 sm:grid-cols-[7rem_1fr_1fr_auto] sm:border-0 sm:pb-0">
                    <span className="order-1 text-sand">{d}</span>
                    <input name={`open-${i}`} type="time" defaultValue={h.open} className="input order-3 !min-h-11 !py-1.5 sm:order-2" aria-label={`${d} opening time`} />
                    <input name={`close-${i}`} type="time" defaultValue={h.close} className="input order-4 !min-h-11 !py-1.5 sm:order-3" aria-label={`${d} closing time`} />
                    <label className="order-2 flex min-h-11 items-center justify-end gap-2 text-[0.9375rem] text-sand sm:order-4 sm:justify-start">
                      <input type="checkbox" name={`closed-${i}`} defaultChecked={h.closed} className="accent-[var(--color-gold)]" /> Closed
                    </label>
                    {err(s, `hours-${i}`) ? <p className="field-error order-5 col-span-2 sm:col-span-4">{err(s, `hours-${i}`)}</p> : null}
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel title="Ordering">
            <Check name="takeawayEnabled" label="Takeaway orders" defaultChecked={settings.takeawayEnabled} />
            <Check name="deliveryEnabled" label="Delivery orders" defaultChecked={settings.deliveryEnabled} />
            <TextField id="deliveryFee" label="Delivery fee in SAR (leave empty if it varies)" inputMode="decimal" defaultValue={settings.deliveryFeeHalalas == null ? "" : String(settings.deliveryFeeHalalas / 100)} error={err(s, "deliveryFee")} hint="When empty, customers see 'confirmed by the restaurant'." />
            <TextField id="deliveryNoteEn" label="Delivery note (English, optional)" defaultValue={settings.deliveryNoteEn} placeholder="e.g. Delivery within Al Murabba only" />
            <TextField id="deliveryNoteAr" label="Delivery note (Arabic, optional)" dir="rtl" lang="ar" defaultValue={settings.deliveryNoteAr} />
          </Panel>
          <Panel title="Lunch buffet">
            <Check name="buffetEnabled" label="Show the lunch buffet section" hint="Days, prices and dishes are edited under Website text > Buffet." defaultChecked={settings.buffetEnabled} />
          </Panel>
          <Panel title="Social media" description="Paste full links. Empty fields are hidden on the site.">
            {(["instagram", "facebook", "tiktok", "snapchat", "x"] as const).map((k) => (
              <TextField key={k} id={`social-${k}`} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} dir="ltr" defaultValue={settings.socials[k]} error={err(s, `social-${k}`)} placeholder="https://" />
            ))}
          </Panel>
          <Panel title="Google rating (optional)" description="Copy these from your Google Business Profile. They are shown with the date you checked them.">
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField id="googleRating" label="Rating (1 to 5)" inputMode="decimal" defaultValue={settings.googleRating ?? ""} error={err(s, "googleRating")} />
              <TextField id="googleReviewCount" label="Number of reviews" inputMode="numeric" defaultValue={settings.googleReviewCount ?? ""} error={err(s, "googleReviewCount")} />
              <TextField id="ratingCheckedOn" label="Checked on" placeholder="e.g. Nov 2026" defaultValue={settings.ratingCheckedOn ?? ""} />
            </div>
          </Panel>
          <Panel title="Still to confirm" description="Ticked items show a reminder on the admin overview. Untick them once checked.">
            <div className="grid gap-3 sm:grid-cols-2">
              {UNCONFIRMABLE.map(([k, label]) => (
                <label key={k} className="flex items-center gap-3 text-sand">
                  <input type="checkbox" name="unconfirmed" value={k} defaultChecked={settings.unconfirmed.includes(k)} className="accent-[var(--color-gold)]" />
                  {label}
                </label>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </AdminForm>
  );
}

/* ------------------------------------------------------------------ content */

export function ContentEditor({ blocks }: { blocks: { key: string; label: string; en: string; ar: string; multiline: boolean }[] }) {
  return (
    <AdminForm action={saveContent} submitLabel="Save text">
      {() => (
        <div className="grid gap-4">
          {blocks.map((b) => (
            <div key={b.key} className="grid gap-3 border-b border-line pb-5 md:grid-cols-2">
              <input type="hidden" name="key" value={b.key} />
              <p className="meta md:col-span-2">
                {b.label} <span className="opacity-60">({b.key})</span>
              </p>
              {b.multiline ? (
                <>
                  <textarea name={`en:${b.key}`} aria-label={`${b.label} English`} defaultValue={b.en} rows={3} className="input" />
                  <textarea name={`ar:${b.key}`} aria-label={`${b.label} Arabic`} defaultValue={b.ar} rows={3} dir="rtl" lang="ar" className="input" />
                </>
              ) : (
                <>
                  <input name={`en:${b.key}`} aria-label={`${b.label} English`} defaultValue={b.en} className="input" />
                  <input name={`ar:${b.key}`} aria-label={`${b.label} Arabic`} defaultValue={b.ar} dir="rtl" lang="ar" className="input" />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminForm>
  );
}

/* ------------------------------------------------------------------ catering package */

export type EditablePackage = {
  id?: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  includesEn: string;
  includesAr: string;
  priceHalalas: number | null;
  priceNoteEn: string;
  priceNoteAr: string;
  minGuests: number | null;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
};

export function PackageEditor({ p }: { p: EditablePackage }) {
  return (
    <AdminForm action={savePackage} submitLabel={p.id ? "Save package" : "Add package"} resetOnSuccess={!p.id}>
      {(s) => (
        <div className="grid gap-4 md:grid-cols-2">
          {p.id ? <input type="hidden" name="id" value={p.id} /> : null}
          <TextField id="nameEn" label="Name (English)" required defaultValue={p.nameEn} error={err(s, "nameEn")} />
          <TextField id="nameAr" label="Name (Arabic)" dir="rtl" lang="ar" defaultValue={p.nameAr} />
          <TextArea id="descriptionEn" label="Description (English)" rows={2} defaultValue={p.descriptionEn} />
          <TextArea id="descriptionAr" label="Description (Arabic)" rows={2} dir="rtl" lang="ar" defaultValue={p.descriptionAr} />
          <TextArea id="includesEn" label="Includes (English, one per line)" rows={4} defaultValue={p.includesEn} />
          <TextArea id="includesAr" label="Includes (Arabic, one per line)" rows={4} dir="rtl" lang="ar" defaultValue={p.includesAr} />
          <TextField id="price" label="Price in SAR (optional)" inputMode="decimal" defaultValue={p.priceHalalas == null ? "" : String(p.priceHalalas / 100)} error={err(s, "price")} />
          <TextField id="minGuests" label="Minimum guests (optional)" inputMode="numeric" defaultValue={p.minGuests ?? ""} error={err(s, "minGuests")} />
          <TextField id="priceNoteEn" label="Price note (English)" placeholder="e.g. per person" defaultValue={p.priceNoteEn} />
          <TextField id="priceNoteAr" label="Price note (Arabic)" dir="rtl" lang="ar" defaultValue={p.priceNoteAr} />
          <TextField id="sortOrder" label="Order" type="number" min={0} defaultValue={p.sortOrder} />
          <div className="self-end pb-3">
            <Check name="isActive" label="Show on the website" defaultChecked={p.isActive} />
          </div>
          <div className="md:col-span-2">
            <ImageInput name="image" label="Image (optional)" current={p.imageUrl} error={err(s, "image")} />
          </div>
        </div>
      )}
    </AdminForm>
  );
}

/* ------------------------------------------------------------------ review */

export type EditableReview = { id?: string; author: string; text: string; rating: number | null; source: string; dateText: string | null; lang: string; sortOrder: number; isActive: boolean };

export function ReviewEditor({ r }: { r: EditableReview }) {
  return (
    <AdminForm action={saveReview} submitLabel={r.id ? "Save review" : "Add review"} resetOnSuccess={!r.id}>
      {(s) => (
        <div className="grid gap-4 md:grid-cols-2">
          {r.id ? <input type="hidden" name="id" value={r.id} /> : null}
          <TextField id="author" label="Reviewer name (as shown on Google)" required defaultValue={r.author} error={err(s, "author")} />
          <SelectField id="lang" label="Language of the review" defaultValue={r.lang} options={[{ value: "en", label: "English" }, { value: "ar", label: "Arabic" }]} />
          <TextArea id="text" label="Review text, copied exactly (do not edit the wording)" required rows={4} className="md:col-span-2" defaultValue={r.text} dir="auto" error={err(s, "text")} />
          <TextField id="rating" label="Stars (1 to 5, optional)" inputMode="numeric" defaultValue={r.rating ?? ""} error={err(s, "rating")} />
          <TextField id="source" label="Source" defaultValue={r.source} />
          <TextField id="dateText" label="Date as shown (optional)" placeholder="e.g. 2 months ago" defaultValue={r.dateText ?? ""} />
          <TextField id="sortOrder" label="Order" type="number" min={0} defaultValue={r.sortOrder} />
          <Check name="isActive" label="Show on the website" defaultChecked={r.isActive} />
        </div>
      )}
    </AdminForm>
  );
}

/* ------------------------------------------------------------------ gallery */

export function GalleryUploader() {
  return (
    <AdminForm action={addGalleryImage} submitLabel="Add photo" resetOnSuccess>
      {(s) => (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <ImageInput name="image" label="Photo" error={err(s, "image")} />
          </div>
          <TextField id="altEn" label="Describe the photo (English)" required error={err(s, "altEn")} placeholder="e.g. Mutton biryani in a copper pot" />
          <TextField id="altAr" label="Describe the photo (Arabic)" dir="rtl" lang="ar" />
        </div>
      )}
    </AdminForm>
  );
}

/* ------------------------------------------------------------------ users and passwords */

export function CreateUserForm() {
  return (
    <AdminForm action={createUser} submitLabel="Create account" resetOnSuccess>
      {(s) => (
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="name" label="Name" required error={err(s, "name")} />
          <TextField id="email" label="Email" type="email" required error={err(s, "email")} autoComplete="off" />
          <TextField id="password" label="Temporary password" type="password" required error={err(s, "password")} autoComplete="new-password" hint="At least 12 characters with letters and a number." />
          <SelectField id="role" label="Role" defaultValue="EDITOR" options={[{ value: "EDITOR", label: "Editor (content, menu, enquiries)" }, { value: "OWNER", label: "Owner (also manages admin users)" }]} />
        </div>
      )}
    </AdminForm>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(resetUserPassword, null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        startTransition(() => action(fd));
        form.reset();
      }}
      className="flex flex-wrap items-start gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <input name="password" type="password" placeholder="New password" aria-label="New password" autoComplete="new-password" className="input !min-h-10 max-w-[14rem] !py-1.5" />
      <button className="btn btn-line action !min-h-10" disabled={pending}>
        Reset
      </button>
      {state?.message ? <p className={`basis-full text-[0.875rem] ${state.ok ? "text-ok" : "text-danger"}`}>{state.errors?.password ?? state.message}</p> : null}
    </form>
  );
}

export function ChangePasswordForm() {
  return (
    <AdminForm action={changeOwnPassword} submitLabel="Change password">
      {(s) => (
        <div className="grid max-w-md gap-4">
          <TextField id="current" label="Current password" type="password" required autoComplete="current-password" error={err(s, "current")} />
          <TextField id="next" label="New password" type="password" required autoComplete="new-password" error={err(s, "next")} hint="At least 12 characters with letters and a number." />
          <TextField id="confirm" label="Repeat new password" type="password" required autoComplete="new-password" error={err(s, "confirm")} />
        </div>
      )}
    </AdminForm>
  );
}
