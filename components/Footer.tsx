"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, PhoneCall } from "lucide-react";
import Logo from "./Logo";
import { useLanguage } from "@/context/LanguageContext";
import { STORE_WHATSAPP_BASE_URL } from "@/lib/constants";

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-10 px-4 pb-24 md:pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-6 text-center sm:text-start">
          <Link href="/" className="group" aria-label="Pratiko Maroc">
            <Logo size="md" isDark={true} />
          </Link>

          <div className="flex items-center gap-4 text-xs font-medium">
            <a
              href={STORE_WHATSAPP_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-green-400 hover:text-green-300 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t("footer_whatsapp")}</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-400 text-center sm:text-start">
          <div>
            <h5 className="font-bold text-white mb-1.5 flex items-center justify-center sm:justify-start gap-1">
              <ShieldCheck className="w-4 h-4 text-green-500" /> {t("footer_inspect_title")}
            </h5>
            <p>{t("footer_inspect_desc")}</p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-1.5">{t("footer_shipping_title")}</h5>
            <p>{t("footer_shipping_desc")}</p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-1.5">{t("footer_support_title")}</h5>
            <p>{t("footer_support_desc")}</p>
          </div>
        </div>

        <div className="text-center pt-6 border-t border-gray-800 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} Pratiko Maroc. {t("footer_rights")}</p>
        </div>
      </div>
    </footer>
  );
}
