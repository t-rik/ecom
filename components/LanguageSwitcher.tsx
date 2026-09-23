"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-gray-100/90 hover:bg-gray-200/80 p-0.5 rounded-full border border-gray-200 transition-colors shadow-2xs">
      <button
        type="button"
        onClick={() => setLanguage("ar")}
        className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          language === "ar"
            ? "bg-white text-green-700 shadow-xs scale-102"
            : "text-gray-500 hover:text-gray-900"
        }`}
        aria-label="Changer vers Arabe"
      >
        <span>🇲🇦</span>
        <span>العربية</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage("fr")}
        className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          language === "fr"
            ? "bg-white text-green-700 shadow-xs scale-102"
            : "text-gray-500 hover:text-gray-900"
        }`}
        aria-label="Switch to French"
      >
        <span>🇫🇷</span>
        <span>FR</span>
      </button>
    </div>
  );
}
