import Link from "next/link";
import Image from "next/image";
import { PRODUCTS } from "@/data/products";
import {
  Star,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import TrustBadges from "@/components/TrustBadges";
import Logo from "@/components/Logo";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Brand Hero Showcase */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-800 via-emerald-900 to-gray-900 text-white py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-5 flex flex-col items-center">
          {/* Centered Brand Emblem */}
          <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-lg">
            <Logo size="lg" isDark={true} />
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>منتجات عملية وحصرية بجودة مضمونة 🇲🇦</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            مرحباً بكم في <span className="text-green-400">PRATIKO MAROC</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            نوفر لكم أحدث الحلول المبتكرة للسيارة والمنزل مع ميزة{" "}
            <strong className="text-white">المعاينة قبل الدفع</strong> والتوصيل السريع إلى باب بيتكم.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-gray-200">
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
              <Truck className="w-4 h-4 text-green-400" /> توصيل 24/48 ساعة
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck className="w-4 h-4 text-green-400" /> الدفع كاش عند الاستلام
            </span>
            <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
              ⭐️ أكثر من 2,500 زبون راضٍ
            </span>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Featured Products Section */}
      <section className="max-w-4xl mx-auto py-10 px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase">
            عروض اليوم الحصرية
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            اختر منتجك واستفد من التخفيضات المميزة
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            الكميات محدودة جداً - اضغط على المنتج لإتمام الطلب في ثوانٍ
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRODUCTS.map((prod) => {
            const productHref = `/products/${prod.category}/${prod.slug}`;
            const discountPct = Math.round(
              ((prod.originalPrice - prod.promoPrice) / prod.originalPrice) * 100
            );

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Container with Badges */}
                <div className="relative h-56 sm:h-64 w-full bg-gradient-to-b from-gray-50 to-white overflow-hidden flex items-center justify-center border-b border-gray-100">
                  <Image
                    src={prod.images[0]}
                    alt={prod.title}
                    fill
                    quality={95}
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {prod.badge}
                    </span>
                    <span className="bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                      وفر {discountPct}%
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                        {prod.category === "auto" ? "السيارة والمنزل" : "أثاث المنزل"}
                      </span>
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-gray-800 mr-1">{prod.rating}</span>
                        <span className="text-gray-400 text-[11px]">({prod.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug mb-2">
                      <Link href={productHref}>{prod.title}</Link>
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {prod.subtitle}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-1.5 mb-5">
                      {prod.features.slice(0, 2).map((feat, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & CTA */}
                  <div>
                    <div className="flex items-baseline justify-between mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-2xl font-black text-green-700">
                          {prod.promoPrice} <span className="text-xs font-bold">درهم</span>
                        </span>
                        <span className="text-xs text-gray-400 line-through mr-2">
                          {prod.originalPrice} درهم
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        الدفع عند الاستلام
                      </span>
                    </div>

                    <Link
                      href={productHref}
                      className="w-full bg-[#00a650] hover:bg-[#008f45] text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-green-600/20 active:scale-95 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>اكتشف العرض واطلب الآن</span>
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
