import { describe, expect, it } from "vitest";
import { seedMenu, seedReviews } from "../seed-source";
import { formatCalories } from "../money";

describe("seed menu (transcribed from the printed menu)", () => {
  it("has unique slugs and every item belongs to a category", () => {
    const slugs = seedMenu.items.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const cats = new Set(seedMenu.categories.map((c) => c.slug));
    for (const i of seedMenu.items) expect(cats.has(i.category), i.slug).toBe(true);
  });
  it("prices every dish, names every size, and keeps calories sane", () => {
    for (const i of seedMenu.items) {
      expect(i.variants.length, i.slug).toBeGreaterThan(0);
      for (const v of i.variants) {
        expect(v.priceHalalas, i.slug).not.toBeNull();
        expect(Number.isInteger(v.priceHalalas), i.slug).toBe(true);
        if (i.variants.length > 1) expect(v.nameEn && v.nameAr, i.slug).toBeTruthy();
        if (v.calories != null) expect(v.calories > 0 && v.calories < 5000, i.slug).toBe(true);
      }
      expect(i.nameEn && i.nameAr, i.slug).toBeTruthy();
    }
  });
  it("matches spot checks against the printed menu", () => {
    const price = (slug: string, n = 0) => seedMenu.items.find((i) => i.slug === slug)?.variants[n]?.priceHalalas;
    expect(price("butter-chicken")).toBe(3500);
    expect(price("mutton-karahi", 1)).toBe(11000);
    expect(price("butter-naan")).toBe(250);
    expect(price("shahi-chicken-biryani", 1)).toBe(6200);
    expect(price("fried-rice", 2)).toBe(3200);
    expect(seedMenu.items).toHaveLength(124);
    expect(seedMenu.categories).toHaveLength(12);
  });
  it("keeps reviews with an author, text and a 1 to 5 rating", () => {
    for (const r of seedReviews) {
      expect(r.author && r.text).toBeTruthy();
      expect(r.rating! >= 1 && r.rating! <= 5).toBe(true);
    }
  });
});

describe("calories", () => {
  it("formats single, multiple and missing values", () => {
    expect(formatCalories([450], "en")).toBe("450 cal");
    expect(formatCalories([350, 750], "ar")).toBe("350 / 750 سعرة حرارية");
    expect(formatCalories([650, 650], "en")).toBe("650 cal");
    expect(formatCalories([null], "en")).toBe("");
  });
});
