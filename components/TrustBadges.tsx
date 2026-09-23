"use client";

import { Search, Home, RefreshCw, ShieldCheck } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    {
      icon: <Search className="w-6 h-6 text-amber-600" />,
      bg: "bg-amber-50 border-amber-200",
      title: "معاينة المنتج قبل الدفع 🔍",
      description: "افتح الطرد وتأكد من جودة المنتج وسلامته قبل دفع أي درهم للموزع.",
    },
    {
      icon: <Home className="w-6 h-6 text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-200",
      title: "التوصيل حتى باب منزلك 🚪",
      description: "شحن سريع وآمن إلى جميع مدن وقرى المملكة في غضون 24-48 ساعة.",
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50 border-blue-200",
      title: "ضمان استبدال مجاني 🔄",
      description: "في حال وجود أي عيب أو مشكل، نقوم بتعويضك أو استبدال المنتج مجاناً وبسرعة.",
    },
  ];

  return (
    <section className="w-full bg-white py-6 px-4 border-b border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4 text-center">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
            تسوق بكل ثقة مع ضمان &quot;براتيكو ماروك&quot; 🇲🇦
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {badges.map((b, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${b.bg} flex items-start gap-3 transition-transform hover:-translate-y-0.5`}
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0">
                {b.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{b.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
