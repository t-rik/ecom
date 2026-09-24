"use client";

import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import HeroSection from "./HeroSection";
import BenefitCards from "./BenefitCards";
import TrustBadges from "./TrustBadges";
import OrderForm from "./OrderForm";
import FAQSection from "./FAQSection";
import StickyBottomBar from "./StickyBottomBar";
import { trackViewContent, trackPageView } from "@/lib/tracking";
import { useLanguage } from "@/context/LanguageContext";

interface ProductFunnelClientProps {
  product: Product;
}

export default function ProductFunnelClient({ product }: ProductFunnelClientProps) {
  const { language } = useLanguage();

  const title = language === "fr" && product.titleFr ? product.titleFr : product.title;

  // Pre-selected Option A default (1 unit)
  const defaultBundle =
    product.bundleOptions.find((b) => b.id === "1-unit") || product.bundleOptions[0];

  const [activePrice, setActivePrice] = useState(
    defaultBundle.price + defaultBundle.deliveryFee
  );
  const [isFreeDelivery, setIsFreeDelivery] = useState(defaultBundle.deliveryFee === 0);

  useEffect(() => {
    trackPageView();
    trackViewContent({
      id: product.id,
      name: title,
      price: product.promoPrice,
      category: product.category,
    });
  }, [product, title]);

  const handleBundleChange = (bundleId: string, totalPrice: number) => {
    const selected = product.bundleOptions.find((b) => b.id === bundleId);
    setActivePrice(totalPrice);
    setIsFreeDelivery(selected?.deliveryFee === 0);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* 2. Hero Section */}
      <HeroSection product={product} />

      {/* 3. Visual Features Section */}
      <BenefitCards product={product} />

      {/* 4. Moroccan Trust Badges */}
      <TrustBadges />

      {/* FAQ Reassurance Section with bilingual support */}
      <FAQSection faq={product.faq} faqFr={product.faqFr} />

      {/* 5. The Embedded COD Checkout Form */}
      <OrderForm product={product} onBundleChange={handleBundleChange} />

      {/* 5. Sticky Bottom Bar (Mobile only) */}
      <StickyBottomBar
        price={activePrice}
        productName={title}
        productId={product.id}
        isFreeDelivery={isFreeDelivery}
      />
    </div>
  );
}
