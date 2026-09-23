"use client";

import { Product } from "@/data/products";
import {
  Zap,
  BatteryCharging,
  Wrench,
  ShieldCheck,
  Clock,
  Layers,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface BenefitCardsProps {
  product: Product;
}

export default function BenefitCards({ product }: BenefitCardsProps) {
  // Map icon names safely
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="w-6 h-6 text-amber-500" />;
      case "BatteryCharging":
        return <BatteryCharging className="w-6 h-6 text-emerald-500" />;
      case "Wrench":
        return <Wrench className="w-6 h-6 text-blue-500" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-emerald-500" />;
      case "Clock":
        return <Clock className="w-6 h-6 text-purple-500" />;
      case "Layers":
        return <Layers className="w-6 h-6 text-indigo-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-green-600" />;
    }
  };

  return (
    <section className="w-full bg-gray-50/70 py-8 px-4 border-b border-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-green-700 bg-green-100/70 px-3 py-1 rounded-full uppercase">
            لماذا يفضله زبناؤنا؟
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
            مميزات حصرية تجعل حياتك اليومية أسهل
          </h2>
        </div>

        {/* 3 Visual Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {product.featureCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-2xs">
                {getIcon(card.iconName)}
              </div>
              <h3 className="text-base font-bold text-gray-900">{card.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bullet checklist features */}
        <div className="bg-white p-5 rounded-2xl border border-green-200/60 shadow-xs">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            أهم المواصفات والخصائص:
          </h4>
          <ul className="space-y-2.5">
            {product.features.map((feat, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
