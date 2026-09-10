import React from "react";

interface PurposeIllustrationProps {
  type: "nssb_focused" | "subject_tests" | "timed_mocks" | "track_performance";
}

export function Purpose3DIllustration({ type }: PurposeIllustrationProps) {
  if (type === "nssb_focused") {
    return (
      <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80">
        {/* Ambient Glow */}
        <div className="absolute h-16 w-16 rounded-full bg-blue-500/20 blur-xl" />

        {/* 3D Isometric Target & NSSB Shield */}
        <svg
          viewBox="0 0 120 90"
          className="h-20 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="targetOuter" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="60%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </radialGradient>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#DBEAFE" />
            </linearGradient>
            <linearGradient id="goldLaurel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <filter id="shieldShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1E3A8A" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="60" cy="74" rx="34" ry="6" fill="#1E3A8A" fillOpacity="0.1" />

          {/* 3D Target Rings (Perspective Ellipses) */}
          <ellipse cx="60" cy="52" rx="38" ry="14" stroke="#BFDBFE" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
          <ellipse cx="60" cy="52" rx="26" ry="9.5" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />

          {/* 3D Shield Badge */}
          <g filter="url(#shieldShadow)">
            <path
              d="M60 14 L82 22 C82 38 72 52 60 58 C48 52 38 38 38 22 Z"
              fill="url(#targetOuter)"
            />
            {/* Inner Shield Inlay */}
            <path
              d="M60 18 L77 24.5 C77 37 69 48 60 53 C51 48 43 37 43 24.5 Z"
              fill="url(#shieldGrad)"
            />
            {/* Bold "N" Emblem in Center */}
            <text
              x="60"
              y="42"
              fill="#1E3A8A"
              fontSize="20"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
            >
              N
            </text>
          </g>

          {/* Floating Gold Star */}
          <g transform="translate(78, 12)">
            <path
              d="M6 0 L8 4 L12 5 L9 8 L10 12 L6 10 L2 12 L3 8 L0 5 L4 4 Z"
              fill="url(#goldLaurel)"
              filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
            />
          </g>

          {/* Floating Check Badge */}
          <g transform="translate(24, 28)">
            <circle cx="8" cy="8" r="7" fill="#10B981" />
            <path d="M5 8 L7 10 L11 6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    );
  }

  if (type === "subject_tests") {
    return (
      <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80">
        <div className="absolute h-16 w-16 rounded-full bg-indigo-500/20 blur-xl" />

        {/* 3D Stack of Categorized Subject Modules */}
        <svg
          viewBox="0 0 120 90"
          className="h-20 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cardTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#EFF6FF" />
            </linearGradient>
            <linearGradient id="cardSide" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Base Shadow */}
          <ellipse cx="60" cy="74" rx="36" ry="6" fill="#1E3A8A" fillOpacity="0.1" />

          {/* Layer 1 (Bottom Plate) */}
          <g transform="translate(30, 44)">
            <path d="M0 8 L30 0 L60 8 L30 16 Z" fill="#94A3B8" />
            <path d="M0 8 L30 16 L30 22 L0 14 Z" fill="#64748B" />
            <path d="M30 16 L60 8 L60 14 L30 22 Z" fill="#475569" />
          </g>

          {/* Layer 2 (Middle Plate - Emerald Theme) */}
          <g transform="translate(30, 32)">
            <path d="M0 8 L30 0 L60 8 L30 16 Z" fill="#6EE7B7" />
            <path d="M0 8 L30 16 L30 22 L0 14 Z" fill="#10B981" />
            <path d="M30 16 L60 8 L60 14 L30 22 Z" fill="#047857" />
            {/* Subject Tab */}
            <rect x="8" y="5" width="16" height="3" rx="1" fill="#FFFFFF" opacity="0.8" transform="skewX(-30)" />
          </g>

          {/* Layer 3 (Top Plate - Blue Theme with Checkmark) */}
          <g transform="translate(30, 18)" filter="drop-shadow(0 4px 6px rgba(30,58,138,0.2))">
            <path d="M0 8 L30 0 L60 8 L30 16 Z" fill="url(#cardTop)" stroke="#BFDBFE" strokeWidth="0.8" />
            <path d="M0 8 L30 16 L30 22 L0 14 Z" fill="#3B82F6" />
            <path d="M30 16 L60 8 L60 14 L30 22 Z" fill="#1D4ED8" />

            {/* Test Content Lines on Top Face */}
            <line x1="16" y1="7" x2="32" y2="3" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="11" x2="42" y2="5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Floating Verified Stamp Badge */}
          <g transform="translate(68, 12)" filter="drop-shadow(0 3px 5px rgba(16,185,129,0.35))">
            <circle cx="12" cy="12" r="12" fill="#10B981" />
            <path d="M7 12 L10.5 15.5 L17 9" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Small Category Pill */}
          <g transform="translate(18, 20)">
            <rect x="0" y="0" width="14" height="14" rx="4" fill="#6366F1" />
            <text x="4" y="10.5" fill="#FFFFFF" fontSize="8" fontWeight="bold">05</text>
          </g>
        </svg>
      </div>
    );
  }

  if (type === "timed_mocks") {
    return (
      <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80">
        <div className="absolute h-16 w-16 rounded-full bg-amber-400/20 blur-xl" />

        {/* 3D Isometric Chronometer & Pressure Gauge */}
        <svg
          viewBox="0 0 120 90"
          className="h-20 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="clockDial" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </radialGradient>
            <linearGradient id="bezelRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="60" cy="74" rx="34" ry="6" fill="#1E3A8A" fillOpacity="0.1" />

          {/* 3D Bezel Case */}
          <g filter="drop-shadow(0 6px 8px rgba(30,58,138,0.22))">
            {/* Top Push Button Base */}
            <rect x="56" y="10" width="8" height="7" rx="2" fill="#94A3B8" />
            <rect x="54" y="8" width="12" height="3" rx="1.5" fill="#2563EB" />
            
            {/* Side Action Crown */}
            <rect x="84" y="20" width="6" height="5" rx="1.5" fill="#94A3B8" transform="rotate(35 84 20)" />

            {/* Outer Chrono Ring */}
            <circle cx="60" cy="46" r="27" fill="url(#bezelRing)" />
            {/* Inner Depth Rim */}
            <circle cx="60" cy="46" r="23" fill="#1E3A8A" />
            {/* Watch Face Dial */}
            <circle cx="60" cy="46" r="21" fill="url(#clockDial)" />

            {/* Hour / Minute Tick Marks */}
            <line x1="60" y1="28" x2="60" y2="31" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            <line x1="60" y1="61" x2="60" y2="64" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="42" y1="46" x2="45" y2="46" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="75" y1="46" x2="78" y2="46" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />

            {/* 60-Sec Progress Arc */}
            <path
              d="M60 27 A19 19 0 0 1 79 46"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Clock Needles */}
            <line x1="60" y1="46" x2="72" y2="34" stroke="url(#needleGrad)" strokeWidth="2" strokeLinecap="round" />
            <line x1="60" y1="46" x2="52" y2="46" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="60" cy="46" r="3" fill="#1E293B" />
          </g>

          {/* Floating Lightning Bolt (Speed/Pressure) */}
          <g transform="translate(22, 18)" filter="drop-shadow(0 2px 4px rgba(245,158,11,0.4))">
            <path
              d="M7 0 L0 8 L5 8 L3 15 L12 6 L7 6 Z"
              fill="#F59E0B"
            />
          </g>
        </svg>
      </div>
    );
  }

  // Track Performance
  return (
    <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80">
      <div className="absolute h-16 w-16 rounded-full bg-emerald-400/20 blur-xl" />

      {/* 3D Isometric Performance Graph & Ascending Arrow */}
      <svg
        viewBox="0 0 120 90"
        className="h-20 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="chartPillar1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="chartPillar2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="chartPillar3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="rocketTrail" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="60" cy="74" rx="36" ry="6" fill="#1E3A8A" fillOpacity="0.1" />

        {/* 3D Bar 1 (Left) */}
        <g transform="translate(24, 46)">
          <path d="M0 5 L8 0 L16 5 L8 10 Z" fill="#BFDBFE" />
          <path d="M0 5 L8 10 L8 24 L0 19 Z" fill="#3B82F6" />
          <path d="M8 10 L16 5 L16 19 L8 24 Z" fill="#1D4ED8" />
        </g>

        {/* 3D Bar 2 (Middle) */}
        <g transform="translate(44, 34)">
          <path d="M0 5 L8 0 L16 5 L8 10 Z" fill="#93C5FD" />
          <path d="M0 5 L8 10 L8 36 L0 31 Z" fill="#2563EB" />
          <path d="M8 10 L16 5 L16 31 L8 36 Z" fill="#1E40AF" />
        </g>

        {/* 3D Bar 3 (Right - Highest) */}
        <g transform="translate(64, 20)">
          <path d="M0 5 L8 0 L16 5 L8 10 Z" fill="#A7F3D0" />
          <path d="M0 5 L8 10 L8 50 L0 45 Z" fill="#10B981" />
          <path d="M8 10 L16 5 L16 45 L8 50 Z" fill="#047857" />
        </g>

        {/* 3D Ascending Curved Trend Line */}
        <path
          d="M26 48 Q 50 38, 88 16"
          stroke="url(#rocketTrail)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* 3D Floating Arrowhead Capsule */}
        <g transform="translate(82, 10)" filter="drop-shadow(0 4px 6px rgba(37,99,235,0.35))">
          <circle cx="12" cy="12" r="12" fill="#2563EB" />
          <path d="M8 16 L16 8 M16 8 H10 M16 8 V14" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Floating Percentage / Metric Pill */}
        <g transform="translate(14, 22)">
          <rect x="0" y="0" width="22" height="12" rx="4" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1" />
          <text x="4" y="9" fill="#2563EB" fontSize="8" fontWeight="bold">+28%</text>
        </g>
      </svg>
    </div>
  );
}
