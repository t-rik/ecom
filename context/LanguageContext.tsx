"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "ar" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
}

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Top Bar
    urgency_bar: "🚚 توصيل سريع لجميع المدن المغربية | الدفع نقداً عند الاستلام بعد المعاينة",
    brand_slogan: "المتجر المغربي الموثوق 🇲🇦",
    customer_support: "خدمة الزبناء",
    quality_guarantee: "ضمان الجودة 100%",

    // Hero Section
    category_auto: "مستلزمات السيارات والمنزل",
    category_home: "أثاث وديكور المنزل",
    stock_left: "باقي {count} قطع فقط في المخزون!",
    save_amount: "توفير {amount} درهم",
    dh: "درهم",
    quick_cta: "اطلب الآن والدفع عند الاستلام",
    exclusive_offer_note: "عرض حصري متوفر الآن + إمكانية المعاينة قبل الأداء",

    // Benefits Section
    why_us: "لماذا يفضله زبناؤنا؟",
    key_features_title: "مميزات حصرية تجعل حياتك اليومية أسهل",
    specs_title: "أهم المواصفات والخصائص:",

    // Trust Badges
    trust_title: "تسوق بكل ثقة مع ضمان \"براتيكو ماروك\" 🇲🇦",
    trust_inspect_title: "معاينة المنتج قبل الدفع 🔍",
    trust_inspect_desc: "افتح الطرد وتأكد من جودة المنتج وسلامته قبل دفع أي درهم للموزع.",
    trust_delivery_title: "التوصيل حتى باب منزلك 🚪",
    trust_delivery_desc: "شحن سريع وآمن إلى جميع مدن وقرى المملكة في غضون 24-48 ساعة.",
    trust_exchange_title: "ضمان استبدال مجاني 🔄",
    trust_exchange_desc: "في حال وجود أي عيب أو مشكل، نقوم بتعويضك أو استبدال المنتج مجاناً وبسرعة.",

    // FAQ Section
    faq_badge: "الأسئلة الشائعة",
    faq_title: "كل ما تود معرفته قبل الطلب",

    // Order Form
    form_badge: "عرض حصري لفترة محدودة",
    form_title: "املأ الاستمارة وأكّد طلبك في ثوانٍ ⚡",
    form_subtitle: "الدفع نقداً عند الاستلام بعد معاينة المنتج 100%",
    form_step1: "1. اختر العرض المناسب لك:",
    form_step2: "2. معلومات التوصيل:",
    free_delivery: "توصيل مجاني 🎁",
    delivery_fee: "مصاريف التوصيل: {fee} درهم",
    full_name_label: "الاسم الكامل",
    full_name_placeholder: "",
    phone_label: "رقم الهاتف (WhatsApp)",
    phone_placeholder: "",
    phone_hint: "يجب أن يبدأ الرقم بـ 06 أو 07 للتواصل والتأكيد عبر الواتساب",
    city_label: "المدينة",
    address_label: "العنوان بالكامل",
    address_placeholder: "",
    order_summary_product: "سعر المنتج",
    order_summary_shipping: "تكلفة التوصيل:",
    order_summary_total: "المجموع الصافي:",
    submit_button: "🛒 تأكيد الطلب الآن - الدفع عند الاستلام",
    submitting: "جاري تسجيل وتأكيد الطلب...",
    no_card_needed: "لا تحتاج لبطاقة بنكية، الدفع نقداً عند استلام طلبيتك وفحصها",
    call_reassurance: "سنتصل بك هاتفياً لتأكيد العنوان قبل إرسال الموزع",

    // Validation Errors
    err_fullname: "المرجو إدخال الاسم الكامل (3 أحرف على الأقل)",
    err_phone: "يرجى إدخال رقم هاتف مغربي صحيح يبدأ بـ 06 أو 07 (مثال: 0612345678)",
    err_city: "المرجو اختيار مدينتك",
    err_address: "المرجو إدخال العنوان بالكامل (الحي، رقم الشارع، الإقامة...)",
    err_fill_required: "المرجو ملء جميع المعلومات (الاسم، الهاتف، والعنوان) بشكل صحيح لإتمام الطلب",

    // Sticky Bottom Bar
    sticky_price_label: "السعر الحالي:",
    sticky_free_delivery: "✨ توصيل بالمجان",
    sticky_cod: "الدفع عند الاستلام",
    sticky_cta: "اطلب الآن",
    sticky_whatsapp: "تواصل معنا",

    // Thank you page
    thank_badge: "تم تسجيل طلبك بنجاح",
    thank_title: "شكراً لثقتكم بنا، {name}! 🎉",
    thank_next_step_title: "الخطوة التالية (مهم جداً):",
    thank_next_step_desc: "سنتصل بك هاتفياً خلال الساعات القادمة لتأكيد العنوان وموعد التوصيل قبل إرسال الطرد مع الموزع. المرجو إبقاء هاتفك قريباً منك.",
    thank_order_ref: "رقم الطلب (Référence):",
    thank_product: "المنتج:",
    thank_city: "المدينة:",
    thank_total_due: "المبلغ المطلوب عند الاستلام:",
    thank_whatsapp_cta: "لتسريع المعالجة: أكد طلبك الآن عبر الواتساب",
    thank_back_home: "العودة إلى الصفحة الرئيسية",
    thank_timeline_title: "مراحل وصول طلبيتك إليك:",
    thank_step1: "1. تسجيل الطلب بنجاح",
    thank_step1_desc: "تم حفظ بياناتك بنجاح في نظامنا.",
    thank_step2: "2. اتصال هاتفي للتأكيد",
    thank_step2_desc: "سيتصل بك موظف خدمة العملاء للتأكد من العنوان.",
    thank_step3: "3. شحن الطرد للمنزل",
    thank_step3_desc: "تسليم سريع خلال 24 إلى 48 ساعة حتى باب بيتك.",
    thank_step4: "4. المعاينة والدفع كاش",
    thank_step4_desc: "افحص منتجك بيدك ثم ادفع نقداً بكل أمان.",

    // Footer
    footer_desc: "وجهتكم الأولى للتسوق الموثوق بالمغرب 🇲🇦",
    footer_whatsapp: "تواصل معنا عبر الواتساب",
    footer_inspect_title: "ضمان المعاينة",
    footer_inspect_desc: "يحق لك فتح الطرد والتأكد من تطابق المنتج قبل دفع ثمنه لعامل التوصيل.",
    footer_shipping_title: "شحن لجميع المدن",
    footer_shipping_desc: "توصيل آمن وسريع عبر شبكة موزعين معتمدين بجميع ربوع المملكة خلال 24-48 ساعة.",
    footer_support_title: "خدمة ما بعد البيع",
    footer_support_desc: "فريقنا رهن إشارتكم طيلة أيام الأسبوع لمساعدتكم والإجابة عن كل استفساراتكم.",
    footer_rights: "جميع الحقوق محفوظة.",

    // Homepage
    home_badge: "منتجات عملية وحصرية بجودة مضمونة 🇲🇦",
    home_welcome: "مرحباً بكم في",
    home_desc: "نوفر لكم أحدث الحلول المبتكرة للسيارة والمنزل مع ميزة المعاينة قبل الدفع والتوصيل السريع إلى باب بيتكم.",
    home_pill_shipping: "توصيل 24/48 ساعة",
    home_pill_cod: "الدفع كاش عند الاستلام",
    home_pill_clients: "أكثر من 2,500 زبون راضٍ",
    home_deals_badge: "عروض اليوم الحصرية",
    home_deals_title: "اختر منتجك واستفد من التخفيضات المميزة",
    home_deals_subtitle: "الكميات محدودة جداً - اضغط على المنتج لإتمام الطلب في ثوانٍ",
    home_card_cta: "اكتشف العرض واطلب الآن",
  },
  fr: {
    // Top Bar
    urgency_bar: "🚚 Livraison Rapide Partout au Maroc | Paiement Cash à la Livraison après Vérification",
    brand_slogan: "La Boutique Marocaine de Confiance 🇲🇦",
    customer_support: "Service Client",
    quality_guarantee: "Garantie Qualité 100%",

    // Hero Section
    category_auto: "Accessoires Auto & Maison",
    category_home: "Maison & Rangement",
    stock_left: "Plus que {count} pièces en stock !",
    save_amount: "Économisez {amount} DH",
    dh: "DH",
    quick_cta: "Commander Maintenant - Paiement à la Livraison",
    exclusive_offer_note: "Offre exclusive disponible + Possibilité de vérifier le colis avant paiement",

    // Benefits Section
    why_us: "Pourquoi nos clients l'adorent ?",
    key_features_title: "Des fonctionnalités qui simplifient votre quotidien",
    specs_title: "Caractéristiques principales :",

    // Trust Badges
    trust_title: "Achetez en toute sérénité avec la garantie Pratiko Maroc 🇲🇦",
    trust_inspect_title: "Vérification Avant Paiement 🔍",
    trust_inspect_desc: "Ouvrez votre colis et inspectez le produit avant de remettre l'argent au livreur.",
    trust_delivery_title: "Livraison à Domicile 🚪",
    trust_delivery_desc: "Expédition rapide et sécurisée dans toutes les villes du Royaume en 24 à 48 heures.",
    trust_exchange_title: "Échange Gratuit Garanti 🔄",
    trust_exchange_desc: "En cas de défaut, nous remplaçons le produit gratuitement et rapidement.",

    // FAQ Section
    faq_badge: "Questions Fréquentes",
    faq_title: "Tout ce que vous devez savoir avant de commander",

    // Order Form
    form_badge: "Offre Exclusive Limitée",
    form_title: "Remplissez le formulaire et confirmez en quelques secondes ⚡",
    form_subtitle: "Paiement 100% à la livraison après vérification du produit",
    form_step1: "1. Choisissez votre pack :",
    form_step2: "2. Coordonnées de livraison :",
    free_delivery: "Livraison Gratuite 🎁",
    delivery_fee: "Frais de livraison : {fee} DH",
    full_name_label: "Nom complet",
    full_name_placeholder: "",
    phone_label: "Numéro de téléphone (WhatsApp)",
    phone_placeholder: "",
    phone_hint: "Le numéro doit commencer par 06 ou 07 pour confirmation WhatsApp",
    city_label: "Ville",
    address_label: "Adresse complète",
    address_placeholder: "",
    order_summary_product: "Prix du produit",
    order_summary_shipping: "Frais de livraison :",
    order_summary_total: "Total à payer :",
    submit_button: "🛒 Confirmer la Commande - Paiement à la Réception",
    submitting: "Validation de votre commande en cours...",
    no_card_needed: "Aucune carte bancaire requise, paiement en espèces lors de la livraison",
    call_reassurance: "Nous vous appellerons pour confirmer l'adresse avant d'envoyer le livreur",

    // Validation Errors
    err_fullname: "Veuillez entrer votre nom complet (au moins 3 caractères)",
    err_phone: "Veuillez entrer un numéro marocain valide commençant par 06 ou 07",
    err_city: "Veuillez sélectionner votre ville",
    err_address: "Veuillez entrer votre adresse complète (au moins 3 caractères)",
    err_fill_required: "Veuillez remplir correctement tous les champs obligatoires (Nom, Téléphone, Adresse)",

    // Sticky Bottom Bar
    sticky_price_label: "Prix actuel :",
    sticky_free_delivery: "✨ Livraison Gratuite",
    sticky_cod: "Paiement à la livraison",
    sticky_cta: "Commander",
    sticky_whatsapp: "Contactez-nous",

    // Thank you page
    thank_badge: "Commande enregistrée avec succès",
    thank_title: "Merci pour votre confiance, {name} ! 🎉",
    thank_next_step_title: "Prochaine étape (Très important) :",
    thank_next_step_desc: "Notre service client vous contactera par téléphone dans les prochaines heures pour confirmer votre adresse et convenir de l'horaire de livraison. Veuillez garder votre téléphone à portée de main.",
    thank_order_ref: "Référence commande :",
    thank_product: "Produit :",
    thank_city: "Ville :",
    thank_total_due: "Montant à régler à la livraison :",
    thank_whatsapp_cta: "Pour accélérer le traitement : Confirmez sur WhatsApp",
    thank_back_home: "Retour à l'accueil",
    thank_timeline_title: "Étapes de livraison de votre colis :",
    thank_step1: "1. Commande enregistrée",
    thank_step1_desc: "Vos coordonnées ont bien été enregistrées dans notre système.",
    thank_step2: "2. Appel de confirmation",
    thank_step2_desc: "Un conseiller vous appelle pour vérifier l'adresse.",
    thank_step3: "3. Expédition à domicile",
    thank_step3_desc: "Livraison rapide sous 24 à 48 heures directement chez vous.",
    thank_step4: "4. Vérification & Paiement cash",
    thank_step4_desc: "Inspectez votre produit en main propre avant de régler.",

    // Footer
    footer_desc: "Votre destination N°1 pour un shopping de confiance au Maroc 🇲🇦",
    footer_whatsapp: "Contactez-nous sur WhatsApp",
    footer_inspect_title: "Garantie Inspection",
    footer_inspect_desc: "Vous avez le droit d'ouvrir le colis et de vérifier le produit avant tout paiement.",
    footer_shipping_title: "Livraison Toutes Villes",
    footer_shipping_desc: "Livraison sécurisée partout au Maroc en 24-48h via transporteurs agréés.",
    footer_support_title: "Service Après-Vente",
    footer_support_desc: "Notre équipe est à votre disposition 7j/7 pour vous assister.",
    footer_rights: "Tous droits réservés.",

    // Homepage
    home_badge: "Produits Pratiques & Innovants - Qualité Garantie 🇲🇦",
    home_welcome: "Bienvenue chez",
    home_desc: "Découvrez les meilleures solutions pour votre voiture et votre maison avec vérification du colis avant paiement et livraison rapide.",
    home_pill_shipping: "Livraison 24/48h",
    home_pill_cod: "Paiement Cash à la Livraison",
    home_pill_clients: "Plus de 2 500 clients satisfaits",
    home_deals_badge: "Offres Exclusives du Jour",
    home_deals_title: "Choisissez votre produit et profitez de réductions",
    home_deals_subtitle: "Stock très limité - Cliquez sur le produit pour commander en quelques secondes",
    home_card_cta: "Découvrir l'offre et commander",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "ar",
  setLanguage: () => {},
  dir: "rtl",
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  useEffect(() => {
    // 1. Check for manual user choice in localStorage
    const saved = localStorage.getItem("pratiko_lang") as Language | null;
    if (saved && (saved === "ar" || saved === "fr")) {
      setLanguageState(saved);
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = saved;
      return;
    }

    // 2. Detect phone / browser language automatically
    if (typeof navigator !== "undefined" && navigator.language) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("fr")) {
        setLanguageState("fr");
        document.documentElement.dir = "ltr";
        document.documentElement.lang = "fr";
        return;
      }
    }

    // 3. Default fallback to Arabic (primary COD language)
    setLanguageState("ar");
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("pratiko_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
