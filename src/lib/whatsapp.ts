import type { Locale } from "@/i18n/config";
import { formatPrice } from "./money";
import { waDigits } from "./phone";

export function waLink(number: string, text?: string): string {
  const base = `https://wa.me/${waDigits(number)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export type OrderLine = {
  nameEn: string;
  nameAr: string;
  variantEn: string;
  variantAr: string;
  unitHalalas: number | null;
  quantity: number;
  note: string;
};

export type OrderInput = {
  locale: Locale;
  restaurantName: string;
  name: string;
  phone: string;
  fulfilment: "takeaway" | "delivery";
  address?: string;
  notes?: string;
  lines: OrderLine[];
  /** null when the delivery fee is not confirmed */
  deliveryFeeHalalas: number | null;
};

export type OrderTotals = {
  subtotal: number;
  hasUnpriced: boolean;
  delivery: number | null;
  total: number | null;
};

export function orderTotals(
  lines: Pick<OrderLine, "unitHalalas" | "quantity">[],
  fulfilment: "takeaway" | "delivery",
  deliveryFeeHalalas: number | null,
): OrderTotals {
  let subtotal = 0;
  let hasUnpriced = false;
  for (const l of lines) {
    if (l.unitHalalas == null) hasUnpriced = true;
    else subtotal += l.unitHalalas * l.quantity;
  }
  const delivery = fulfilment === "takeaway" ? 0 : deliveryFeeHalalas;
  const total = hasUnpriced || delivery == null ? null : subtotal + delivery;
  return { subtotal, hasUnpriced, delivery, total };
}

const L = {
  en: {
    order: "New order",
    via: "sent from the website",
    name: "Name",
    phone: "Phone",
    type: "Order type",
    takeaway: "Takeaway",
    delivery: "Delivery",
    address: "Delivery address",
    items: "Items",
    note: "Note",
    subtotal: "Subtotal",
    deliveryFee: "Delivery charge",
    tbc: "to be confirmed by the restaurant",
    total: "Total",
    totalTbc: "Total: to be confirmed by the restaurant",
    priceOnRequest: "price on request",
    notes: "Notes",
    confirm: "Please confirm availability, the final total and payment.",
  },
  ar: {
    order: "طلب جديد",
    via: "من الموقع الإلكتروني",
    name: "الاسم",
    phone: "الجوال",
    type: "نوع الطلب",
    takeaway: "استلام من المطعم",
    delivery: "توصيل",
    address: "عنوان التوصيل",
    items: "الأصناف",
    note: "ملاحظة",
    subtotal: "المجموع الفرعي",
    deliveryFee: "رسوم التوصيل",
    tbc: "يحددها المطعم",
    total: "الإجمالي",
    totalTbc: "الإجمالي: يحدده المطعم",
    priceOnRequest: "السعر عند الطلب",
    notes: "ملاحظات",
    confirm: "يرجى تأكيد توفر الأطباق والمبلغ النهائي وطريقة الدفع.",
  },
};

/** Builds the WhatsApp order text. Item names always include English so the kitchen can read them. */
export function buildOrderMessage(o: OrderInput): string {
  const l = L[o.locale];
  const totals = orderTotals(o.lines, o.fulfilment, o.deliveryFeeHalalas);
  const out: string[] = [];
  out.push(`*${l.order}: ${o.restaurantName}* (${l.via})`, "");
  out.push(`${l.name}: ${o.name.trim()}`);
  out.push(`${l.phone}: ${o.phone}`);
  out.push(`${l.type}: ${o.fulfilment === "delivery" ? l.delivery : l.takeaway}`);
  if (o.fulfilment === "delivery" && o.address?.trim()) out.push(`${l.address}: ${o.address.trim()}`);
  out.push("", `*${l.items}*`);
  o.lines.forEach((line, n) => {
    const variantEn = line.variantEn ? ` (${line.variantEn})` : "";
    const nameEn = `${line.nameEn}${variantEn}`;
    const nameAr = line.nameAr ? `${line.nameAr}${line.variantAr ? ` (${line.variantAr})` : ""}` : "";
    const name = o.locale === "ar" && nameAr ? `${nameAr} / ${nameEn}` : nameEn;
    const price =
      line.unitHalalas == null
        ? l.priceOnRequest
        : `${line.quantity} x ${formatPrice(line.unitHalalas, o.locale)} = ${formatPrice(line.unitHalalas * line.quantity, o.locale)}`;
    out.push(`${n + 1}. ${name}`);
    out.push(`   ${price}`);
    if (line.note.trim()) out.push(`   ${l.note}: ${line.note.trim()}`);
  });
  out.push("");
  out.push(`${l.subtotal}: ${formatPrice(totals.subtotal, o.locale)}${totals.hasUnpriced ? ` + ${l.priceOnRequest}` : ""}`);
  if (o.fulfilment === "delivery") {
    out.push(`${l.deliveryFee}: ${totals.delivery == null ? l.tbc : formatPrice(totals.delivery, o.locale)}`);
  }
  out.push(totals.total == null ? l.totalTbc : `*${l.total}: ${formatPrice(totals.total, o.locale)}*`);
  if (o.notes?.trim()) out.push("", `${l.notes}: ${o.notes.trim()}`);
  out.push("", l.confirm);
  return out.join("\n");
}

/** Generic enquiry text: a title, then label/value pairs, skipping empty values. */
export function buildEnquiryMessage(
  title: string,
  fields: [label: string, value: string | number | null | undefined][],
  footer?: string,
): string {
  const out = [`*${title}*`, ""];
  for (const [label, value] of fields) {
    if (value == null) continue;
    const v = String(value).trim();
    if (!v) continue;
    out.push(v.includes("\n") ? `${label}:\n${v}` : `${label}: ${v}`);
  }
  if (footer) out.push("", footer);
  return out.join("\n");
}
