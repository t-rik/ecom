import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  isDark?: boolean;
}

export default function Logo({
  className = "",
  size = "md",
  variant = "full",
  isDark = false,
}: LogoProps) {
  const iconDimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 42, height: 42 },
    lg: { width: 56, height: 56 },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric SVG Icon: "P" + Golden Checkmark */}
      <svg
        width={iconDimensions.width}
        height={iconDimensions.height}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform group-hover:scale-105 duration-200"
      >
        <defs>
          {/* Emerald Gradient */}
          <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="60%" stopColor="#00a650" />
            <stop offset="100%" stopColor="#0d5c3a" />
          </linearGradient>

          {/* Golden Amber Gradient for Checkmark */}
          <linearGradient id="goldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          {/* Soft Shadow Filter */}
          <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#00a650" floodOpacity="0.2" />
          </filter>
        </defs>

        <g filter="url(#logoShadow)">
          {/* Main Body of "P" (Emerald Green) */}
          {/* Vertical Stem */}
          <rect x="18" y="14" width="16" height="72" rx="8" fill="url(#emeraldGrad)" />

          {/* Upper Loop Arch */}
          <path
            d="M 30 14 H 56 C 74 14 84 25 84 41 C 84 57 74 68 56 68 H 30"
            stroke="url(#emeraldGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* The Dynamic Golden Verification Checkmark (✓) */}
          <path
            d="M 40 43 L 52 56 L 82 22"
            stroke="url(#goldGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>

      {/* Typography (Shown if variant is 'full') */}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-black tracking-tight text-lg sm:text-xl ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              PRATIKO
            </span>
            <span className="font-extrabold text-sm sm:text-base text-[#00a650]">
              MAROC
            </span>
          </div>
          <span
            className={`text-[10px] font-bold tracking-wider mt-0.5 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            براتيكو ماروك 🇲🇦
          </span>
        </div>
      )}
    </div>
  );
}
