"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  PhoneCall,
  Truck,
  PackageCheck,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getWhatsAppLink } from "@/lib/constants";
import { trackPurchase, trackWhatsAppClick } from "@/lib/tracking";

function ThankYouContent() {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const customerName = searchParams.get("name") || "";
  const productTitle = searchParams.get("product") || "";
  const total = searchParams.get("total") || "";
  const city = searchParams.get("city") || "";

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Session authorization check: ensure user actually placed an order in this session
    const storedSession =
      typeof window !== "undefined" ? sessionStorage.getItem("valid_order_session") : null;

    if (!orderId || !storedSession || storedSession !== orderId) {
      // Fake order ID or shared link: immediately redirect to home page
      router.replace("/");
      return;
    }

    setIsAuthorized(true);

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#16a34a", "#22c55e", "#f59e0b", "#3b82f6"],
      });
    } catch {
      // safe fallback
    }

    // Deduplicated Meta Pixel & TikTok Purchase tracking
    const deduplicationKey = `pratiko_tracked_order_${orderId}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(deduplicationKey)) {
      trackPurchase({
        orderId,
        value: Number(total) || 189,
        currency: "MAD",
        items: [
          {
            id: "aspirateur-sans-fil",
            name: productTitle || "Aspirateur Sans Fil",
            quantity: 1,
            price: Number(total) || 189,
          },
        ],
      });
      sessionStorage.setItem(deduplicationKey, "true");
      sessionStorage.removeItem("pratiko_checkout_initiated");
    }
  }, [orderId, total, productTitle, router]);

  if (!isAuthorized) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  const whatsappUrl = getWhatsAppLink(
    `Bonjour, je viens de commander ${productTitle} avec le N° de commande: ${orderId}. Je souhaite confirmer ma livraison.`
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Main Success Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200/80 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-green-100 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-100 rounded-full blur-2xl pointer-events-none" />

          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50 shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-green-600 animate-pulse" />
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            {t("thank_badge")}
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            {t("thank_title").replace("{name}", customerName || "")}
          </h1>

          {/* Key Moroccan COD Message Instruction */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 my-5 text-start shadow-xs">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black text-amber-950 mb-1">
                  {t("thank_next_step_title")}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-amber-900 leading-relaxed">
                  {t("thank_next_step_desc")}
                </p>
              </div>
            </div>
          </div>

          {/* Order Reference Box */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-start space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">{t("thank_order_ref")}</span>
              <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                {orderId}
              </span>
            </div>
            {productTitle && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">{t("thank_product")}</span>
                <span className="font-bold text-gray-900">{productTitle}</span>
              </div>
            )}
            {city && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">{t("thank_city")}</span>
                <span className="font-bold text-gray-900">{city}</span>
              </div>
            )}
            {total && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-black">
                <span className="text-gray-800">{t("thank_total_due")}</span>
                <span className="text-green-700 text-base">
                  {total} {t("dh")}
                </span>
              </div>
            )}
          </div>

          {/* WhatsApp Direct Action Button */}
          <div className="mt-6 space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick(productTitle, Number(total) || undefined)}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black py-3.5 px-6 rounded-2xl shadow-md shadow-green-500/20 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-transform active:scale-95"
            >
              <PhoneCall className="w-5 h-5" />
              <span>{t("thank_whatsapp_cta")}</span>
            </a>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-xs font-bold text-gray-600 hover:text-green-700 py-2 transition-colors"
            >
              <span>{t("thank_back_home")}</span>
              <ArrowRight
                className={`w-4 h-4 ${dir === "rtl" ? "rotate-180" : ""}`}
              />
            </Link>
          </div>
        </div>

        {/* 4 Steps Timeline Card */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 text-start">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-green-600" />
            <span>{t("thank_timeline_title")}</span>
          </h3>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-green-600 text-white font-bold flex items-center justify-center shrink-0">
                ✓
              </div>
              <div>
                <p className="font-bold text-green-700">{t("thank_step1")}</p>
                <p className="text-gray-500 text-xs">{t("thank_step1_desc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 animate-pulse">
                2
              </div>
              <div>
                <p className="font-bold text-amber-800">{t("thank_step2")}</p>
                <p className="text-gray-500 text-xs">{t("thank_step2_desc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 font-bold flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-gray-700">{t("thank_step3")}</p>
                <p className="text-gray-500 text-xs">{t("thank_step3_desc")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 font-bold flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-gray-700">{t("thank_step4")}</p>
                <p className="text-gray-500 text-xs">{t("thank_step4_desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-gray-500">
          Loading...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
