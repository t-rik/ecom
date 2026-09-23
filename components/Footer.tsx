import Link from "next/link";
import { ShieldCheck, PhoneCall, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-10 px-4 pb-24 md:pb-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-6 text-center sm:text-right">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="text-lg font-black text-white">
                PRATIKO <span className="text-green-500">MAROC</span>
              </span>
              <p className="text-xs text-gray-400">وجهتكم الأولى للتسوق الموثوق بالمغرب 🇲🇦</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <a
              href="https://wa.me/212600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-green-400 hover:text-green-300 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700"
            >
              <PhoneCall className="w-4 h-4" />
              <span>تواصل معنا عبر الواتساب</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-400 text-center sm:text-right">
          <div>
            <h5 className="font-bold text-white mb-1.5 flex items-center justify-center sm:justify-start gap-1">
              <ShieldCheck className="w-4 h-4 text-green-500" /> ضمان المعاينة
            </h5>
            <p>يحق لك فتح الطرد والتأكد من تطابق المنتج قبل دفع ثمنه لعامل التوصيل.</p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-1.5">شحن لجميع المدن</h5>
            <p>توصيل آمن وسريع عبر شبكة موزعين معتمدين بجميع ربوع المملكة خلال 24-48 ساعة.</p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-1.5">خدمة ما بعد البيع</h5>
            <p>فريقنا رهن إشارتكم طيلة أيام الأسبوع لمساعدتكم والإجابة عن كل استفساراتكم.</p>
          </div>
        </div>

        <div className="text-center pt-6 border-t border-gray-800 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} Pratiko Maroc. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
