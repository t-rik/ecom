"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product, CITIES_LIST, MoroccanCity } from "@/data/products";
import { MOROCCAN_PHONE_REGEX, sanitizeMoroccanPhone } from "@/lib/validations";
import { trackInitiateCheckout, trackPurchase } from "@/lib/tracking";
import {
  User,
  Phone,
  MapPin,
  Home,
  CheckCircle,
  Truck,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";

interface OrderFormProps {
  product: Product;
  onBundleChange?: (bundleId: string, price: number) => void;
}

export default function OrderForm({ product, onBundleChange }: OrderFormProps) {
  const router = useRouter();

  // Pre-select Option B (2 units) by default as specified in requirements
  const defaultBundle =
    product.bundleOptions.find((b) => b.id === "2-units") || product.bundleOptions[0];

  const [selectedBundleId, setSelectedBundleId] = useState<string>(defaultBundle.id);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState<MoroccanCity>("Casablanca");
  const [address, setAddress] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const currentBundle =
    product.bundleOptions.find((b) => b.id === selectedBundleId) || defaultBundle;

  const totalCalculated = currentBundle.price + currentBundle.deliveryFee;

  // Track initial interaction once
  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      trackInitiateCheckout({
        id: product.id,
        name: product.title,
        price: currentBundle.price,
        category: product.category,
        quantity: currentBundle.quantity,
      });
    }
  };

  const handleBundleSelect = (bundleId: string) => {
    setSelectedBundleId(bundleId);
    const chosen = product.bundleOptions.find((b) => b.id === bundleId);
    if (chosen && onBundleChange) {
      onBundleChange(chosen.id, chosen.price + chosen.deliveryFee);
    }
  };

  // Client-side validation
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = "المرجو إدخال الاسم الكامل (3 أحرف على الأقل)";
    }

    const cleanPhone = sanitizeMoroccanPhone(phone);
    if (!cleanPhone || !MOROCCAN_PHONE_REGEX.test(cleanPhone)) {
      errs.phone = "يرجى إدخال رقم هاتف مغربي صحيح يبدأ بـ 06 أو 07 (مثال: 0612345678)";
    }

    if (!city) {
      errs.city = "المرجو اختيار مدينتك";
    }

    if (!address.trim() || address.trim().length < 5) {
      errs.address = "المرجو إدخال العنوان بالكامل (الحي، رقم الشارع، الإقامة...)";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = sanitizeMoroccanPhone(phone);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: cleanPhone,
          city,
          address: address.trim(),
          bundleId: currentBundle.id,
          productId: product.id,
          productTitle: product.title,
          quantity: currentBundle.quantity,
          unitPrice: currentBundle.price,
          totalPrice: totalCalculated,
          deliveryFee: currentBundle.deliveryFee,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Trigger Pixel Purchase Event
        trackPurchase({
          orderId: data.orderId || "PRK-ORDER",
          value: totalCalculated,
          currency: "MAD",
          items: [
            {
              id: product.id,
              name: product.title,
              quantity: currentBundle.quantity,
              price: currentBundle.price,
            },
          ],
        });

        // Redirect to post-purchase thank-you page
        router.push(
          `/thank-you?orderId=${encodeURIComponent(data.orderId)}&name=${encodeURIComponent(
            fullName.trim()
          )}&product=${encodeURIComponent(product.title)}&total=${totalCalculated}&city=${encodeURIComponent(
            city
          )}`
        );
      } else {
        if (data.errors) {
          const flatErrors: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(data.errors)) {
            flatErrors[key] = (msgs as string[])[0];
          }
          setErrors(flatErrors);
        } else {
          alert(data.message || "حدث خطأ أثناء إرسال الطلب. يرجى إعادة المحاولة.");
        }
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("تعذر الاتصال بالخادم. يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً.");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order-form" className="w-full bg-slate-50 py-8 px-4 border-b border-gray-200">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-gray-200/80">
        {/* Form Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-green-600" />
            <span>عرض حصري لفترة محدودة</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
            املأ الاستمارة وأكّد طلبك في ثوانٍ ⚡
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            الدفع نقداً عند الاستلام بعد معاينة المنتج 100%
          </p>
        </div>

        <form onSubmit={handleSubmit} onFocus={handleInteraction} className="space-y-5">
          {/* Bundle Radio Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-900">
              1. اختر العرض المناسب لك:
            </label>

            <div className="space-y-2.5">
              {product.bundleOptions.map((bundle) => {
                const isSelected = selectedBundleId === bundle.id;
                return (
                  <div
                    key={bundle.id}
                    onClick={() => handleBundleSelect(bundle.id)}
                    className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all select-none ${
                      isSelected
                        ? "border-green-600 bg-green-50/50 shadow-sm ring-1 ring-green-600/30"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {/* Badge */}
                    {bundle.badge && (
                      <span className="absolute -top-3 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-xs">
                        {bundle.badge}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-green-600 bg-green-600" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{bundle.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {bundle.deliveryFee === 0 ? (
                              <span className="text-green-700 font-semibold flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" /> توصيل مجاني
                              </span>
                            ) : (
                              <span>مصاريف التوصيل: {bundle.deliveryFee} درهم</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="text-lg font-black text-green-700">
                          {bundle.price} <span className="text-xs font-bold">درهم</span>
                        </span>
                        {bundle.originalPrice > bundle.price && (
                          <div className="text-[11px] text-gray-400 line-through">
                            {bundle.originalPrice} درهم
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100 my-4" />

          {/* Customer Information Inputs */}
          <div className="space-y-4">
            <label className="block text-sm font-black text-gray-900">
              2. معلومات التوصيل:
            </label>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-gray-700 mb-1">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: "" });
                  }}
                  placeholder="محمد الإدريسي"
                  className={`w-full text-right py-3.5 pr-10 pl-3 rounded-xl border text-sm font-medium transition-colors outline-hidden ${
                    errors.fullName
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-600/10"
                  }`}
                />
                <User className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Phone Number with Moroccan formatting & live feedback */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-gray-700 mb-1">
                رقم الهاتف (WhatsApp) <span className="text-red-500">*</span>
              </label>
              <div className="relative" dir="ltr">
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  placeholder="0612345678"
                  className={`w-full text-left py-3.5 pl-10 pr-3 rounded-xl border text-sm font-medium tracking-wide transition-colors outline-hidden ${
                    errors.phone
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-600/10"
                  }`}
                />
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                يجب أن يبدأ الرقم بـ 06 أو 07 للتواصل والتأكيد عبر الواتساب
              </p>
              {errors.phone && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.phone}</p>
              )}
            </div>

            {/* City Select */}
            <div>
              <label htmlFor="city" className="block text-xs font-bold text-gray-700 mb-1">
                المدينة <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="city"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value as MoroccanCity);
                    if (errors.city) setErrors({ ...errors, city: "" });
                  }}
                  className="w-full text-right py-3.5 pr-10 pl-3 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-green-600 focus:ring-2 focus:ring-green-600/10 outline-hidden appearance-none cursor-pointer"
                >
                  {CITIES_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <MapPin className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.city && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.city}</p>
              )}
            </div>

            {/* Full Address */}
            <div>
              <label htmlFor="address" className="block text-xs font-bold text-gray-700 mb-1">
                العنوان بالكامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors({ ...errors, address: "" });
                  }}
                  placeholder="الحي، رقم الشارع، الإقامة..."
                  className={`w-full text-right py-3.5 pr-10 pl-3 rounded-xl border text-sm font-medium transition-colors outline-hidden ${
                    errors.address
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-600/10"
                  }`}
                />
                <Home className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.address && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Order Summary Recap */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 text-xs sm:text-sm space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>سعر المنتج ({currentBundle.name}):</span>
              <span className="font-bold">{currentBundle.price} درهم</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>تكلفة التوصيل:</span>
              <span className="font-bold text-green-700">
                {currentBundle.deliveryFee === 0 ? "مجاناً 🎁" : `${currentBundle.deliveryFee} درهم`}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-black text-gray-900 text-base">
              <span>المجموع الصافي:</span>
              <span className="text-xl text-green-700">{totalCalculated} درهم</span>
            </div>
          </div>

          {/* High-Contrast Big Green Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#00a650] hover:bg-[#008f45] disabled:bg-gray-400 text-white text-base sm:text-lg font-black py-4 px-6 rounded-2xl shadow-xl shadow-green-600/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>جاري تسجيل وتأكيد الطلب...</span>
              </>
            ) : (
              <>
                <span>🛒 تأكيد الطلب الآن - الدفع عند الاستلام</span>
              </>
            )}
          </button>

          {/* Reassurance note below button */}
          <div className="flex flex-col items-center justify-center gap-1 text-[11px] text-gray-500 text-center pt-1">
            <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>لا تحتاج لبطاقة بنكية، الدفع نقداً عند استلام طلبيتك وفحصها</span>
            </div>
            <p>سنتصل بك هاتفياً لتأكيد العنوان قبل إرسال الموزع</p>
          </div>
        </form>
      </div>
    </section>
  );
}
