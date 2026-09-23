"use client";

import { ShoppingBag, ArrowDown } from "lucide-react";
import { trackInitiateCheckout } from "@/lib/tracking";

interface StickyBottomBarProps {
  price: number;
  productName: string;
  productId: string;
  isFreeDelivery?: boolean;
}

export default function StickyBottomBar({
  price,
  productName,
  productId,
  isFreeDelivery = true,
}: StickyBottomBarProps) {
  const handleScrollToForm = () => {
    trackInitiateCheckout({
      id: productId,
      name: productName,
      price: price,
      quantity: 1,
    });

    const formElement = document.getElementById("order-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Price and badge */}
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-500 font-medium">السعر الحالي:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-green-700">{price}</span>
            <span className="text-xs font-bold text-gray-700">درهم</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold -mt-0.5">
            {isFreeDelivery ? "✨ توصيل بالمجان" : "الدفع عند الاستلام"}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleScrollToForm}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black py-3 px-4 rounded-xl shadow-md shadow-green-600/30 flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm"
        >
          <ShoppingBag className="w-4 h-4 animate-bounce" />
          <span>اطلب الآن</span>
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
