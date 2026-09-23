"use client";

import { Product } from "@/data/products";
import ImageGallery from "./ImageGallery";
import { ShoppingCart, CheckCircle, Flame, ArrowDown } from "lucide-react";
import { trackInitiateCheckout } from "@/lib/tracking";
import { useLanguage } from "@/context/LanguageContext";

interface HeroSectionProps {
  product: Product;
}

export default function HeroSection({ product }: HeroSectionProps) {
  const { language, t } = useLanguage();

  const title = language === "fr" && product.titleFr ? product.titleFr : product.title;
  const subtitle = language === "fr" && product.subtitleFr ? product.subtitleFr : product.subtitle;
  const badge = language === "fr" && product.badgeFr ? product.badgeFr : product.badge;

  const discountPercentage = Math.round(
    ((product.originalPrice - product.promoPrice) / product.originalPrice) * 100
  );

  const handleCtaClick = () => {
    trackInitiateCheckout({
      id: product.id,
      name: title,
      price: product.promoPrice,
      category: product.category,
      quantity: 1,
    });

    const formElement = document.getElementById("order-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-white pb-8 pt-4 px-4 border-b border-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* Responsive Desktop 2-column / Mobile 1-column layout */}
        <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-10 md:items-start">
          {/* Gallery Column (Desktop: 5 cols, Mobile: centered compact) */}
          <div className="md:col-span-5 md:sticky md:top-24 mb-4 md:mb-0">
            <ImageGallery
              images={product.images}
              productTitle={title}
              badge={badge}
              discountPercentage={discountPercentage}
            />
          </div>

          {/* Product Details Column (Desktop: 7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-start">
            {/* Category tag & Stock Urgency */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200 uppercase tracking-wide">
                {product.category === "auto" ? t("category_auto") : t("category_home")}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                <span>{t("stock_left").replace("{count}", String(product.stockLeft))}</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
              {title}
            </h1>

            {/* Subtitle / Value proposition */}
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 bg-gray-50/90 p-3 rounded-xl border border-gray-100">
              {subtitle}
            </p>

            {/* Pricing Box */}
            <div className="bg-gradient-to-br from-green-50/70 to-emerald-50/40 p-4 rounded-2xl border border-green-200/80 mb-5 shadow-xs">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-green-700 tracking-tight">
                    {product.promoPrice} <span className="text-lg font-bold">{t("dh")}</span>
                  </span>
                  <span className="text-base sm:text-lg text-gray-400 line-through">
                    {product.originalPrice} {t("dh")}
                  </span>
                </div>
                <span className="bg-rose-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                  {t("save_amount").replace(
                    "{amount}",
                    String(product.originalPrice - product.promoPrice)
                  )}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-green-800 font-semibold">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{t("exclusive_offer_note")}</span>
              </div>
            </div>

            {/* Quick Jump CTA Button */}
            <button
              onClick={handleCtaClick}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-700 hover:to-green-700 text-white text-base sm:text-lg font-black py-4 px-6 rounded-2xl shadow-lg shadow-green-600/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
            >
              <ShoppingCart className="w-6 h-6 animate-bounce" />
              <span>{t("quick_cta")}</span>
              <ArrowDown className="w-5 h-5 opacity-80 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

