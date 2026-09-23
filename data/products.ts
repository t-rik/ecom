export interface BundleOption {
  id: string;
  name: string;
  quantity: number;
  price: number;
  originalPrice: number;
  deliveryFee: number;
  savings: number;
  badge?: string;
  isPopular?: boolean;
}

export interface ProductFeature {
  title: string;
  description: string;
  iconName: string;
}

export interface Product {
  id: string;
  category: string;
  slug: string;
  title: string;
  subtitle: string;
  originalPrice: number;
  promoPrice: number;
  bundlePrice: number;
  bundleSavings: number;
  deliveryFee: number;
  freeDeliveryOnBundle: boolean;
  rating: number;
  reviewCount: number;
  stockLeft: number;
  badge: string;
  images: string[];
  features: string[];
  featureCards: ProductFeature[];
  bundleOptions: BundleOption[];
  faq: { q: string; a: string }[];
}

export const CITIES_LIST = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "Mohammedia",
  "El Jadida",
  "Autre ville",
] as const;

export type MoroccanCity = (typeof CITIES_LIST)[number];

export const PRODUCTS: Product[] = [
  {
    id: "vacuum-01",
    category: "auto",
    slug: "aspirateur-sans-fil",
    title: "المكنسة اللاسلكية الذكية المحمولة للسيارة والمنزل",
    subtitle: "قوة شفط جبارة لتنظيف أدق الأماكن في سيارتك ومنزلك بكل سهولة وبدون أسلاك",
    originalPrice: 299,
    promoPrice: 189,
    bundlePrice: 319,
    bundleSavings: 59, // 189*2 = 378 - 319 = 59 DH savings
    deliveryFee: 35,
    freeDeliveryOnBundle: true,
    rating: 4.9,
    reviewCount: 1420,
    stockLeft: 12,
    badge: "الأكثر مبيعاً بالمغرب 🏆",
    images: [
      "/images/vacuum/vacuum-1.jpg",
      "/images/vacuum/vacuum-2.jpg",
      "/images/vacuum/vacuum-3.jpg",
      "/images/vacuum/vacuum-4.jpg",
      "/images/vacuum/vacuum-6.jpg",
    ],
    features: [
      "قوة شفط فائقة للأتربة وبقايا الطعام في أصغر الزوايا",
      "بطارية ليثيوم تدوم طويلاً وقابلة للشحن السريع عبر USB",
      "خفيفة الوزن، لاسلكية وسهلة التخزين في درج السيارة",
    ],
    featureCards: [
      {
        title: "شفط فائق بقوة التوربو",
        description: "محرك ياباني قوي يشفط كل الأتربة، الرمل، وبقايا المأكولات حتى في الأماكن الضيقة بين المقاعد.",
        iconName: "Zap",
      },
      {
        title: "بطارية ليثيوم سريعة الشحن",
        description: "شحن سريع عبر Type-C يدوم لعدة دورات تنظيف كاملة للسيارة والمنزل دون انقطاع.",
        iconName: "BatteryCharging",
      },
      {
        title: "ملحقات متعددة الاستخدام",
        description: "تأتي برؤوس متنوعة للتنظيف الجاف والفرشاة الهوائية للأسطح الحساسة وشاشات لوحة القيادة.",
        iconName: "Wrench",
      },
    ],
    bundleOptions: [
      {
        id: "1-unit",
        name: "1 قطعة (عرض فردي)",
        quantity: 1,
        price: 189,
        originalPrice: 299,
        deliveryFee: 35,
        savings: 110,
        badge: "تخفيض 37%",
        isPopular: false,
      },
      {
        id: "2-units",
        name: "2 قطع (العرض العائلي للسيارة والمنزل)",
        quantity: 2,
        price: 319,
        originalPrice: 598,
        deliveryFee: 0,
        savings: 279,
        badge: "الأكثر طلباً - وفر 60 درهم + توصيل مجاني",
        isPopular: true,
      },
    ],
    faq: [
      {
        q: "هل يمكنني معاينة المنتج قبل الدفع؟",
        a: "نعم بالتأكيد! نحن نوفر ميزة فتح ومعاينة الطرد عند وصول الموزع إلى باب بيتك والتأكد من جودة المنتج قبل تسليم أي مبلغ.",
      },
      {
        q: "كم تستغرق مدة التوصيل؟",
        a: "التوصيل يتم خلال 24 إلى 48 ساعة كحد أقصى بجميع المدن المغربية الكبرى والمتوسطة.",
      },
      {
        q: "ماذا لو وجدت عيباً أو مشكلة بالمنتج؟",
        a: "نوفر لك ضمان استبدال فوري مجاني أو استرجاع بدون أي تعقيدات عبر خدمة عملائنا على الواتساب.",
      },
    ],
  },
  {
    id: "shoe-cabinet-01",
    category: "maison",
    slug: "armoire-chaussures",
    title: "خزانة الأحذية العصرية المقاومة للغبار",
    subtitle: "تنظيم أنيق وعصري يحمي أحذيتك من الغبار والأوساخ ويوفر مساحة مدخل منزلك",
    originalPrice: 399,
    promoPrice: 279,
    bundlePrice: 469,
    bundleSavings: 89, // 279*2 = 558 - 469 = 89 DH savings
    deliveryFee: 35,
    freeDeliveryOnBundle: true,
    rating: 4.9,
    reviewCount: 1180,
    stockLeft: 9,
    badge: "عرض محدود اليوم فقط ⏳",
    images: [
      "/images/shoe-cabinet/cabinet-1.svg",
      "/images/shoe-cabinet/cabinet-2.svg",
      "/images/shoe-cabinet/cabinet-3.svg",
    ],
    features: [
      "أبواب شفافة مغناطيسية تمنع دخول الغبار بالكامل",
      "تركيب سريع وسهل في أقل من دقيقتين بدون أي أدوات",
      "تصميم متين قابل للطي ومقاوم للرطوبة والأوزان الثقيلة",
    ],
    featureCards: [
      {
        title: "حماية مغناطيسية محكمة",
        description: "أبواب شفافة بنظام إغلاق مغناطيسي ذكي لعزل الغبار والروائح والحفاظ على نظافة أحذيتك.",
        iconName: "ShieldCheck",
      },
      {
        title: "تركيب فوري بدون أدوات",
        description: "هيكل متطور قابل للطي جاهز للاستخدام في 60 ثانية بدون الحاجة إلى مسامير أو مفكات.",
        iconName: "Clock",
      },
      {
        title: "صلابة واستيعاب واسع",
        description: "بلاستيك مقوى PP عالي الجودة يتحمل الأوزان الثقيلة ويوفر مساحة تتسع لأكثر من 12 إلى 18 حذاء.",
        iconName: "Layers",
      },
    ],
    bundleOptions: [
      {
        id: "1-unit",
        name: "1 قطعة (خزانة واحدة)",
        quantity: 1,
        price: 279,
        originalPrice: 399,
        deliveryFee: 35,
        savings: 120,
        badge: "تخفيض 30%",
        isPopular: false,
      },
      {
        id: "2-units",
        name: "2 قطع (المجموعة المزدوجة)",
        quantity: 2,
        price: 469,
        originalPrice: 798,
        deliveryFee: 0,
        savings: 329,
        badge: "الأكثر طلباً - وفر 90 درهم + توصيل مجاني",
        isPopular: true,
      },
    ],
    faq: [
      {
        q: "هل التركيب يحتاج لمعلم أو أدوات؟",
        a: "أبداً! الخزانة تأتي بتصميم متكامل قابل للسحب والفتح في دقيقة واحدة ومرفقة بدليل مبسط.",
      },
      {
        q: "هل المنتج مقاوم للأوزان والكسر؟",
        a: "نعم، مصنوعة من بوليمر البولي بروبيلين المقوى ذو المتانة العالية المقاوم للصدمات والرطوبة.",
      },
      {
        q: "كيف تتم عملية الدفع؟",
        a: "الدفع نقداً 100% عند الاستلام بعد فحص الخزانة والتأكد من سلامتها بين يديك.",
      },
    ],
  },
];

export function getProductBySlug(category: string, slug: string): Product | undefined {
  return PRODUCTS.find(
    (p) => p.category.toLowerCase() === category.toLowerCase() && p.slug.toLowerCase() === slug.toLowerCase()
  );
}

export function getAllProductPaths() {
  return PRODUCTS.map((product) => ({
    category: product.category,
    name: product.slug,
  }));
}
