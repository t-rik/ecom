export interface BundleOption {
  id: string;
  name: string;
  nameFr?: string;
  quantity: number;
  price: number;
  originalPrice: number;
  deliveryFee: number;
  savings: number;
  badge?: string;
  badgeFr?: string;
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
  titleFr: string;
  subtitle: string;
  subtitleFr: string;
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
  badgeFr: string;
  images: string[];
  features: string[];
  featuresFr: string[];
  featureCards: ProductFeature[];
  featureCardsFr: ProductFeature[];
  bundleOptions: BundleOption[];
  faq: { q: string; a: string }[];
  faqFr: { q: string; a: string }[];
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
    titleFr: "Aspirateur Sans Fil Intelligent Portable pour Voiture et Maison",
    subtitle: "قوة شفط جبارة لتنظيف أدق الأماكن في سيارتك ومنزلك بكل سهولة وبدون أسلاك",
    subtitleFr: "Puissance d'aspiration maximale pour nettoyer les moindres recoins de votre voiture et maison en toute liberté",
    originalPrice: 299,
    promoPrice: 189,
    bundlePrice: 319,
    bundleSavings: 59,
    deliveryFee: 35,
    freeDeliveryOnBundle: true,
    rating: 4.9,
    reviewCount: 1420,
    stockLeft: 12,
    badge: "الأكثر مبيعاً بالمغرب 🏆",
    badgeFr: "Top Vente au Maroc 🏆",
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
    featuresFr: [
      "Aspiration haute performance pour poussières et débris dans les coins étroits",
      "Batterie lithium longue autonomie rechargeable rapidement via USB",
      "Ultra-léger, compact et facile à ranger dans la boîte à gants",
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
    featureCardsFr: [
      {
        title: "Aspiration Puissance Turbo",
        description: "Moteur puissant qui élimine sable, miettes et poussières même entre les fentes des sièges.",
        iconName: "Zap",
      },
      {
        title: "Batterie Lithium & Recharge Type-C",
        description: "Charge rapide universelle offrant une autonomie prolongée pour un nettoyage complet.",
        iconName: "BatteryCharging",
      },
      {
        title: "Embouts Multi-Fonctions Inclus",
        description: "Livré avec suceur plat, brosse et embout souffleur pour dépoussiérer les recoins délicats.",
        iconName: "Wrench",
      },
    ],
    bundleOptions: [
      {
        id: "1-unit",
        name: "1 قطعة (عرض فردي)",
        nameFr: "1 Pièce (Pack Individuel)",
        quantity: 1,
        price: 189,
        originalPrice: 299,
        deliveryFee: 35,
        savings: 110,
        badge: "تخفيض 37%",
        badgeFr: "-37% Réduction",
        isPopular: false,
      },
      {
        id: "2-units",
        name: "2 قطع (العرض العائلي للسيارة والمنزل)",
        nameFr: "2 Pièces (Pack Famille Voiture + Maison)",
        quantity: 2,
        price: 319,
        originalPrice: 598,
        deliveryFee: 0,
        savings: 279,
        badge: "الأكثر طلباً - وفر 60 درهم + توصيل مجاني",
        badgeFr: "Le Plus Demandé - Économisez 60 DH + Livraison Gratuite",
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
    faqFr: [
      {
        q: "Puis-je vérifier le produit avant de payer ?",
        a: "Absolument ! Vous avez le droit d'ouvrir le colis et de tester le produit devant le livreur avant de remettre l'argent.",
      },
      {
        q: "Quel est le délai de livraison ?",
        a: "La livraison s'effectue en 24 à 48 heures ouvrées partout au Maroc.",
      },
      {
        q: "Que faire en cas de problème avec le produit ?",
        a: "Nous assurons un échange immédiat gratuit ou remboursement sans complications via notre support WhatsApp.",
      },
    ],
  },
  {
    id: "shoe-cabinet-01",
    category: "maison",
    slug: "armoire-chaussures",
    title: "خزانة الأحذية العصرية المقاومة للغبار",
    titleFr: "Armoire à Chaussures Moderne Anti-Poussière Pliable",
    subtitle: "تنظيم أنيق وعصري يحمي أحذيتك من الغبار والأوساخ ويوفر مساحة مدخل منزلك",
    subtitleFr: "Rangement moderne et élégant protégeant vos chaussures de la poussière avec montage rapide sans outils",
    originalPrice: 399,
    promoPrice: 279,
    bundlePrice: 469,
    bundleSavings: 89,
    deliveryFee: 35,
    freeDeliveryOnBundle: true,
    rating: 4.9,
    reviewCount: 1180,
    stockLeft: 9,
    badge: "عرض محدود اليوم فقط ⏳",
    badgeFr: "Offre Limitée Aujourd'hui ⏳",
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
    featuresFr: [
      "Portes magnétiques transparentes anti-poussière et anti-odeurs",
      "Montage express en moins de 2 minutes sans vis ni outils",
      "Structure pliable ultra-robuste supportant les charges lourdes",
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
    featureCardsFr: [
      {
        title: "Fermeture Magnétique Étanche",
        description: "Portes transparentes magnétiques qui isolent la poussière et préservent vos chaussures impeccables.",
        iconName: "ShieldCheck",
      },
      {
        title: "Assemblage en 60 Secondes",
        description: "Structure monobloc dépliable instantanément, sans aucun outil ni vis à monter.",
        iconName: "Clock",
      },
      {
        title: "Grande Capacité Robuste",
        description: "Polymère PP renforcé capable de supporter de lourdes charges, capacité de 12 à 18 paires.",
        iconName: "Layers",
      },
    ],
    bundleOptions: [
      {
        id: "1-unit",
        name: "1 قطعة (خزانة واحدة)",
        nameFr: "1 Pièce (Armoire Seule)",
        quantity: 1,
        price: 279,
        originalPrice: 399,
        deliveryFee: 35,
        savings: 120,
        badge: "تخفيض 30%",
        badgeFr: "-30% Réduction",
        isPopular: false,
      },
      {
        id: "2-units",
        name: "2 قطع (المجموعة المزدوجة)",
        nameFr: "2 Pièces (Pack Duo Double Rangement)",
        quantity: 2,
        price: 469,
        originalPrice: 798,
        deliveryFee: 0,
        savings: 329,
        badge: "الأكثر طلباً - وفر 90 درهم + توصيل مجاني",
        badgeFr: "Le Plus Demandé - Économisez 90 DH + Livraison Gratuite",
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
    faqFr: [
      {
        q: "Le montage nécessite-t-il des outils ?",
        a: "Non, absolument pas ! L'armoire se déplie et s'enclenche en une minute chrono.",
      },
      {
        q: "Le meuble est-il solide et résistant ?",
        a: "Oui, fabriqué en polypropylène renforcé de haute densité résistant aux chocs et à l'humidité.",
      },
      {
        q: "Comment se déroule le paiement ?",
        a: "Paiement 100% en espèces à la livraison après avoir inspecté le colis en main propre.",
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
