"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ArrowDown } from "lucide-react";
import { trackInitiateCheckout } from "@/lib/tracking";
import { useLanguage } from "@/context/LanguageContext";

interface StickyBottomBarProps {
  price?: number;
  productName?: string;
  productId?: string;
  isFreeDelivery?: boolean;
}

export default function StickyBottomBar({
  price = 0,
  productName = "",
  productId = "",
}: StickyBottomBarProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const formElement = document.getElementById("order-form");
    const footerElement = document.querySelector("footer");

    const observer = new IntersectionObserver(
      (entries) => {
        // Disappear when either order-form or footer is in view
        const isFormOrFooterVisible = entries.some((entry) => entry.isIntersecting);
        setIsVisible(!isFormOrFooterVisible);
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    if (formElement) observer.observe(formElement);
    if (footerElement) observer.observe(footerElement);

    return () => observer.disconnect();
  }, []);

  const handleScrollToForm = () => {
    if (productId && productName) {
      trackInitiateCheckout({
        id: productId,
        name: productName,
        price: price,
        quantity: 1,
      });
    }

    const formElement = document.getElementById("order-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out md:hidden ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={handleScrollToForm}
          className="w-full bg-[#00a650] hover:bg-[#008f45] text-white font-black py-3.5 px-6 rounded-2xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all text-base cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 animate-bounce" />
          <span>{t("sticky_cta")}</span>
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
