/**
 * Normalises a phone number typed by a customer. Saudi mobiles may be typed as 05XXXXXXXX,
 * 5XXXXXXXX, 9665XXXXXXXX or +966 5X XXX XXXX. Other international numbers are accepted when
 * they start with + or 00 and have 8 to 15 digits.
 * Returns the number in +E.164-like form, or null when it is not valid.
 */
export function normalisePhone(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const hasPlus = raw.startsWith("+") || raw.startsWith("00");
  // Accept Arabic-Indic and Eastern Arabic digits as well as Latin ones.
  let digits = raw
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[^\d]/g, "");
  if (raw.startsWith("00")) digits = digits.slice(2);
  if (/^05\d{8}$/.test(digits)) return `+966${digits.slice(1)}`;
  if (/^5\d{8}$/.test(digits)) return `+966${digits}`;
  if (/^9665\d{8}$/.test(digits)) return `+${digits}`;
  if (hasPlus && /^\d{8,15}$/.test(digits)) return `+${digits}`;
  if (/^\d{10,15}$/.test(digits) && !digits.startsWith("0")) return `+${digits}`;
  return null;
}

/** Digits only, as wa.me expects (no +, no spaces). */
export function waDigits(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

/** "+966566715786" -> "+966 56 671 5786" for display. */
export function displayPhone(phone: string): string {
  const d = waDigits(phone);
  if (/^9665\d{8}$/.test(d)) return `+966 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  return phone.startsWith("+") ? phone : `+${d}`;
}
