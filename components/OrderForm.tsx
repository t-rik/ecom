"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Product, CITIES_LIST, MoroccanCity, CITY_ARABIC_NAMES } from "@/data/products";
import { TOP_CITIES, findBestCityMatch, searchCities } from "@/lib/city-matcher";
import { MOROCCAN_PHONE_REGEX, sanitizeMoroccanPhone } from "@/lib/validations";
import { trackInitiateCheckout, trackPurchase, trackAddToCart } from "@/lib/tracking";
import { useLanguage } from "@/context/LanguageContext";
import {
  User,
  Phone,
  MapPin,
  Home,
  Truck,
  ShieldCheck,
  Loader2,
  Sparkles,
  AlertCircle,
  Check,
} from "lucide-react";

interface OrderFormProps {
  product: Product;
  onBundleChange?: (bundleId: string, price: number) => void;
}

export default function OrderForm({ product, onBundleChange }: OrderFormProps) {
  const router = useRouter();
  const { language, t, dir } = useLanguage();

  const title = language === "fr" && product.titleFr ? product.titleFr : product.title;

  // Pre-select Option A (1 unit) by default
  const defaultBundle =
    product.bundleOptions.find((b) => b.id === "1-unit") || product.bundleOptions[0];

  const [selectedBundleId, setSelectedBundleId] = useState<string>(defaultBundle.id);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState<string>("Casablanca");
  const [citySearchInput, setCitySearchInput] = useState<string>("Casablanca (الدار البيضاء)");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityContainerRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityContainerRef.current &&
        !cityContainerRef.current.contains(event.target as Node)
      ) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectCity = (selectedCity: string, arabicName?: string) => {
    setCity(selectedCity);
    const ar = arabicName || CITY_ARABIC_NAMES[selectedCity as MoroccanCity] || "";
    setCitySearchInput(ar && selectedCity !== ar ? `${selectedCity} (${ar})` : selectedCity);
    setIsCityDropdownOpen(false);
    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
  };

  const handleCityInputBlur = () => {
    setTimeout(() => {
      setIsCityDropdownOpen(false);
      const raw = citySearchInput.trim();
      if (!raw) return;

      const match = findBestCityMatch(raw);
      if (match && match.score >= 0.40) {
        setCity(match.city);
        const ar = match.arabicName;
        setCitySearchInput(ar && match.city !== ar ? `${match.city} (${ar})` : match.city);
        if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
      } else {
        // Keep their custom typed text as their city
        setCity(raw);
        setCitySearchInput(raw);
        if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
      }
    }, 180);
  };

  const currentBundle =
    product.bundleOptions.find((b) => b.id === selectedBundleId) || defaultBundle;

  const totalCalculated = currentBundle.price + currentBundle.deliveryFee;

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      trackInitiateCheckout({
        id: product.id,
        name: title,
        price: currentBundle.price,
        category: product.category,
        quantity: currentBundle.quantity,
      });
    }
  };

  const handleBundleSelect = (bundleId: string) => {
    if (bundleId === selectedBundleId) return;
    setSelectedBundleId(bundleId);
    const chosen = product.bundleOptions.find((b) => b.id === bundleId);
    if (chosen) {
      if (onBundleChange) {
        onBundleChange(chosen.id, chosen.price + chosen.deliveryFee);
      }
      trackAddToCart({
        id: product.id,
        name: `${title} (${chosen.name})`,
        price: chosen.price,
        quantity: chosen.quantity,
      });
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = t("err_fullname");
    }

    const cleanPhone = sanitizeMoroccanPhone(phone);
    if (!cleanPhone || !MOROCCAN_PHONE_REGEX.test(cleanPhone)) {
      errs.phone = t("err_phone");
    }

    if (!city) {
      errs.city = t("err_city");
    }

    if (!address.trim() || address.trim().length < 3) {
      errs.address = t("err_address");
    }

    setErrors(errs);

    const errorKeys = Object.keys(errs);
    if (errorKeys.length > 0) {
      const firstFieldId = errorKeys[0];
      const el = document.getElementById(firstFieldId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return false;
    }

    return true;
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
          productTitle: title,
          quantity: currentBundle.quantity,
          unitPrice: currentBundle.price,
          totalPrice: totalCalculated,
          deliveryFee: currentBundle.deliveryFee,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("valid_order_session", data.orderId);
        }

        router.push(
          `/thank-you?orderId=${encodeURIComponent(data.orderId)}&name=${encodeURIComponent(
            fullName.trim()
          )}&product=${encodeURIComponent(title)}&total=${totalCalculated}&city=${encodeURIComponent(
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
          const firstFieldId = Object.keys(flatErrors)[0];
          const el = document.getElementById(firstFieldId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          }
        } else {
          alert(data.message || "Erreur lors de l'enregistrement de la commande.");
        }
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.");
      setIsSubmitting(false);
    }
  };

  const bundleName =
    language === "fr" && currentBundle.nameFr ? currentBundle.nameFr : currentBundle.name;

  return (
    <section id="order-form" className="w-full bg-slate-50 py-8 px-4 border-b border-gray-200 scroll-mt-4">
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-gray-200/80">
        {/* Form Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-green-600" />
            <span>{t("form_badge")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
            {t("form_title")}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{t("form_subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} onFocus={handleInteraction} className="space-y-5">
          {/* Bundle Radio Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-900">
              {t("form_step1")}
            </label>

            <div className="space-y-2.5">
              {product.bundleOptions.map((bundle) => {
                const isSelected = selectedBundleId === bundle.id;
                const bName = language === "fr" && bundle.nameFr ? bundle.nameFr : bundle.name;
                const bBadge = language === "fr" && bundle.badgeFr ? bundle.badgeFr : bundle.badge;

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
                    {bBadge && (
                      <span className="absolute -top-3 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-xs">
                        {bBadge}
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? "border-green-600 bg-green-600" : "border-gray-300"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{bName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {bundle.deliveryFee === 0 ? (
                              <span className="text-green-700 font-semibold flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" /> {t("free_delivery")}
                              </span>
                            ) : (
                              <span>
                                {t("delivery_fee").replace("{fee}", String(bundle.deliveryFee))}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="text-lg font-black text-green-700">
                          {bundle.price} <span className="text-xs font-bold">{t("dh")}</span>
                        </span>
                        {bundle.originalPrice > bundle.price && (
                          <div className="text-[11px] text-gray-400 line-through">
                            {bundle.originalPrice} {t("dh")}
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
              {t("form_step2")}
            </label>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-gray-700 mb-1">
                {t("full_name_label")} <span className="text-red-500">*</span>
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
                  className={`w-full py-3.5 px-10 rounded-xl border text-sm font-medium transition-colors outline-hidden ${
                    errors.fullName
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-600/10"
                  }`}
                />
                <User
                  className={`w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 ${
                    dir === "rtl" ? "right-3" : "left-3"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-gray-700 mb-1">
                {t("phone_label")} <span className="text-red-500">*</span>
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
                  className={`w-full text-left py-3.5 pl-10 pr-3 rounded-xl border text-sm font-medium tracking-wide transition-colors outline-hidden ${
                    errors.phone
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-600/10"
                  }`}
                />
                <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.phone}</p>
              )}
            </div>

            {/* City Selection: Quick-Tap Pills + Smart Search */}
            <div>
              <label htmlFor="city" className="block text-xs font-bold text-gray-700 mb-1.5">
                {t("city_label")} <span className="text-red-500">*</span>
              </label>

              {/* Top 6 Quick-Tap Pills for 80% of Moroccan buyers */}
              <div className="mb-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-gray-500">
                    {language === "fr" ? "Villes fréquentes (1 clic) :" : "المدن الأكثر طلباً (نقرة واحدة) :"}
                  </span>
                  {city && (
                    <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      ✓ {city}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5" dir={dir}>
                  {TOP_CITIES.map((c) => {
                    const isSelected = city === c;
                    const arName = CITY_ARABIC_NAMES[c] || c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleSelectCity(c, arName)}
                        className={`text-xs font-bold py-1.5 px-3 rounded-xl border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-green-600 border-green-600 text-white shadow-xs scale-[1.02]"
                            : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        <span>{language === "fr" ? c : arName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Smart Search Combobox */}
              <div className="relative" ref={cityContainerRef}>
                <div className="relative">
                  <input
                    id="city"
                    type="text"
                    autoComplete="off"
                    value={citySearchInput}
                    onFocus={() => setIsCityDropdownOpen(true)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCitySearchInput(val);
                      setCity(val);
                      setIsCityDropdownOpen(true);
                      if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                    onBlur={handleCityInputBlur}
                    placeholder={
                      language === "fr"
                        ? "Rechercher ou écrire votre ville..."
                        : "ابحث عن مدينتك أو اكتبها (مثال: كازا، مراكش، وجدة...)"
                    }
                    className="w-full py-3.5 px-10 rounded-xl border border-gray-300 bg-white text-sm font-medium focus:border-green-600 focus:ring-2 focus:ring-green-600/10 outline-hidden"
                  />
                  <MapPin
                    className={`w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                      dir === "rtl" ? "right-3" : "left-3"
                    }`}
                  />
                  {citySearchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCitySearchInput("");
                        setCity("");
                        setIsCityDropdownOpen(true);
                      }}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 text-xs font-bold cursor-pointer ${
                        dir === "rtl" ? "left-3" : "right-3"
                      }`}
                      aria-label="Clear city"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filtered Dropdown Results */}
                {isCityDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-2xl shadow-xl border border-gray-200 max-h-56 overflow-y-auto divide-y divide-gray-100">
                    {searchCities(citySearchInput).length > 0 ? (
                      searchCities(citySearchInput).map(({ city: c, arabicName }) => {
                        const isSelected = city === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectCity(c, arabicName);
                            }}
                            className={`w-full text-right px-4 py-2.5 text-sm flex items-center justify-between hover:bg-green-50 transition-colors cursor-pointer ${
                              isSelected ? "bg-green-50 text-green-700 font-bold" : "text-gray-700"
                            }`}
                          >
                            <span className="font-semibold text-gray-900">
                              {c} <span className="text-gray-500 font-normal">({arabicName})</span>
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-green-600 shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-xs text-gray-500 text-center">
                        {language === "fr"
                          ? `Appuyez pour confirmer "${citySearchInput}"`
                          : `انقر لتأكيد "${citySearchInput}"`}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.city && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.city}</p>
              )}
            </div>

            {/* Full Address */}
            <div>
              <label htmlFor="address" className="block text-xs font-bold text-gray-700 mb-1">
                {t("address_label")} <span className="text-red-500">*</span>
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
                  className={`w-full py-3.5 px-10 rounded-xl border text-sm font-medium transition-colors outline-hidden ${
                    errors.address
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-600/10"
                  }`}
                />
                <Home
                  className={`w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 ${
                    dir === "rtl" ? "right-3" : "left-3"
                  }`}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Order Summary Recap */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 text-xs sm:text-sm space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>
                {t("order_summary_product")} ({bundleName}):
              </span>
              <span className="font-bold">
                {currentBundle.price} {t("dh")}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t("order_summary_shipping")}</span>
              <span className="font-bold text-green-700">
                {currentBundle.deliveryFee === 0
                  ? t("free_delivery")
                  : `${currentBundle.deliveryFee} ${t("dh")}`}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline font-black text-gray-900 text-base">
              <span>{t("order_summary_total")}</span>
              <span className="text-xl text-green-700">
                {totalCalculated} {t("dh")}
              </span>
            </div>
          </div>

          {/* Validation Notice Banner if errors present */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs font-bold text-red-700 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{t("err_fill_required")}</span>
            </div>
          )}

          {/* High-Contrast Big Green Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#00a650] hover:bg-[#008f45] disabled:bg-gray-400 text-white text-base sm:text-lg font-black py-4 px-6 rounded-2xl shadow-xl shadow-green-600/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{t("submitting")}</span>
              </>
            ) : (
              <>
                <span>{t("submit_button")}</span>
              </>
            )}
          </button>

          {/* Reassurance note below button */}
          <div className="flex flex-col items-center justify-center gap-1 text-[11px] text-gray-500 text-center pt-1">
            <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t("no_card_needed")}</span>
            </div>
            <p>{t("call_reassurance")}</p>
          </div>
        </form>
      </div>
    </section>
  );
}
