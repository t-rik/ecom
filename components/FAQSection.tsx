"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSectionProps {
  faq: FAQItem[];
}

export default function FAQSection({ faq }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full bg-white py-8 px-4 border-b border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
            <span>الأسئلة الشائعة</span>
          </div>
          <h3 className="text-xl font-black text-gray-900">كل ما تود معرفته قبل الطلب</h3>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full p-4 text-right flex items-center justify-between gap-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-gray-900 leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-green-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/50 border-t border-gray-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
