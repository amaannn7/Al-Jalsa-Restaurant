import { describe, expect, it } from "vitest";
import { formatPrice, lowestPrice } from "../money";
import { formatTime, groupHours, isOpenAt } from "../hours";
import { displayPhone, normalisePhone } from "../phone";
import { buildEnquiryMessage, buildOrderMessage, orderTotals, waLink } from "../whatsapp";
import { settingsDefaults } from "@/content/settings-defaults";

const hours = settingsDefaults.hours;
// Riyadh is UTC+3 all year (no DST).
const riyadh = (iso: string) => new Date(`${iso}+03:00`);

describe("money", () => {
  it("formats whole and fractional riyals", () => {
    expect(formatPrice(4200, "en")).toBe("SAR 42");
    expect(formatPrice(4250, "en")).toBe("SAR 42.50");
    expect(formatPrice(11000, "ar")).toBe("110 ر.س");
    expect(formatPrice(150000, "en")).toBe("SAR 1,500");
  });
  it("finds the lowest priced variant and ignores unpriced ones", () => {
    expect(lowestPrice([{ priceHalalas: 4500 }, { priceHalalas: 2800 }])).toBe(2800);
    expect(lowestPrice([{ priceHalalas: null }])).toBeNull();
  });
});

describe("hours", () => {
  it("formats times", () => {
    expect(formatTime("06:00", "en")).toBe("6 AM");
    expect(formatTime("01:00", "en")).toBe("1 AM");
    expect(formatTime("13:30", "en")).toBe("1:30 PM");
    expect(formatTime("00:00", "ar")).toBe("12 ص");
  });
  it("groups the week Saturday first", () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    expect(groupHours(hours, days, "en", "Closed")).toEqual([
      { days: "Saturday to Wednesday", range: "6 AM to 1 AM" },
      { days: "Thursday to Friday", range: "6 AM to 2 AM" },
    ]);
  });
  it("knows when the restaurant is open, including after midnight", () => {
    expect(isOpenAt(hours, riyadh("2026-11-22T12:00:00"))).toBe(true); // Sunday noon
    expect(isOpenAt(hours, riyadh("2026-11-22T05:59:00"))).toBe(false); // Sunday before opening
    expect(isOpenAt(hours, riyadh("2026-11-23T00:30:00"))).toBe(true); // Monday 00:30, Sunday's late hours
    expect(isOpenAt(hours, riyadh("2026-11-23T01:00:00"))).toBe(false); // closed at 1 AM
    expect(isOpenAt(hours, riyadh("2026-11-27T01:30:00"))).toBe(true); // Friday 01:30, Thursday open to 2 AM
    expect(isOpenAt(hours, riyadh("2026-11-29T01:30:00"))).toBe(false); // Sunday 01:30, Saturday closes at 1 AM
  });
});

describe("phone", () => {
  it("normalises Saudi numbers in common formats", () => {
    expect(normalisePhone("0566715786")).toBe("+966566715786");
    expect(normalisePhone("566715786")).toBe("+966566715786");
    expect(normalisePhone("+966 56 671 5786")).toBe("+966566715786");
    expect(normalisePhone("00966566715786")).toBe("+966566715786");
    expect(normalisePhone("٠٥٦٦٧١٥٧٨٦")).toBe("+966566715786");
  });
  it("accepts international numbers and rejects junk", () => {
    expect(normalisePhone("+44 7700 900123")).toBe("+447700900123");
    expect(normalisePhone("12345")).toBeNull();
    expect(normalisePhone("hello")).toBeNull();
  });
  it("displays Saudi mobiles in groups", () => {
    expect(displayPhone("+966566715786")).toBe("+966 56 671 5786");
  });
});

const lines = [
  { nameEn: "Shahi Chicken Biryani", nameAr: "شاهي دجاج برياني", variantEn: "Family Size", variantAr: "عائلة", unitHalalas: 7800, quantity: 2, note: "Less spicy" },
  { nameEn: "Garlic Naan", nameAr: "نان بالثوم", variantEn: "", variantAr: "", unitHalalas: 400, quantity: 4, note: "" },
];

describe("order totals", () => {
  it("adds up takeaway orders with no delivery charge", () => {
    expect(orderTotals(lines, "takeaway", null)).toEqual({ subtotal: 17200, hasUnpriced: false, delivery: 0, total: 17200 });
  });
  it("leaves the total open when the delivery fee is unknown", () => {
    expect(orderTotals(lines, "delivery", null)).toEqual({ subtotal: 17200, hasUnpriced: false, delivery: null, total: null });
  });
  it("includes a known delivery fee", () => {
    expect(orderTotals(lines, "delivery", 1500).total).toBe(18700);
  });
  it("never totals when an item has no price", () => {
    const t = orderTotals([...lines, { unitHalalas: null, quantity: 1 }], "takeaway", null);
    expect(t.total).toBeNull();
    expect(t.hasUnpriced).toBe(true);
  });
});

describe("whatsapp messages", () => {
  it("builds a complete English order message", () => {
    const msg = buildOrderMessage({
      locale: "en",
      restaurantName: "Al Jalsa Restaurant",
      name: " Sara ",
      phone: "+966500000000",
      fulfilment: "delivery",
      address: "Al Murabba, near the park",
      notes: "Ring the bell",
      lines,
      deliveryFeeHalalas: null,
    });
    expect(msg).toContain("*New order: Al Jalsa Restaurant*");
    expect(msg).toContain("Name: Sara");
    expect(msg).toContain("Phone: +966500000000");
    expect(msg).toContain("Order type: Delivery");
    expect(msg).toContain("Delivery address: Al Murabba, near the park");
    expect(msg).toContain("1. Shahi Chicken Biryani (Family Size)");
    expect(msg).toContain("2 x SAR 78 = SAR 156");
    expect(msg).toContain("Note: Less spicy");
    expect(msg).toContain("4 x SAR 4 = SAR 16");
    expect(msg).toContain("Subtotal: SAR 172");
    expect(msg).toContain("Delivery charge: to be confirmed by the restaurant");
    expect(msg).toContain("Total: to be confirmed by the restaurant");
    expect(msg).toContain("Notes: Ring the bell");
  });
  it("builds an Arabic takeaway message that keeps English names for the kitchen", () => {
    const msg = buildOrderMessage({
      locale: "ar",
      restaurantName: "مطعم الجلسة",
      name: "محمد",
      phone: "+966500000000",
      fulfilment: "takeaway",
      lines,
      deliveryFeeHalalas: null,
    });
    expect(msg).toContain("نوع الطلب: استلام من المطعم");
    expect(msg).toContain("شاهي دجاج برياني (عائلة) / Shahi Chicken Biryani (Family Size)");
    expect(msg).toContain("*الإجمالي: 172 ر.س*");
    expect(msg).not.toContain("عنوان التوصيل");
  });
  it("encodes the text for wa.me", () => {
    expect(waLink("+966 56 671 5786", "Hi & bye")).toBe("https://wa.me/966566715786?text=Hi%20%26%20bye");
  });
  it("skips empty enquiry fields and keeps multi-line values", () => {
    const msg = buildEnquiryMessage("Catering enquiry", [["Name", "Ali"], ["Email", ""], ["Guests", 120], ["Notes", "Line 1\nLine 2"]], "Thanks");
    expect(msg).toBe("*Catering enquiry*\n\nName: Ali\nGuests: 120\nNotes:\nLine 1\nLine 2\n\nThanks");
  });
});
