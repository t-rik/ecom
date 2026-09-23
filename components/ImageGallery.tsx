"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft, Eye } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  productTitle: string;
  badge?: string;
  discountPercentage?: number;
}

export default function ImageGallery({
  images,
  productTitle,
  badge,
  discountPercentage,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prevImage = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // RTL swipe: positive diff means swipe left (next), negative means swipe right (prev)
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    touchStartX.current = null;
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full select-none">
      {/* Main Image Container */}
      <div
        className="relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[selectedIndex]}
          alt={`${productTitle} - صورة ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-contain p-2 transition-all duration-300"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {badge && (
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
              {badge}
            </span>
          )}
          {discountPercentage && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm text-center">
              وفر {discountPercentage}%
            </span>
          )}
        </div>

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>
            {selectedIndex + 1} / {images.length}
          </span>
        </div>

        {/* Arrow Navigation (visible on hover or mobile tap) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous Image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next Image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                selectedIndex === idx
                  ? "border-green-600 ring-2 ring-green-600/30 scale-102"
                  : "border-gray-200 opacity-65 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`صورة مصغرة ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
