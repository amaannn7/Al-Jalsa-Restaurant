# Menu: source and corrections

**Source:** the restaurant's printed menu (20 pages supplied on 22 Nov 2026). Prices include VAT and
calories are as printed. The transcription is in `scripts/data/printed-menu.py`; it generates
`prisma/seed-data/menu.json`. Every item and price can be changed in Admin → Menu items.

The printed menu replaces the earlier Ninja delivery-app listing, whose prices were higher (for
example Butter Chicken SAR 42 on Ninja, SAR 35 on the printed menu).

## Please check: the English and Arabic columns disagree
| Dish | English column | Arabic column | Used on the site |
|---|---|---|---|
| Methi Chaman | SAR 18 | ٢٦ (26) | **18**; please confirm |
| Green Salad | SAR 06 | ١٠ (10) | **6**; please confirm |

## Arabic text that was a copy of another dish (replaced with a translation of the English)
| Dish | Printed Arabic | Site Arabic |
|---|---|---|
| Methi Chaman (name) | خضار مشكلة (same as Mixed Sabzi) | ميثي تشمن |
| Mutton Makhni Handi | دجاج مقلي مقرمش مغطى بفتات بانكو (Panko Chicken text) | لحم ضأن على الطريقة الملكية مطهو في صلصة كريمية متبلة |
| Chicken Makhni Handi | دجاج مقلي مع صوص الصويا... (Mongolian Chicken text) | كاري دجاج لذيذ محضر بالزبادي والتوابل المطحونة |
| Karak Tea | لبن مثلج منعش... (Punjabi Lassi text) | شاي بالحليب قوي وكريمي محضر من أوراق الشاي الأسود والهيل لنكهة قوية. |
| Tandoori Prawns | سمك مشوي بتتبيلة غنية بالثوم (garlic fish text) | روبيان طري متبل بماسالا التندوري ومشوي على اللهب |
| Shahi B.B.Q Platter (name) | طبق مشاوي مشكل دجاج (same as BBQ Mix Chicken Platter) | طبق مشاوي شاهي مشكل |
| Chilli Chicken / Paneer (name) | بالفلفل الحار/ بانير | دجاج بالفلفل الحار / بانير |
| Manchurian (name) | دجاج منشوريا (but it is also offered as Veg) | منشوريا (دجاج / خضار) |

## English text that was a copy of another dish
| Dish | Printed English | Site English |
|---|---|---|
| Noodles | "Cottage cheese marinated in spices and grilled golden" | "Fried noodles in a choice of flavours." (from the Arabic) |
| Chicken 65 | "Deep-fried spicy paneer with curry leaves & spices" | "Deep-fried spicy chicken with curry leaves & spices" |
| Beef Pulao | "prepared in authentic anj Juciy Beef." | "prepared with authentic and juicy beef." |

## Descriptions left empty (the printed text belongs to another dish)
- **Mutton Fry**: printed text is the Achari Mutton description ("marinated in tangy pickling spices").
- **Matka Kheer**: printed text is the Gajar Ka Halwa description ("Carrot-based sweet pudding").

Add the correct descriptions in the admin.

## Other
- Water is printed as "CAL 220"; no calories are shown for water.
- Section headings in Arabic: "لأطباق الصينية" → "الأطباق الصينية", "الأطباق الباكستان" → "الأطباق الباكستانية".
- Category names in English use plain words (Kebab & Grill, Pakistani Dishes, Chinese Dishes...); the
  printed Urdu headings (Dastare Kabab, Dastar-e-Pakistan, Dastar-e-Cheen, Jalsa-e-Khas, Shahi Sabziyan,
  Zaiqa-e-Chawal, Rotiyan, Mitha-e-Khas) appear in each section's description.
- The two biryani family packs are shown as a size of the biryani (Regular / Family Pack).

## Dishes on the old Ninja listing but not on the printed menu (removed)
French Fries (SAR 8), Veg Bhutani, Chatpata Baby Corn, Nauratan Khorma, Shahi Murgh Makhmali,
Mutton Kashmiri. Add them back in the admin if they are still served.

## Photos
- 42 dishes use the restaurant's photos from its Ninja listing (1024px).
- 5 dishes (Lentil Soup, Seafood Soup, Chicken Lollipop, Chicken Popcorn, Crispy Corn) use photos
  cropped from the printed menu's photo pages. They are small (about 260px) and look soft on large
  screens; please send the original photo files.
- 77 dishes have no photo yet and show a lettered tile. Sections without any photo (Pakistani,
  Chinese, Beverages, Mojitos) are listed as links on the home page instead of plates.
