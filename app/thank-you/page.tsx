"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "PRK-ORDER";
  const customerName = searchParams.get("name") || "زبوننا الكريم";
  const productTitle = searchParams.get("product") || "المنتج المطلوب";
  const total = searchParams.get("total") || "";
  const city = searchParams.get("city") || "المغرب";

  useEffect(() => {
    // Launch celebratory confetti
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
  }, []);

  const whatsappMessage = encodeURIComponent(
    `السلام عليكم، قمت للتو بطلب ${productTitle} برقم الطلب: ${orderId}. أرغب في تأكيد طلبيتي.`
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
            تم تسجيل طلبك بنجاح
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            شكراً لثقتكم بنا، {customerName}! 🎉
          </h1>

          {/* Key Moroccan COD Message Instruction */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 my-5 text-right shadow-xs">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black text-amber-950 mb-1">
                  الخطوة التالية (مهم جداً):
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-amber-900 leading-relaxed">
                  سنتصل بك هاتفياً خلال الساعات القادمة لتأكيد العنوان وموعد التوصيل قبل إرسال الطرد مع الموزع. المرجو إبقاء هاتفك قريباً منك.
                </p>
              </div>
            </div>
          </div>

          {/* Order Reference Box */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-right space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">رقم الطلب (Référence):</span>
              <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                {orderId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">المنتج:</span>
              <span className="font-bold text-gray-900">{productTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">المدينة:</span>
              <span className="font-bold text-gray-900">{city}</span>
            </div>
            {total && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-black">
                <span className="text-gray-800">المبلغ المطلوب عند الاستلام:</span>
                <span className="text-green-700 text-base">{total} درهم</span>
              </div>
            )}
          </div>

          {/* WhatsApp Direct Action Button */}
          <div className="mt-6 space-y-3">
            <a
              href={`https://wa.me/212600000000?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black py-3.5 px-6 rounded-2xl shadow-md shadow-green-500/20 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-transform active:scale-95"
            >
              <PhoneCall className="w-5 h-5" />
              <span>لتسريع المعالجة: أكد طلبك الآن عبر الواتساب</span>
            </a>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-xs font-bold text-gray-600 hover:text-green-700 py-2 transition-colors"
            >
              <span>العودة إلى الصفحة الرئيسية</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>

        {/* 4 Steps Timeline Card */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 text-right">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-green-600" />
            <span>مراحل وصول طلبيتك إليك:</span>
          </h3>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-green-600 text-white font-bold flex items-center justify-center shrink-0">
                ✓
              </div>
              <div>
                <p className="font-bold text-green-700">1. تسجيل الطلب بنجاح</p>
                <p className="text-gray-500 text-xs">تم حفظ بياناتك بنجاح في نظامنا.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 animate-pulse">
                2
              </div>
              <div>
                <p className="font-bold text-amber-800">2. اتصال هاتفي للتأكيد</p>
                <p className="text-gray-500 text-xs">سيتصل بك موظف خدمة العملاء للتأكد من العنوان.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 font-bold flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-gray-700">3. شحن الطرد للمنزل</p>
                <p className="text-gray-500 text-xs">تسليم سريع خلال 24 إلى 48 ساعة حتى باب بيتك.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 font-bold flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-gray-700">4. المعاينة والدفع كاش</p>
                <p className="text-gray-500 text-xs">افحص منتجك بيدك ثم ادفع نقداً بكل أمان.</p>
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
          جاري التحميل...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
