"use client";

import Link from "next/link";
import { Truck, ShieldCheck, PhoneCall, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      {/* 1. Sticky Top Urgency & Value Bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 text-white text-xs sm:text-sm font-bold py-2.5 px-4 text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <Truck className="w-4 h-4 shrink-0 animate-bounce" />
          <span className="leading-tight">
            🚚 توصيل سريع لجميع المدن المغربية | الدفع نقداً عند الاستلام بعد المعاينة
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-green-600/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-green-700 transition-colors">
              PRATIKO <span className="text-green-600 text-base font-bold">MAROC</span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium -mt-1">
              المتجر المغربي الموثوق 🇲🇦
            </span>
          </div>
        </Link>

        {/* Reassurance pills */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ضمان الجودة 100%</span>
          </div>
          <a
            href="https://wa.me/212600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-green-600 bg-gray-50 hover:bg-green-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-green-300 transition-all"
            aria-label="WhatsApp Support"
          >
            <PhoneCall className="w-3.5 h-3.5 text-green-600" />
            <span className="hidden xs:inline">خدمة الزبناء</span>
          </a>
        </div>
      </div>
    </header>
  );
}
