/**
 * Default editable copy. Seeded into the ContentBlock table and used as a fallback when a key
 * is missing. Every line is written from verified facts only (the menu, the hours, the location,
 * the logo). No history, awards, ratings or superlatives. The restaurant edits these in the admin.
 */
export type ContentDefault = {
  key: string;
  group: string;
  label: string;
  en: string;
  ar: string;
  multiline?: boolean;
};

export const contentDefaults: ContentDefault[] = [
  // Home: hero
  { key: "home.hero.eyebrow", group: "Home: hero", label: "Small line above the title", en: "Al Murabba, Riyadh", ar: "المربع، الرياض" },
  { key: "home.hero.tagline", group: "Home: hero", label: "Tagline under the name", en: "Multi-Cuisine Restaurant", ar: "مطعم متعدد المطابخ" },
  {
    key: "home.hero.intro", group: "Home: hero", label: "Introduction", multiline: true,
    en: "Tandoor grills, slow-cooked curries and biryani by the family pot. Take a seat with us, or order on WhatsApp.",
    ar: "مشويات التندور، وكاري مطهو ببطء، وبرياني بحجم العائلة. تفضّل بالجلوس معنا، أو اطلب عبر واتساب.",
  },
  {
    key: "home.hero.title", group: "Home: hero", label: "Main headline",
    en: "Gather Around the Table at Al Jalsa",
    ar: "اجتمعوا حول المائدة في الجلسة",
  },
  {
    key: "home.intro.text", group: "Home: hero", label: "Large line in the white band under the hero", multiline: true,
    en: "Mughlai curries, Indo-Chinese favourites, fresh naan and family-size biryani, to dine in, take away or have delivered.",
    ar: "كاري المغلاي وأطباق هندية صينية ونان طازج وبرياني بحجم العائلة، تناولها عندنا أو خذها سفري أو اطلب التوصيل.",
  },
  { key: "home.hero.scrollLine", group: "Home: hero", label: "Line revealed while scrolling the hero", en: "Al Jalsa means the sitting: a table to gather around.", ar: "الجلسة: مكان نلتقي حوله على مائدة واحدة." },

  // Home: story (pinned section)
  { key: "home.story.eyebrow", group: "Home: story", label: "Section label", en: "The kitchen", ar: "المطبخ" },
  { key: "home.story.1.title", group: "Home: story", label: "Panel 1 title", en: "From the tandoor", ar: "من التنور" },
  {
    key: "home.story.1.text", group: "Home: story", label: "Panel 1 text", multiline: true,
    en: "Chicken tandoori, kebabs and naan: marinated in yogurt and spices, then roasted in the clay oven.",
    ar: "دجاج تندوري وكباب ونان: متبلة باللبن والتوابل، ثم تُشوى في فرن التنور الطيني.",
  },
  { key: "home.story.2.title", group: "Home: story", label: "Panel 2 title", en: "Curries, slow and rich", ar: "كاري غني مطهو ببطء" },
  {
    key: "home.story.2.text", group: "Home: story", label: "Panel 2 text", multiline: true,
    en: "Mutton rogan josh, butter chicken and daal makhni, cooked low and slow in deep, spiced gravies.",
    ar: "لحم روغن جوش ودجاج بالزبدة ودال مخني، تُطهى على نار هادئة في صلصات غنية بالتوابل.",
  },
  { key: "home.story.3.title", group: "Home: story", label: "Panel 3 title", en: "Biryani for the whole table", ar: "برياني للمائدة كلها" },
  {
    key: "home.story.3.text", group: "Home: story", label: "Panel 3 text", multiline: true,
    en: "Shahi chicken biryani and mutton dum biryani, in a regular portion or a family size to share.",
    ar: "شاهي دجاج برياني ولحم دوم برياني، بحصة عادية أو بحجم العائلة للمشاركة.",
  },

  // Home: sections
  { key: "home.featured.eyebrow", group: "Home: sections", label: "Featured dishes label", en: "Signature dishes", ar: "أطباق مميزة" },
  { key: "home.categories.eyebrow", group: "Home: sections", label: "Menu categories label", en: "Explore the menu", ar: "استكشف القائمة" },
  { key: "home.gallery.eyebrow", group: "Home: sections", label: "Gallery label", en: "Gallery", ar: "معرض الصور" },
  { key: "home.reviews.eyebrow", group: "Home: sections", label: "Reviews label", en: "Reviews", ar: "آراء الضيوف" },
  { key: "home.featured.title", group: "Home: sections", label: "Featured dishes title", en: "From our kitchen", ar: "من مطبخنا" },
  { key: "home.featured.text", group: "Home: sections", label: "Featured dishes text", en: "A few plates to begin with. The full menu has many more.", ar: "بعض الأطباق لتبدأ بها، وفي القائمة الكاملة المزيد." },
  { key: "home.categories.title", group: "Home: sections", label: "Menu categories title", en: "The Menu", ar: "قائمة الطعام" },
  { key: "home.categories.text", group: "Home: sections", label: "Menu categories text", en: "From soups and starters to karahi, biryani and sweets.", ar: "من الشوربات والمقبلات إلى الكراهي والبرياني والحلويات." },
  { key: "home.categories.more", group: "Home: sections", label: "Line before the other menu sections", en: "Also on the menu", ar: "أيضاً في القائمة" },
  { key: "home.gallery.title", group: "Home: sections", label: "Gallery title", en: "At the table", ar: "على المائدة" },
  { key: "home.reviews.title", group: "Home: sections", label: "Reviews title", en: "Guests' words", ar: "كلمات ضيوفنا" },
  { key: "home.reviews.empty", group: "Home: sections", label: "Text when no reviews are added", en: "See what guests say about us on Google Maps.", ar: "اطّلع على آراء ضيوفنا في خرائط جوجل." },
  { key: "home.visit.title", group: "Home: sections", label: "Visit section title", en: "Visit us", ar: "زورونا" },
  { key: "home.visit.text", group: "Home: sections", label: "Visit section text", en: "Open every day, from early morning until late at night.", ar: "مفتوح يومياً من الصباح الباكر حتى وقت متأخر من الليل." },

  // Highlights (short facts)
  { key: "highlight.1.title", group: "Home: highlights", label: "Highlight 1 title", en: "Open daily", ar: "مفتوح يومياً" },
  { key: "highlight.1.text", group: "Home: highlights", label: "Highlight 1 text", en: "From 6 AM, every day of the week", ar: "من 6 صباحاً، طوال أيام الأسبوع" },
  { key: "highlight.2.title", group: "Home: highlights", label: "Highlight 2 title", en: "Family size", ar: "حجم العائلة" },
  { key: "highlight.2.text", group: "Home: highlights", label: "Highlight 2 text", en: "Biryani and grill platters made for sharing", ar: "برياني وأطباق مشاوي للمشاركة" },
  { key: "highlight.3.title", group: "Home: highlights", label: "Highlight 3 title", en: "Order on WhatsApp", ar: "اطلب عبر واتساب" },
  { key: "highlight.3.text", group: "Home: highlights", label: "Highlight 3 text", en: "Takeaway or delivery, sent in one tap", ar: "استلام أو توصيل، بضغطة واحدة" },
  { key: "highlight.4.title", group: "Home: highlights", label: "Highlight 4 title", en: "Catering", ar: "خدمات الضيافة" },
  { key: "highlight.4.text", group: "Home: highlights", label: "Highlight 4 text", en: "Food for gatherings, large and small", ar: "طعام للتجمعات الكبيرة والصغيرة" },

  // Catering
  { key: "catering.cta.title", group: "Catering", label: "Main call to action", en: "Planning a Large Event? Let Us Handle the Food.", ar: "تخطط لمناسبة كبيرة؟ دع الطعام علينا." },
  {
    key: "catering.cta.text", group: "Catering", label: "Call to action text", multiline: true,
    en: "Tell us the date, the guest count and the dishes you love. We will come back to you with a menu and a quote.",
    ar: "أخبرنا بالتاريخ وعدد الضيوف والأطباق التي تحبها، وسنعود إليك بقائمة وعرض سعر.",
  },
  { key: "catering.hero.eyebrow", group: "Catering", label: "Page label", en: "Catering and large orders", ar: "الضيافة والطلبات الكبيرة" },
  { key: "catering.hero.title", group: "Catering", label: "Page title", en: "Food for every gathering", ar: "طعام لكل تجمّع" },
  {
    key: "catering.hero.text", group: "Catering", label: "Page introduction", multiline: true,
    en: "From an office lunch to a family celebration, we prepare dishes from our menu in the quantities you need.",
    ar: "من غداء في المكتب إلى احتفال عائلي، نحضّر أطباقاً من قائمتنا بالكميات التي تحتاجها.",
  },
  { key: "catering.services.title", group: "Catering", label: "Services title", en: "What we cater for", ar: "المناسبات التي نخدمها" },
  { key: "catering.service.1.title", group: "Catering", label: "Service 1 title", en: "Corporate events", ar: "فعاليات الشركات" },
  { key: "catering.service.1.text", group: "Catering", label: "Service 1 text", en: "Meetings, office lunches and company gatherings.", ar: "الاجتماعات وغداء المكاتب وتجمعات الشركات." },
  { key: "catering.service.2.title", group: "Catering", label: "Service 2 title", en: "Family gatherings", ar: "التجمعات العائلية" },
  { key: "catering.service.2.text", group: "Catering", label: "Service 2 text", en: "Weekend lunches and evenings with the whole family.", ar: "غداء نهاية الأسبوع وأمسيات العائلة." },
  { key: "catering.service.3.title", group: "Catering", label: "Service 3 title", en: "Celebrations and special occasions", ar: "الاحتفالات والمناسبات الخاصة" },
  { key: "catering.service.3.text", group: "Catering", label: "Service 3 text", en: "Birthdays, Eid gatherings, engagements and milestones.", ar: "أعياد الميلاد وتجمعات العيد والخطوبة والمناسبات المميزة." },
  { key: "catering.service.4.title", group: "Catering", label: "Service 4 title", en: "Large group orders", ar: "طلبات المجموعات الكبيرة" },
  { key: "catering.service.4.text", group: "Catering", label: "Service 4 text", en: "Biryani by the tray, grill platters and breads for a crowd.", ar: "برياني بالصواني وأطباق مشاوي وخبز لعدد كبير من الضيوف." },
  { key: "catering.service.5.title", group: "Catering", label: "Service 5 title", en: "Private functions", ar: "الحفلات الخاصة" },
  { key: "catering.service.5.text", group: "Catering", label: "Service 5 text", en: "A menu planned around your guests and your schedule.", ar: "قائمة مصممة حسب ضيوفك وجدولك." },
  { key: "catering.custom.title", group: "Catering", label: "Custom menus title", en: "Your menu, your way", ar: "قائمتك كما تريدها" },
  {
    key: "catering.custom.text", group: "Catering", label: "Custom menus text", multiline: true,
    en: "Choose any dishes from our menu and tell us the quantities. We will advise on portions for your guest count.",
    ar: "اختر ما تشاء من أطباق قائمتنا وحدد الكميات، وسننصحك بالحصص المناسبة لعدد ضيوفك.",
  },
  { key: "catering.form.title", group: "Catering", label: "Form title", en: "Request a catering quote", ar: "اطلب عرض سعر للضيافة" },
  { key: "catering.packages.title", group: "Catering", label: "Packages title", en: "Packages", ar: "الباقات" },

  // Meeting
  { key: "meeting.title", group: "Book a meeting", label: "Page title", en: "Book a catering consultation", ar: "احجز استشارة ضيافة" },
  {
    key: "meeting.text", group: "Book a meeting", label: "Page introduction", multiline: true,
    en: "Planning something large? Ask for a meeting at the restaurant or a call, and we will talk through the menu, quantities and timing.",
    ar: "تخطط لمناسبة كبيرة؟ اطلب اجتماعاً في المطعم أو مكالمة، وسنناقش معك القائمة والكميات والتوقيت.",
  },

  // About
  { key: "about.eyebrow", group: "About", label: "Page label", en: "About us", ar: "من نحن" },
  { key: "about.title", group: "About", label: "Page title", en: "A seat at our table", ar: "مقعد على مائدتنا" },
  {
    key: "about.intro", group: "About", label: "Introduction", multiline: true,
    en: "Al Jalsa is a multi-cuisine restaurant on Ibn Al Nadeem Street in Al Murabba, Riyadh.",
    ar: "مطعم الجلسة مطعم متعدد المطابخ في شارع ابن النديم بحي المربع في الرياض.",
  },
  { key: "about.menu.title", group: "About", label: "Block 1 title", en: "A menu that travels", ar: "قائمة متنوعة" },
  {
    key: "about.menu.text", group: "About", label: "Block 1 text", multiline: true,
    en: "The menu moves from tandoor grills and Mughlai curries to Indo-Chinese soups and fried rice, with breads from the oven and desserts such as gulab jamun and gajar ka halwa.",
    ar: "تتنقل القائمة بين مشويات التندور والكاري المغلاي والشوربات الهندية الصينية والأرز المقلي، مع خبز من الفرن وحلويات مثل جلاب جامن وحلوى الجزر.",
  },
  { key: "about.dining.title", group: "About", label: "Block 2 title", en: "The dining experience", ar: "تجربة الطعام" },
  {
    key: "about.dining.text", group: "About", label: "Block 2 text", multiline: true,
    en: "Come in for a meal, collect a takeaway, or order delivery on WhatsApp. Family-size biryani and grill platters are made for sharing.",
    ar: "تفضّل لتناول وجبتك، أو استلم طلبك سفري، أو اطلب التوصيل عبر واتساب. البرياني وأطباق المشاوي بحجم العائلة مُعدّة للمشاركة.",
  },
  { key: "about.gather.title", group: "About", label: "Block 3 title", en: "For gatherings", ar: "للتجمعات" },
  {
    key: "about.gather.text", group: "About", label: "Block 3 text", multiline: true,
    en: "For offices, families and celebrations, we also prepare catering orders from the same kitchen.",
    ar: "للشركات والعائلات والاحتفالات، نحضّر أيضاً طلبات الضيافة من المطبخ نفسه.",
  },

  // Contact
  { key: "contact.title", group: "Contact", label: "Page title", en: "Contact us", ar: "تواصل معنا" },
  {
    key: "contact.text", group: "Contact", label: "Page introduction", multiline: true,
    en: "Message us on WhatsApp, call, or visit us in Al Murabba.",
    ar: "راسلنا عبر واتساب، أو اتصل بنا، أو زورنا في حي المربع.",
  },
  { key: "contact.form.title", group: "Contact", label: "Form title", en: "Send us a message", ar: "أرسل لنا رسالة" },

  // Menu page
  { key: "menu.title", group: "Menu page", label: "Page title", en: "Our Menu", ar: "قائمتنا" },
  { key: "menu.text", group: "Menu page", label: "Page introduction", en: "Choose your dishes, add them to your order and send it on WhatsApp.", ar: "اختر أطباقك وأضفها إلى طلبك ثم أرسله عبر واتساب." },

  // Lunch buffet (from the restaurant's poster). Switch the section on or off in Restaurant details.
  { key: "buffet.eyebrow", group: "Buffet", label: "Small label", en: "Limited time offer", ar: "عرض لفترة محدودة" },
  { key: "buffet.title", group: "Buffet", label: "Title", en: "Daily Lunch Buffet", ar: "بوفيه الغداء اليومي" },
  { key: "buffet.schedule", group: "Buffet", label: "Days and time", en: "Sunday to Wednesday, 12:30 PM to 3:30 PM", ar: "من الأحد إلى الأربعاء، من 12:30 ظهراً إلى 3:30 عصراً" },
  { key: "buffet.adultPrice", group: "Buffet", label: "Adult price", en: "SAR 32", ar: "32 ر.س" },
  { key: "buffet.kidsPrice", group: "Buffet", label: "Kids price", en: "SAR 23", ar: "23 ر.س" },
  { key: "buffet.adultRegular", group: "Buffet", label: "Adult regular price (shown crossed out; leave empty to hide)", en: "SAR 45", ar: "45 ر.س" },
  { key: "buffet.kidsRegular", group: "Buffet", label: "Kids regular price (shown crossed out; leave empty to hide)", en: "SAR 30", ar: "30 ر.س" },
  { key: "buffet.kidsAge", group: "Buffet", label: "Kids age note", en: "Kids 5 to 10 years", ar: "الأطفال من 5 إلى 10 سنوات" },
  { key: "buffet.note", group: "Buffet", label: "Small print", en: "Prices include VAT. Items are subject to change.", ar: "الأسعار شاملة الضريبة. الأصناف قابلة للتغيير." },
  { key: "buffet.salad", group: "Buffet", label: "Salad bar (one per line)", multiline: true, en: "Fresh green salad\nHummus\nTaboula\nMint sauce\nRaita\nPapad\nPickle", ar: "سلطة خضراء طازجة\nحمص\nتبولة\nصلصة النعناع\nرايتا\nباباد\nمخلل" },
  { key: "buffet.starters", group: "Buffet", label: "Starters (one per line)", multiline: true, en: "Chef special soup\nChicken spring roll\nChicken samosa\nChili potato\nGobi Manchurian\nChicken Alfredo pasta\nChicken 65\nChicken pakoda", ar: "شوربة الشيف الخاصة\nسبرنج رول دجاج\nسمبوسة دجاج\nبطاطا بالفلفل الحار\nقرنبيط منشوريا\nباستا ألفريدو بالدجاج\nدجاج 65\nباكودا دجاج" },
  { key: "buffet.bbq", group: "Buffet", label: "B.B.Q (one per line)", multiline: true, en: "Tandoori chicken\nFish tikka", ar: "دجاج تندوري\nسمك تكا" },
  { key: "buffet.main", group: "Buffet", label: "Main course (one per line)", multiline: true, en: "Chicken dum biryani\nChef special chicken curry\nPakistani nihari\nChicken fried rice\nZeera rice\nVegetable curry\nDaal tadka", ar: "دجاج دوم برياني\nكاري دجاج الشيف الخاص\nنهاري باكستاني\nأرز مقلي بالدجاج\nأرز بالكمون\nكاري خضار\nدال تاركا" },
  { key: "buffet.desserts", group: "Buffet", label: "Desserts (one per line)", multiline: true, en: "Shahi tukda\nSuji ka halwa\nJelly", ar: "شاهي توكرا\nحلوى السميد\nجيلي" },

  // Menu page notes (printed on the restaurant's menu)
  { key: "menu.note", group: "Menu page", label: "Note under the menu", en: "We use only Tanmiah fresh chicken. All prices include VAT.", ar: "نستخدم دجاج التنمية الطازج فقط. جميع الأسعار شاملة ضريبة القيمة المضافة." },

  // SEO
  { key: "seo.home.title", group: "SEO", label: "Home page title", en: "Al Jalsa Restaurant | Multi-Cuisine Restaurant in Al Murabba, Riyadh", ar: "مطعم الجلسة | مطعم متعدد المطابخ في المربع، الرياض" },
  {
    key: "seo.home.description", group: "SEO", label: "Home page description", multiline: true,
    en: "Tandoor grills, curries, biryani and Indo-Chinese dishes at Al Jalsa Restaurant on Ibn Al Nadeem Street, Al Murabba, Riyadh. See the menu, order on WhatsApp or ask about catering.",
    ar: "مشويات التندور والكاري والبرياني والأطباق الهندية الصينية في مطعم الجلسة بشارع ابن النديم، المربع، الرياض. تصفح القائمة واطلب عبر واتساب أو استفسر عن الضيافة.",
  },
];
