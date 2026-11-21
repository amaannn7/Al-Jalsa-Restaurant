# Transcription of the restaurant's printed menu (20 pages supplied by the client, 22 Nov 2026).
# Generates prisma/seed-data/menu.json. Prices in SAR as printed (VAT included); CAL as printed.
# Run: python3 -I scripts/data/printed-menu.py
import json, os

SRC = "Printed menu supplied by the restaurant (22 Nov 2026), prices include VAT"

# variant tuple: (nameEn, nameAr, priceSAR, calories)
def one(price, cal): return [("", "", price, cal)]
def hf(h, f, ch, cf): return [("Half", "نصف", h, ch), ("Full", "كامل", f, cf)]

CATS = [
 ("appetizers", "Appetizers", "المقبلات", "Soups, salads and starters.", "شوربات وسلطات ومقبلات.", [
  ("corn-soup", "Corn Soup (Veg / Non-Veg)", "شوربة الذرة (دجاج / خضار)", "Warm and comforting soup made with sweet corn, vegetables or chicken", "شوربة دافئة ولذيذة من الذرة الحلوة مع خضروات أو دجاج", one(16, 280)),
  ("chicken-hot-n-sour-soup", "Chicken Hot N Sour Soup", "شوربة الدجاج الحارة والحامضة", "Spicy and tangy chicken soup with vegetables, soy sauce, and vinegar", "شوربة دجاج حارة مع خضروات وصلصة الصويا والخل", one(16, 220)),
  ("cream-of-mushroom-soup", "Cream of Mushroom Soup", "شوربة كريمة الفطر", "Rich and creamy mushroom soup infused with herbs", "شوربة فطر كريمية وغنية بالنكهات", one(18, 280)),
  ("chicken-manchow-soup", "Chicken Manchow Soup", "شوربة مانتشاو", "Spicy Indo-Chinese soup with vegetables, chicken and crispy noodles", "شوربة هندية صينية حارة مع خضروات ونودلز مقرمشة", one(16, 220)),
  ("lentil-soup", "Lentil Soup", "شوربة عدس", "Warm, creamy lentil soup — simple, nutritious and comforting.", "شوربة عدس دافئة، ناعمة ومغذية - بسيطة ومريحة.", one(16, 220)),
  ("seafood-soup", "Seafood Soup", "شوربة مأكولات بحرية", "Warm, comforting seafood soup — rich broth with fish and shellfish.", "شوربة مأكولات بحرية دافئة – مرق غني مع سمك ومحار.", one(18, 220)),
  ("russian-salad", "Russian Salad", "سلطة روسية", "Creamy vegetable salad with mayo and fruity.", "سلطة خضار كريمية بالمايونيز مع لمسة فاكهية.", one(14, 200)),
  ("green-salad", "Green Salad", "سلطة خضراء", "Fresh seasonal greens and vegetables", "خضروات طازجة من الموسم", one(6, 80)),
  ("paneer-pakoda", "Paneer Pakoda", "بانير باكودا", "Fried paneer fritters coated in seasoned gram flour batter.", "جبن بانير مقلي في خليط من دقيق الحمص المتبل", one(18, 350)),
  ("honey-chilli-potato", "Honey Chilli Potato", "بطاطا بالعسل والفلفل الحار", "Crispy fried potatoes tossed in sweet and spicy honey chilli sauce", "بطاطا مقلية مقرمشة مع صلصة عسل وفلفل حار", one(18, 480)),
  ("chicken-lollipop", "Chicken Lollipop (Dry / Wet)", "دجاج لولي بوب", "Crispy fried chicken drumsticks tossed in spicy sauce, served with a side of tangy dip.", "أفخاذ دجاج مقلية مقرمشة ممزوجة بصلصة حارة، تقدم مع طبق جانبي من الصلصة اللاذعة.", one(22, 480)),
  ("tikka-roll", "Tikka Roll", "تكا رول", "Tender marinated chicken wrapped in soft flatbread with flavorful sauce.", "دجاج متبل طري ملفوف في خبز طري مع صلصة مليئة بالنكهة.", one(18, 280)),
  ("chicken-popcorn", "Chicken Popcorn with French Fries", "دجاج بوب كارن / بطاطا مقلية", "Crispy bite-sized chicken with fries. Golden, tasty, and perfect for snacking.", "قطع دجاج مقرمشة مع بطاطس مقلية ذهبية، لذيذة، ومثالية كوجبة خفيفة.", one(18, 280)),
  ("spring-rolls", "Spring Rolls (Veg / Non-Veg)", "سبرنج رول (دجاج / خضار)", "Crispy rolls wrapped in noodles filled with spiced veggies or chicken", "لفائف مقرمشة محشوة بالخضروات أو الدجاج ومغلفة بالنودلز", one(16, 280)),
  ("crispy-corn", "Crispy Corn", "كرسبي كارن", "Crispy fried corn tossed in tangy, spicy sauce. Crunchy, bold, and flavorful.", "ذرة مقلية مقرمشة بصلصة حارة ومنعشة. مقرمشة ولذيذة وغنية بالنكهة.", one(18, 450)),
 ]),
 ("kebab", "Kebab & Grill", "المشويات", "Dastare Kabab: kebabs, tikka, tandoori chicken and grill platters.", "كباب وتكا ودجاج تندوري وأطباق مشاوي.", [
  ("mutton-sheekh-kabab", "Mutton Sheekh Kabab", "شيش كباب لحم", "Minced mutton blended with aromatic spices, skewered and grilled to perfection", "لحم مفروم ممزوج بتوابل عطرية، مشوي على السيخ حتى النضج التام", one(42, 750)),
  ("bihari-kabab", "Bihari Kabab", "بهاري كباب", "Juicy lamb skewers marinated in spices and herbs, grilled to perfection, served with 2 crispy puris.", "سيخ من لحم الضأن العصاري متبل بالتوابل والأعشاب، مشوي إلى الكمال، يقدم مع ٢ من البوري المقرمش.", one(42, 350)),
  ("banjara-kabab", "Banjara Kabab", "كباب بنجارا", "Spicy chicken kababs infused with rustic Indian flavors", "كباب دجاج حار بنكهات هندية تقليدية", one(38, 350)),
  ("tangdi-kabab", "Tangdi Kabab", "كباب تانجدي", "Tender skewered meat grilled with aromatic spices. Smoky, juicy, and full of flavor.", "لحم مشوي على أسياخ مع توابل عطرية، مدخن، طري، ولذيذ.", one(35, 350)),
  ("sikandari-kabab", "Sikandari Kabab", "كباب سكندري", "A royal preparation of kababs marinated in rich spices and grilled", "تحضير ملكي لكباب متبل بتوابل غنية ومشوي بإتقان", one(42, 350)),
  ("chicken-tandoori", "Chicken Tandoori", "دجاج تندوري", "Chicken marinated in yogurt and traditional spices, roasted in a clay oven", "دجاج متبل باللبن والتوابل التقليدية، مشوي في فرن التندور", hf(25, 45, 350, 750)),
  ("fish-tikka", "Fish Tikka", "سمك تكا", "Boneless fish chunks marinated in traditional spices and grilled", "قطع فيليه سمك متبلة بالتوابل التقليدية ومشوية", one(45, 350)),
  ("lasooni-fish-tikka", "Lasooni Fish Tikka", "سمك تكا بالثوم", "Fish tikka with a bold garlic marinade, grilled to perfection", "سمك مشوي بتتبيلة غنية بالثوم", one(45, 350)),
  ("shahi-bbq-platter", "Shahi B.B.Q Platter", "طبق مشاوي شاهي مشكل", "A royal mix of Seekh Kebab, Fish Tikka, Malai Boti, and Chicken Boti. Flavorful, creamy, and perfectly grilled.", "مزيج ملكي من سيخ كباب، سمك تكا، مالاي بوتي، ودجاج بوتي. لذيذ، كريمي، ومشوي بإتقان.", hf(58, 110, 850, 1650)),
  ("bbq-mix-chicken-platter", "BBQ Mix Chicken Platter", "طبق مشاوي مشكل دجاج", "A grand assortment of grilled chicken.", "تشكيلة فاخرة من الدجاج المشوي.", hf(48, 90, 850, 1650)),
  ("tandoori-prawns", "Tandoori Prawns", "روبيان تندوري", "Juicy prawns marinated in tandoori masala and grilled over flame", "روبيان طري متبل بماسالا التندوري ومشوي على اللهب", one(54, 350)),
  ("multani-paneer-tikka", "Multani Paneer Tikka", "بانير تيكا ملتاني", "Cottage cheese marinated in Multani spices and grilled golden", "جبن بانير متبل بتوابل ملتان ومشوي حتى يأخذ اللون الذهبي.", one(35, 350)),
  ("malai-paneer-tikka", "Malai Paneer Tikka", "بانير تيكا بالمالاي", "Soft paneer cubes in a creamy, mildly spiced marinade, grilled gently", "مكعبات بانير طرية في تتبيلة كريمية خفيفة، مشوية بلطف", one(35, 350)),
 ]),
 ("jalsa-special-chicken", "Jalsa Special: Chicken", "جلسة الخاصة: الدجاج", "Jalsa-e-Khas chicken curries, from butter chicken to tikka masala.", "أطباق الدجاج الخاصة، من الدجاج بالزبدة إلى تكا ماسالا.", [
  ("butter-chicken", "Butter Chicken", "دجاج بالزبدة", "Tender chicken in creamy tomato-butter sauce", "دجاج طري في صلصة الطماطم والزبدة الكريمية", one(35, 450)),
  ("achari-chicken", "Achari Chicken", "دجاج اشاري", "Tender chicken marinated in tangy pickling spices with a spicy kick.", "دجاج طري متبل بتوابل المخلل الحامضة مع نكهة حارة", one(35, 450)),
  ("chicken-jelfrezi", "Chicken Jelfrezi", "دجاج جيلفريزي", "Spicy stir-fried chicken with peppers and onions in a bold sauce.", "دجاج مقلي سريعا مع فلفل وبصل في صلصة حارة.", one(35, 450)),
  ("chicken-kabab-masala", "Chicken Kabab Masala", "دجاج كباب مسالا", "Tender chicken kebabs simmered in rich, spiced masala gravy.", "كباب دجاج طري في صلصة ماسالا غنية بالتوابل.", one(35, 450)),
  ("chicken-fry", "Chicken Fry", "دجاج فرائي", "Crispy, golden-fried chicken with flavorful spices.", "دجاج مقلي ذهبي مقرمش مع توابل لذيذة.", one(35, 450)),
  ("murgh-mastaan", "Murgh Mastaan", "مرغ مستان", "Flavorful chicken delicacy with a royal touch", "دجاج لذيذ بطابع ملكي خاص", one(35, 350)),
  ("murgh-lajawab", "Murgh Lajawab", "مرغ لاجواب", "Chicken in exotic spices and rich gravy", "دجاج مطهو مع توابل غنية ومذاق لا يُقاوم", one(35, 350)),
  ("tawa-murgh", "Tawa Murgh", "تاوه مرغ", "Chicken cooked on tawa with bold spices.", "دجاج مطبوخ على تاوه مع توابل قوية.", one(35, 350)),
  ("tangdi-masala", "Tangdi Masala", "تانجدي ماسالا", "Spiced grilled chicken drumsticks.", "أفخاذ دجاج مشوية ومتبلة.", one(35, 350)),
  ("tikka-masala", "Tikka Masala", "دجاج تكا ماسالا", "Grilled chicken in creamy spiced tomato gravy.", "دجاج مشوي في صلصة طماطم كريمية متبلة.", one(36, 350)),
 ]),
 ("jalsa-special-mutton", "Jalsa Special: Mutton", "جلسة الخاصة: اللحم", "Jalsa-e-Khas mutton curries, rogan josh, maharaja and more.", "أطباق اللحم الخاصة، روغن جوش ومهراجا وغيرها.", [
  ("mutton-maharaja", "Mutton Maharaja", "لحم غنم مهراجا", "Royal-style mutton cooked with spices and dry fruits", "طبق ملكي من لحم الغنم مع التوابل والمكسرات", one(44, 350)),
  ("achari-mutton", "Achari Mutton", "لحم اشاري", "Tender mutton marinated in tangy pickling spices with a spicy kick.", "لحم طري متبل بتوابل المخلل الحامضة مع نكهة حارة", one(42, 450)),
  ("mutton-fry", "Mutton Fry", "لحم فرائي", "", "", one(42, 450)),
  ("mutton-marag", "Mutton Marag (Thu, Fri, Sat)", "لحم مرق (الخميس / الجمعة / السبت)", "Spicy mutton stew with aromatic flavors.", "حساء لحم ضأن حار بنكهات عطرية.", one(46, 350)),
  ("mutton-rogan-josh", "Mutton Rogan Josh", "لحم روغن جوش", "Classic Kashmiri mutton curry with rich red gravy", "طبق لحم غنم كشميري تقليدي بصلصة حمراء", one(42, 350)),
  ("seekh-kabab-masala", "Seekh Kabab Masala", "سيخ كبابا ماسالا", "Grilled minced meat in flavorful masala gravy.", "لحم مفروم مشوي في صلصة ماسالا لذيذة.", one(44, 350)),
  ("bhuna-gosht-kalimirch", "Bhuna Gosht Kalimirch", "بهونا جوشت كاليميرتش", "Tender mutton in a spicy black pepper masala.", "لحم ضأن طري في ماسالا الفلفل الأسود الحار.", one(42, 350)),
  ("reshmi-damka-gosht", "Reshmi Damka Gosht", "ريشمي دمكا غوشت", "Slow-cooked silky mutton in creamy sauce", "لحم غنم مطبوخ ببطء في صلصة كريمية ناعمة", one(42, 350)),
  ("lasooni-gosht", "Lasooni Gosht", "لحم لسوني", "Garlic-infused mutton curry", "لحم غنم مطهو مع الثوم", one(40, 350)),
  ("shahi-paya", "Shahi Paya", "أقدام", "Slow-cooked mutton trotters in spiced gravy.", "أقدام لحم ضأن مطهوة ببطء في صلصة متبلة.", one(26, 350)),
 ]),
 ("pakistani", "Pakistani Dishes", "الأطباق الباكستانية", "Dastar-e-Pakistan: karahi, handi, haleem and nihari.", "كراهي وهاندي وحليم ونهاري.", [
  ("mutton-karahi", "Mutton Karahi", "لحم كراهي", "Tender mutton cooked in a rich tomato and spice gravy", "لحم طري مطبوخ في صلصة الطماطم والتوابل", hf(60, 110, 1000, 2050)),
  ("mutton-white-karahi", "Mutton White Karahi", "لحم ابيض كراهي", "Tender mutton in a creamy, yogurt and cream gravy with mild spices.", "لحم ضأن طري في صلصة كريمية من الزبادي والقشدة مع توابل ناعمة.", hf(60, 110, 1000, 2050)),
  ("chicken-karahi", "Chicken Karahi", "دجاج كراهي", "Royal silky chicken curry", "دجاج طري مطهو بتوابل كراهي الباكستانية", hf(45, 85, 575, 1050)),
  ("mutton-makhni-handi", "Mutton Makhni Handi", "لحم ماخني هاندي", "Royal-style mutton cooked in a creamy, spiced gravy", "لحم ضأن على الطريقة الملكية مطهو في صلصة كريمية متبلة", one(60, 550)),
  ("chicken-makhni-handi", "Chicken Makhni Handi", "دجاج ماخني هاندي", "Delicious chicken curry made with yogurt and ground spices", "كاري دجاج لذيذ محضر بالزبادي والتوابل المطحونة", one(45, 650)),
  ("mutton-haleem", "Mutton Haleem", "لحم حليم", "Hearty, slow-cooked mutton haleem a creamy blend of meat, lentils & wheat.", "لحم حليم غني ومطبوخ ببطء مع العدس والقمح.", one(30, 650)),
  ("lahori-chana", "Lahori Chana", "لاهوري شانا", "Chickpeas in rich, flavorful Lahori-style gravy.", "حمص في صلصة غنية ولذيذة على طريقة لاهور.", one(18, 550)),
  ("nihari", "Nihari", "نهاري", "Slow-cooked beef stew with deep spices and a rich texture", "يخنة لحم بقر مطهوة ببطء وغنية بالنكهات", one(30, 550)),
  ("nalli-nihari", "Nalli Nihari", "نلي نهاري", "Slow-cooked beef stew with deep spices and a rich texture", "يخنة لحم بقر مطهوة ببطء وغنية بالنكهات", one(45, 550)),
 ]),
 ("chinese", "Chinese Dishes", "الأطباق الصينية", "Dastar-e-Cheen: Indo-Chinese chicken, prawns, fish and noodles.", "أطباق هندية صينية: دجاج وروبيان وسمك ونودلز.", [
  ("kung-pao-chicken", "Kung Pao Chicken", "دجاج كونغ باو", "Spicy stir-fried chicken with peanuts and vegetables", "دجاج مقلي حار مع الفول السوداني والخضار", one(34, 450)),
  ("panko-chicken", "Panko Chicken", "دجاج بانكو", "Crispy fried chicken coated with panko crumbs", "دجاج مقلي مقرمش مغطى بفتات بانكو", one(35, 450)),
  ("majestic-kaju-chicken", "Majestic Kaju Chicken", "دجاج كاجو ميجستك", "Tender chicken cooked in a rich, creamy cashew nut sauce with aromatic spices", "دجاج طري مطبوخ في صلصة كاجو كريمية غنية مع التوابل العطرية", one(34, 450)),
  ("chinese-platter", "Chinese Platter", "صحن صيني مشوي", "Spicy mix of Chicken 65, Mongolian, and Chilli Fish. A sizzling, flavorful combo.", "مزيج حار من دجاج ٦٥، منغولي، وسمك بالفلفل. تشكيلة شهية ومميزة.", one(52, 450)),
  ("chilli-chicken-paneer", "Chilli Chicken / Paneer", "دجاج بالفلفل الحار / بانير", "Spicy Indo-Chinese style chicken or paneer with capsicum and onions", "طبق حار على الطريقة الصينية الهندية مع الفلفل والبصل", [("Chicken", "دجاج", 38, 220), ("Paneer", "بانير", 32, 350)]),
  ("mongolian-chicken", "Mongolian Chicken", "دجاج منغولي", "Sautéed chicken in soy-based sauce. Also available in vegetarian option", "دجاج مقلي مع صوص الصويا. يوجد خيار نباتي", one(36, 450)),
  ("manchurian", "Manchurian (Chicken / Veg)", "منشوريا (دجاج / خضار)", "Indo-Chinese style dumplings cooked in a tangy, spicy sauce", "كرات مقلية في صوص حار على الطريقة الهندية الصينية", [("Chicken", "دجاج", 36, 220), ("Veg", "خضار", 32, 350)]),
  ("dynamite-chicken", "Dynamite Chicken", "دجاج ديناميت", "Grilled chicken topped with spicy dynamite mayo. Bold, creamy, and flavorful.", "دجاج مشوي مع مايونيز ديناميت حار. قوي، كريمي، ولذيذ.", one(38, 450)),
  ("dynamite-prawn", "Dynamite Prawn", "روبيان ديناميت", "Crispy prawns with tangy, spicy sauce. Topped with fiery dynamite mayo.", "روبيان مقرمش بصلصة حارة ومنعشة مغطى بصلصة ديناميت نارية.", one(46, 450)),
  ("loose-prawn", "Loose Prawn (Dhaba Style)", "روبيان مقلي", "Tender prawns with light spices. Juicy, simple, and flavorful.", "روبيان طري مع توابل خفيفة. لذيذ، بسيط، وشهي.", one(49, 450)),
  ("noodles", "Noodles (Schezwan, Chilli Garlic, Soft)", "نودلز (سيتشوان، ثوم حار، سنغافورية)", "Fried noodles in a choice of flavours.", "نودلز مقلية بنكهات متنوعة", one(35, 450)),
  ("chicken-65", "Chicken 65", "دجاج ٦٥", "Deep-fried spicy chicken with curry leaves & spices", "دجاج أو بانير مقلي حار مع أوراق الكاري والتوابل", one(36, 450)),
  ("paneer-65", "Paneer 65", "بانير ٦٥", "Crispy, spicy fried paneer bites with flavorful Indian spices.", "قطع بانير مقلية مقرمشة وحارة متبلة بالتوابل الهندية اللذيذة.", one(32, 450)),
  ("phuket-fish", "Phuket Fish", "أسماك بوكيت", "Crispy fried fish served with a classic sweet and tangy chili dipping sauce. A satisfying crunch!", "سمك مقلي مقرمش يقدم مع صلصة الفلفل الحار الحلوة والحامضة الكلاسيكية", one(48, 450)),
  ("apollo-fish", "Apollo Fish", "سمك أبولو", "Crispy fish fillets in spicy, tangy marinade. Served fresh and full of flavor.", "شرائح سمك مقرمشة بتتبيلة حارة ومنعشة تقدم طازجة ولذيذة.", one(42, 450)),
 ]),
 ("vegetables", "Vegetables", "الخضروات", "Shahi Sabziyan: paneer, daal and seasonal vegetables.", "بانير ودال وخضار موسمية.", [
  ("methi-chaman", "Methi Chaman", "ميثي تشمن", "A Kashmiri dish with fenugreek leaves and paneer", "طبق كشميري مع أوراق الحلبة والبانير.", one(18, 550)),
  ("mixed-sabzi", "Mixed Sabzi", "خضار مشكلة", "Seasonal vegetables cooked with spices", "خضروات موسمية مطهوة مع التوابل", one(18, 550)),
  ("aalo-gobi", "Aalo Gobi", "القرنبيط مع البطاطس", "Potato and cauliflower curry, seasoned with turmeric and coriander.", "كاري البطاطس والقرنبيط، متبل بالكركم والكزبرة.", one(18, 550)),
  ("daal-mash", "Daal Mash", "دال ماش", "A flavorful blend of lentils, spices, and aromatics, tempered and fresh herbs.", "مزيج لذيذ من العدس والتوابل والتوابل العطرية، والأعشاب الطازجة.", one(16, 450)),
  ("daal-chana", "Daal Chana", "دال شانا", "A flavorful blend of lentils, spices, and aromatics, tempered and fresh herbs.", "مزيج لذيذ من العدس والتوابل والتوابل العطرية، والأعشاب الطازجة.", one(16, 450)),
  ("daal-tadka", "Daal Tadka", "دال تاركا", "A flavorful blend of lentils, spices, and aromatics, tempered with sizzling ghee and fresh herbs.", "مزيج لذيذ من العدس والتوابل والتوابل العطرية، مع السمن الساخن والأعشاب الطازجة.", one(16, 450)),
  ("daal-makni", "Daal Makni", "دال مخني", "Creamy black lentils slow-cooked with butter and cream", "عدس أسود مطهو ببطء مع الزبدة والكريمة", one(16, 450)),
  ("shahi-jalfrezi", "Shahi Jalfrezi", "شاهي جالفريزي", "Royal-style mixed veg stir-fry with spices", "خضروات مشكلة مطهية على الطريقة الملكية مع التوابل", one(16, 450)),
  ("palak-paneer", "Palak Paneer", "سبانخ بنير", "Cottage cheese cubes in creamy spinach gravy", "مكعبات الجبن القريش في صلصة السبانخ الكريمية", one(22, 250)),
  ("paneer-tikka-masala", "Paneer Tikka Masala", "بانير تكا ماسالا", "Grilled paneer in creamy, spiced tomato gravy. Rich, flavorful, and aromatic.", "بانير مشوي بصلصة طماطم كريمية متبلة. غني بالنكهة والعطر.", one(24, 650)),
  ("paneer-butter-masala", "Paneer Butter Masala", "ماسالا زبدة بانير", "Paneer in rich tomato-butter gravy", "جبن بانير في صلصة طماطم وزبدة غنية", one(24, 650)),
 ]),
 ("rice", "Rice", "الأرز", "Zaiqa-e-Chawal: biryani by the plate or family pack, fried rice and more.", "برياني بالطبق أو بحجم العائلة، وأرز مقلي وغيره.", [
  ("mutton-dum-biryani", "Mutton Dum Biryani", "لحم دوم برياني", "Fragrant basmati rice cooked with tender mutton in traditional dum style", "أرز برياني باللحم المطبوخ على البخار (دم)", [("Regular", "عادي", 38, 650), ("Family Pack", "عائلة", 76, 1350)]),
  ("shahi-chicken-biryani", "Shahi Chicken Biryani", "شاهي دجاج برياني", "Royal-style chicken biryani cooked with aromatic spices and herbs", "برياني دجاج على الطريقة الملكية", [("Regular", "عادي", 32, 650), ("Family Pack", "عائلة", 62, 650)]),
  ("zeera-rice", "Zeera Rice", "أرز بالكمون", "Simple cumin-flavored basmati rice", "أرز مطهو مع الكمون", one(18, 650)),
  ("schezwan-rice", "Schezwan Rice (Veg / Chicken)", "أرز شيزوان (الخضار / دجاج)", "Spicy, tangy stir-fried rice tossed with vibrant vegetables and bold Schezwan sauce.", "أرز شيزوان حار وحامض مقلي مع خضراوات ملونة وصلصة شيزوان القوية.", one(28, 650)),
  ("biryani-rice", "Biryani Rice", "أرز برياني", "Chicken biryani cooked with aromatic spices and herbs.", "برياني دجاج مطبوخ مع توابل وأعشاب عطرية.", one(15, 650)),
  ("steamed-rice", "Steamed Rice", "أرز بسمتي", "Fragrant, long-grain Basmati rice, perfectly cooked for a light and fluffy texture.", "أرز بسمتي عطري، طويل الحبة، مطبوخ بشكل مثالي للحصول على ملمس خفيف ورقيق.", one(6, 650)),
  ("fried-rice", "Fried Rice (Chicken, Veg, Seafood)", "أرز مقلي (دجاج / خضار / بحري)", "Choice of fried rice: chicken, vegetable, or seafood", "أرز مقلي متنوع بالنكهات: دجاج، خضار، أو مأكولات بحرية", [("Chicken", "دجاج", 28, 650), ("Veg", "خضار", 24, 650), ("Seafood", "بحري", 32, 650)]),
  ("beef-pulao", "Beef Pulao (Friday Special)", "لحم بقر بولاو (الجمعة الخاصة)", "Spicy and flavorful pulao prepared with authentic and juicy beef.", "بولاو حار ولذيذ مُعد من لحم البقر العصير الأصيل.", [("Single", "فردي", 30, 575), ("Full", "كامل", 60, 1050)]),
 ]),
 ("bread", "Bread", "الخبز", "Rotiyan: naan, roti and paratha from the tandoor.", "نان وروتي وبراتا من التنور.", [
  ("wheat-tandoori-roti", "Wheat Tandoori Roti", "خبز التندوري", "Whole wheat roti baked in clay oven. Crispy, fresh, and flavorful.", "خبز قمح كامل مخبوز في فرن طيني، مقرمش، طازج، ولذيذ.", one(1, 220)),
  ("butter-naan", "Butter Naan", "نان بالزبدة", "Pillowy soft naan, fresh from the tandoor and brushed with golden butter", "نان طري يخرج ساخنا من التنور، يُدهن بالزبدة الذهبية ويكمل أي طبق رئيسي", one(2.5, 220)),
  ("plain-naan", "Plain Naan", "نان سادة", "Traditional tandoori flatbread, light and fluffy with a smoky touch", "خبز تنوري تقليدي، خفيف وهش مع لمسة مشوية لذيذة", one(2, 220)),
  ("garlic-naan", "Garlic Naan", "نان بالثوم", "A flavorful twist on the classic – naan topped with aromatic garlic and melted butter", "نان شهي مزين بالثوم الطازج والزبدة الذائبة ليمنح نكهة قوية ومميزة", one(3, 220)),
  ("kalongi-naan", "Kalongi Naan", "كالونجي نان", "Soft naan topped with black cumin seeds. Fresh, aromatic, and flavorful.", "خبز نان طري مع بذور الكمون الأسود، عطري، طازج، ولذيذ.", one(2.5, 220)),
  ("coriander-naan", "Coriander Naan", "نان الكزبرة", "Soft, fluffy Indian bread infused with fresh coriander", "خبز هندي طري ورقيق مع الكزبرة الطازجة", one(2.5, 220)),
  ("roghni-naan", "Roghni Naan", "روغني نان", "Soft, fluffy naan topped with sesame seeds and a hint of butter", "خبز نان ناعم ورقيق مغطى ببذور السمسم مع لمسة من الزبدة", one(2, 220)),
  ("assorted-naan-basket", "Assorted Naan Basket", "صحن مشكل خبز", "A mixture of Butter Naan, Garlic Naan, Laccha Paratha & Coriander Naan.", "صحن من زبدة نان، نان الثوم، لاتشا باراتا وكزبرة نان", one(10, 500)),
  ("romali-roti", "Romali Roti", "خبز رومالي", "Paper-thin, silky soft roti folded like a handkerchief – a true Mughlai delight", "خبز رقيق جدا كالمنديل، ناعم الملمس ويذوب في الفم - من أطايب المطبخ المغولي", one(2, 220)),
  ("kulcha", "Kulcha (Plain / Butter)", "كلشا (سادة / بالزبدة)", "Thick and soft North Indian bread, served plain or finished with a buttery glaze", "خبز سميك وطري من شمال الهند، يقدم سادة أو مع لمسة زبدة", one(2.5, 220)),
  ("laccha-paratha", "Laccha Paratha", "براتا ملففة", "Flaky, golden layers of pan-fried dough – crisp on the outside, tender inside", "طبقات مقرمشة من العجين المقلي، ذهبية اللون، مقرمشة من الخارج وطرية من الداخل", one(3, 320)),
 ]),
 ("desserts", "Desserts", "الحلويات", "Mitha-e-Khas: rabdi, kheer, kulfi, gulab jamun and more.", "رابدي وكهير وكلفي وجلاب جامن وغيرها.", [
  ("shahi-rabdi", "Shahi Rabdi", "شاهي رابدي", "Rich and creamy milk-based dessert, slow-cooked and sweetened", "حلوى غنية ودسمة مصنوعة من الحليب، مطهوة ببطء ومحلاة", one(18, 280)),
  ("apricot-pudding", "Apricot Pudding", "بودنغ المشمش", "Soft, sweet pudding made with dried apricots", "بودنغ طري وحلو مصنوع من المشمش المجفف", one(16, 280)),
  ("gulab-jamun", "Gulab Jamun", "جلاب جامن", "Deep-fried milk dumplings soaked in rose-flavored syrup", "زلابية حليب مقلية مغموسة في شراب بنكهة الورد", one(10, 180)),
  ("gajar-ka-halwa", "Gajar Ka Halwa", "حلوى الجزر", "Carrot-based sweet pudding cooked in milk and ghee", "بودنغ حلو مصنوع من الجزر، مطبوخ في الحليب والسمن", one(15, 380)),
  ("matka-kheer", "Matka Kheer", "ماتكا كهير", "", "", one(15, 380)),
  ("matka-kulfi", "Matka Kulfi", "ماتكا كُلفي", "Creamy, dense matka kulfi made by simmering milk with cardamom and nuts.", "حلوى كُلفي كريمية وكثيفة محضرة بتكثيف الحليب مع الهيل والمكسرات.", one(15, 180)),
  ("shahi-tukda", "Shahi Tukda", "شاهي توكرا", "Mughlai bread pudding with rich saffron and cardamom-flavored milk", "بودنغ خبز مغلاي مع حليب بنكهة الزعفران والهيل", one(14, 180)),
  ("mughlai-meetha-pan", "Mughlai Meetha Pan", "بان مغلاي حلو", "Sweet betel leaf preparation with aromatic fillings", "تحضير أوراق التنبول الحلوة مع حشوات عطرية", one(6, 80)),
 ]),
 ("beverages", "Beverages", "المشروبات", "Lassi, karak and Kashmiri tea, soft drinks and water.", "لسي وشاي كرك وشاي كشميري ومشروبات غازية وماء.", [
  ("strawberry-lassi", "Strawberry Lassi", "لاسّي بالفراولة", "Yogurt drink with sweet strawberries. Cool, fruity, and refreshing.", "مشروب زبادي مع فراولة حلوة، بارد، فاكهي، ومنعش.", one(14, 220)),
  ("mango-lassi", "Mango Lassi", "مانجو لسي", "A sweet and creamy yogurt-based drink blended with juicy mango puree.", "مشروب حلو وكريمي على أساس الزبادي ممزوج بلب المانجو العصيري.", one(14, 220)),
  ("pistachio-lassi", "Pistachio Lassi", "بستاشيو لسي", "A creamy and nutty yoghurt drink infused with the flavour of pistachios.", "مشروب زبادي كريمي بنكهة البندق الغنية الممزوجة بنفحات الفستق.", one(14, 220)),
  ("punjabi-sweet-lassi", "Punjabi Sweet Lassi", "بنجابي لسي", "Refreshing Lasi- hint of mint and ginger with a pinch of salt.", "لبن مثلج منعش نكهة النعناع والزنجبيل مع رشة ملح.", one(12, 220)),
  ("kinza-drink", "Kinza Drink", "مشروب غازي", "Refreshing carbonated soft drink available in citrus, lemon, cola and orange flavors.", "مشروب غازي منعش بنكهة الليمون والحمضيات والكولا والبرتقال.", one(3, 220)),
  ("karak-tea", "Karak Tea", "شاي كرك", "Strong, creamy milk tea brewed with black tea leaves and cardamom for a bold flavor.", "شاي بالحليب قوي وكريمي محضر من أوراق الشاي الأسود والهيل لنكهة قوية.", one(3, 220)),
  ("kashmiri-tea", "Kashmiri Tea", "شاي كشميري", "Aromatic pink Kashmiri tea with creamy texture and traditional spices.", "شاي كشميري زهري عطري بنكهة التوابل وقوام كريمي.", one(5, 220)),
  ("water", "Water", "ماء", "Pure, refreshing water — essential and hydrating.", "ماء نقي ومنعش – أساسي ومرطب.", one(1, None)),
 ]),
 ("mojitos", "Mojitos", "موهيتو", "Lemonade and fruit mojitos with mint and lime.", "ليمونادة وموهيتو بالفواكه مع النعناع والليمون.", [
  ("classic-lemonade", "Classic Lemonade", "ليمونادة كلاسيكية", "Lemon, sugar, and water—sweet, citrusy, and refreshing. Perfect for hot days.", "ليمون، سكر، وماء - حلو ومنعش، مثالي للأيام الحارة.", one(10, 220)),
  ("lemon-mint", "Lemon Mint", "ليمون ونعناع", "Lemon with mint and lime. Cool, fruity, and perfect for summer.", "ليمون مع نعناع، منعش وفاكهي للصيف.", one(12, 220)),
  ("watermelon-mint-burst", "Watermelon Mint Burst", "موهيتو البطيخ", "Juicy watermelon with mint and lime. Cool, fruity, and perfect for summer.", "بطيخ طازج مع النعناع والليمون، منعش وفاكهي للصيف.", one(12, 220)),
  ("berry-bliss", "Berry Bliss", "بيري بليس", "Fresh strawberries with mint and lime. Fruity, zesty, and chilled.", "فراولة طازجة مع النعناع والليمون، منعش ولذيذ.", one(12, 220)),
  ("tangy-peach-splash", "Tangy Peach Splash", "موهيتو الخوخ", "Peach, orange, and lemonade blend. Sweet, tangy, and summery.", "مزيج من الخوخ والبرتقال والليمونادة. حلو ومنعش.", one(12, 220)),
  ("virgin-blue-lagoon", "Virgin Blue Lagoon", "بلو لاجون", "Lemon-lime soda with pineapple & blue curaçao. Tropical, fruity, and chilled.", "صودا الليمون مع الأناناس والكوراساو الأزرق، استوائي ومنعش.", one(12, 220)),
 ]),
]

# Item slug -> photo file slug in public/images/menu (restaurant photos from Ninja, or crops of the printed menu photo pages)
PHOTO = {"shahi-bbq-platter": "bbq-mix-platter", "mixed-sabzi": "mixed-vegetables", "steamed-rice": "plain-steam-rice"}
FEATURED = {"shahi-chicken-biryani", "mutton-rogan-josh", "shahi-bbq-platter", "paneer-butter-masala", "murgh-mastaan", "mutton-maharaja", "tandoori-prawns", "gajar-ka-halwa"}

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
rep = json.load(open(os.path.join(root, "scripts/assets/menu-images-report.json")))
cats, items = [], []
for ci, (cslug, cen, car, cden, cdar, rows) in enumerate(CATS):
    cats.append({"slug": cslug, "nameEn": cen, "nameAr": car, "descriptionEn": cden, "descriptionAr": cdar, "sortOrder": ci})
    for ii, (slug, en, ar, den, dar, variants) in enumerate(rows):
        ph = PHOTO.get(slug, slug)
        r = rep.get(ph, {})
        items.append({
            "slug": slug, "category": cslug, "nameEn": en, "nameAr": ar, "descriptionEn": den, "descriptionAr": dar,
            "imageUrl": f"/images/menu/{ph}.webp" if r.get("photo") else None,
            "cutoutUrl": f"/images/menu/cut/{ph}.webp" if r.get("cutout") else None,
            "cutoutWhole": bool(r.get("whole")), "isFeatured": slug in FEATURED, "isPopular": False, "isAvailable": True,
            "sortOrder": ii, "source": SRC,
            "variants": [{"nameEn": a, "nameAr": b, "priceHalalas": round(p * 100), "calories": c, "sortOrder": n} for n, (a, b, p, c) in enumerate(variants)],
        })
json.dump({"source": SRC, "categories": cats, "items": items}, open(os.path.join(root, "prisma/seed-data/menu.json"), "w"), ensure_ascii=False, indent=1)
print(len(cats), "categories", len(items), "items", sum(len(i["variants"]) for i in items), "variants",
      sum(1 for i in items if i["imageUrl"]), "with photo")
