"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ArrowDown, ArrowUp } from "lucide-react";
import { trackInitiateCheckout, trackWhatsAppClick } from "@/lib/tracking";
import { useLanguage } from "@/context/LanguageContext";
import { getWhatsAppLink } from "@/lib/constants";

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
  const { t, language } = useLanguage();
  const [isOrderCtaVisible, setIsOrderCtaVisible] = useState(true);
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");

  useEffect(() => {
    const formElement = document.getElementById("order-form");
    if (!formElement) return;

    let ticking = false;
    let isBelowFormState = false;

    const updateVisibility = () => {
      const rect = formElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 1. Above the form: top of the form is below the middle of viewport
      const isAboveForm = rect.top > windowHeight * 0.45;

      // 2. Below the form with hysteresis:
      // When scrolling up from below, keep the button visible until the form occupies at least 70% of the viewport (submit button centered).
      // When scrolling down past the form, reveal the button once the form has mostly left the screen (upper 25%).
      if (isBelowFormState) {
        if (rect.bottom >= windowHeight * 0.7 || isAboveForm) {
          isBelowFormState = false;
        }
      } else {
        if (rect.bottom < windowHeight * 0.25 && !isAboveForm) {
          isBelowFormState = true;
        }
      }

      if (isAboveForm) {
        setIsOrderCtaVisible(true);
        setScrollDirection("down");
      } else if (isBelowFormState) {
        setIsOrderCtaVisible(true);
        setScrollDirection("up");
      } else {
        // User is viewing / filling the form: fade out sticky button
        setIsOrderCtaVisible(false);
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateVisibility();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const whatsappMessage =
    language === "fr"
      ? `Bonjour, je souhaite commander ${productName || "le produit"}. J'aimerais avoir plus d'informations / confirmer ma commande.`
      : `السلام عليكم، بغيت نطلب ${productName || "المنتج"}، عافاك بغيت معلومات / نأكد الطلب`;

  const whatsappUrl = getWhatsAppLink(whatsappMessage);

  const handleWhatsAppClick = () => {
    trackWhatsAppClick(productName, price);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3.5 py-3 pointer-events-none">
      <div className="max-w-md mx-auto flex items-center gap-2" dir="ltr">
        {/* WhatsApp Button (Permanent on Bottom Left) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          aria-label={t("sticky_whatsapp")}
          className="pointer-events-auto bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold py-3.5 px-3.5 rounded-2xl shadow-xl shadow-green-500/25 flex items-center justify-center gap-1.5 transition-all text-xs shrink-0 cursor-pointer border border-green-400/30"
        >
          <svg
            className="w-5 h-5 fill-current shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.021.577 1.899.882 2.806.882h.005c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.765-5.768-5.765zm3.385 8.167c-.145.408-.847.781-1.183.83-.336.049-.757.067-2.457-.636-1.996-.826-3.262-2.853-3.361-2.985-.099-.133-.812-1.08-.812-2.062 0-.983.513-1.468.696-1.667.182-.198.397-.248.529-.248.132 0 .265.002.38.008.124.006.29-.047.455.347.165.397.562 1.372.612 1.472.05.099.083.215.016.347-.066.133-.1.215-.198.33-.099.116-.208.26-.297.348-.1.099-.204.207-.088.406.116.199.516.852 1.109 1.381.764.68 1.408.89 1.607.99.198.099.314.083.43-.05.115-.132.496-.578.628-.776.132-.199.264-.165.446-.099.182.066 1.157.545 1.356.645.198.099.33.149.38.231.05.083.05.479-.095.887z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.307C8.423 21.523 10.15 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.666 0-3.23-.497-4.551-1.352l-.326-.211-2.966.778.792-2.893-.232-.37C3.79 14.73 3.833 13.39 3.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
          </svg>
          <span className="whitespace-nowrap">{t("sticky_whatsapp")}</span>
        </a>

        {/* Main Order CTA Button on the right (fades out smoothly when on form, points up when below form) */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isOrderCtaVisible
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={handleScrollToForm}
            className="w-full bg-[#00a650] hover:bg-[#008f45] text-white font-black py-3.5 px-3 rounded-2xl shadow-xl shadow-green-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm sm:text-base cursor-pointer border border-green-500/30"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="whitespace-nowrap">{t("sticky_cta")}</span>
            {scrollDirection === "up" ? (
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 animate-bounce" />
            ) : (
              <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 animate-bounce" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
