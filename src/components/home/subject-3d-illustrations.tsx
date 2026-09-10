import React from "react";

interface SubjectIllustrationProps {
  type: "gk" | "computer" | "english" | "comprehension" | "arithmetic";
}

export function Subject3DIllustration({ type }: SubjectIllustrationProps) {
  if (type === "gk") {
    return (
      <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80">
        {/* Ambient Glow */}
        <div className="absolute h-16 w-16 rounded-full bg-blue-400/20 blur-xl" />
        
        {/* 3D Isometric Globe & Compass Artwork */}
        <svg
          viewBox="0 0 120 90"
          className="h-20 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="globeGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="45%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </radialGradient>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <filter id="shadowGk" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1E3A8A" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 3D Base Shadow */}
          <ellipse cx="60" cy="74" rx="34" ry="7" fill="#1E3A8A" fillOpacity="0.08" />
          <ellipse cx="60" cy="72" rx="24" ry="4.5" fill="#1E3A8A" fillOpacity="0.12" />

          {/* Outer Orbital Orbit Ring Behind */}
          <ellipse cx="60" cy="45" rx="42" ry="15" stroke="url(#ringGrad)" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.6" transform="rotate(-18 60 45)" />

          {/* 3D Main Sphere */}
          <g filter="url(#shadowGk)">
            <circle cx="60" cy="44" r="26" fill="url(#globeGrad)" />
            {/* Specular Highlight */}
            <ellipse cx="50" cy="30" rx="9" ry="5" fill="#FFFFFF" fillOpacity="0.4" transform="rotate(-25 50 30)" />
            {/* Continent / Grid 3D Latitudes */}
            <ellipse cx="60" cy="44" rx="26" ry="11" stroke="#BFDBFE" strokeWidth="1.2" strokeOpacity="0.75" />
            <ellipse cx="60" cy="44" rx="14" ry="26" stroke="#BFDBFE" strokeWidth="1.2" strokeOpacity="0.75" />
            <line x1="34" y1="44" x2="86" y2="44" stroke="#BFDBFE" strokeWidth="1.2" strokeOpacity="0.8" />
            <line x1="60" y1="18" x2="60" y2="70" stroke="#BFDBFE" strokeWidth="1.2" strokeOpacity="0.8" />
          </g>

          {/* Foreground Orbital Ring */}
          <path
            d="M20 52 C30 65, 80 62, 98 42"
            stroke="#93C5FD"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Floating 3D Map Pin */}
          <g transform="translate(74, 18)">
            <path
              d="M10 0 C4.5 0 0 4.5 0 10 C0 16 10 24 10 24 C10 24 20 16 20 10 C20 4.5 15.5 0 10 0 Z"
              fill="url(#pinGrad)"
              filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))"
            />
            <circle cx="10" cy="9" r="4" fill="#FFFFFF" />
          </g>

          {/* Floating Sparkle Icon */}
          <path
            d="M32 20 L34 25 L39 27 L34 29 L32 34 L30 29 L25 27 L30 25 Z"
            fill="#FBBF24"
            opacity="0.9"
          />
        </svg>
      </div>
    );
  }

  if (type === "computer") {
    return (
      <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80">
        <div className="absolute h-16 w-16 rounded-full bg-indigo-400/20 blur-xl" />

        {/* 3D Isometric Desktop Terminal Artwork */}
        <svg
          viewBox="0 0 120 90"
          className="h-20 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="screenFront" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="screenBezel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="standGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          {/* Base Platform Shadow */}
          <ellipse cx="60" cy="74" rx="36" ry="6" fill="#1E3A8A" fillOpacity="0.1" />

          {/* Stand Foot Base (Isometric Ellipse) */}
          <ellipse cx="60" cy="68" rx="16" ry="4" fill="url(#standGrad)" />
          <path d="M57 52 L63 52 L62 68 L58 68 Z" fill="#94A3B8" />

          {/* 3D Monitor Outer Bezel */}
          <rect x="24" y="16" width="72" height="42" rx="7" fill="url(#screenBezel)" />
          {/* Bezel Side Depth (3D feel) */}
          <path d="M96 23 L98 21 L98 56 L96 58 Z" fill="#1E40AF" />
          <path d="M31 16 L91 16 L98 21 L26 21 Z" fill="#60A5FA" fillOpacity="0.5" />

          {/* Monitor Display Glass */}
          <rect x="28" y="20" width="64" height="34" rx="4" fill="url(#screenFront)" />

          {/* Code syntax lines inside terminal */}
          <circle cx="34" cy="25" r="1.5" fill="#EF4444" />
          <circle cx="39" cy="25" r="1.5" fill="#F59E0B" />
          <circle cx="44" cy="25" r="1.5" fill="#10B981" />

          {/* Code Blocks */}
          <rect x="34" y="30" width="22" height="2.5" rx="1" fill="#38BDF8" />
          <rect x="58" y="30" width="16" height="2.5" rx="1" fill="#A855F7" />
          
          <rect x="38" y="35" width="30" height="2.5" rx="1" fill="#34D399" />
          <rect x="70" y="35" width="12" height="2.5" rx="1" fill="#FBBF24" />

          <rect x="38" y="40" width="20" height="2.5" rx="1" fill="#60A5FA" />
          <rect x="60" y="40" width="26" height="2.5" rx="1" fill="#94A3B8" />

          {/* Floating Microchip 3D Badge */}
          <g transform="translate(82, 42)">
            <rect x="0" y="0" width="18" height="18" rx="4" fill="#2563EB" stroke="#93C5FD" strokeWidth="1.5" />
            <path d="M4 9 L14 9 M9 4 L9 14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="9" cy="9" r="2" fill="#FBBF24" />
          </g>

          {/* Floating Cloud Node */}
          <g transform="translate(14, 28)">
            <ellipse cx="8" cy="8" rx="8" ry="5" fill="#FFFFFF" fillOpacity="0.9" />
            <circle cx="6" cy="6" r="4" fill="#FFFFFF" />
            <circle cx="11" cy="6.5" r="3.5" fill="#FFFFFF" />
            <path d="M6 10 L10 10" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    );
  }

  if (type === "english") {
    return (
      <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80">
        <div className="absolute h-16 w-16 rounded-full bg-blue-300/20 blur-xl" />

        {/* 3D Isometric Open Book Artwork */}
        <svg
          viewBox="0 0 120 90"
          className="h-20 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="pageLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <linearGradient id="pageRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="60" cy="74" rx="36" ry="6" fill="#1E3A8A" fillOpacity="0.1" />

          {/* Book Hardcover Spine Backing */}
          <path
            d="M20 58 C38 52, 56 56, 60 62 C64 56, 82 52, 100 58 L100 64 C82 58, 64 62, 60 68 C56 62, 38 58, 20 64 Z"
            fill="url(#bookCover)"
          />

          {/* Page Leaf Left */}
          <path
            d="M22 55 C38 48, 55 52, 59 58 L59 28 C55 22, 38 18, 22 25 Z"
            fill="url(#pageLeft)"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />
          {/* Text lines on left page */}
          <line x1="28" y1="30" x2="48" y2="28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="36" x2="52" y2="34" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="28" y1="42" x2="50" y2="40" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="28" y1="48" x2="44" y2="46" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />

          {/* Page Leaf Right */}
          <path
            d="M61 58 C65 52, 82 48, 98 55 L98 25 C82 18, 65 22, 61 28 Z"
            fill="url(#pageRight)"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />
          {/* Text lines on right page */}
          <line x1="68" y1="28" x2="90" y2="30" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
          <line x1="68" y1="34" x2="92" y2="36" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="68" y1="40" x2="88" y2="42" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="68" y1="46" x2="84" y2="48" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />

          {/* Ribbon Bookmark */}
          <path
            d="M58 27 L62 27 L62 65 L60 62 L58 65 Z"
            fill="#EF4444"
          />

          {/* Floating 3D Typography "Aa" Badge */}
          <g transform="translate(80, 10)">
            <circle cx="14" cy="14" r="14" fill="#2563EB" filter="drop-shadow(0 4px 6px rgba(37,99,235,0.3))" />
            <text x="7" y="19" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Aa</text>
          </g>

          {/* Floating Feather Quill */}
          <g transform="translate(16, 8) rotate(-20)">
            <path
              d="M10 0 C12 6, 14 16, 6 24 C4 20, 2 12, 10 0 Z"
              fill="#F59E0B"
            />
            <line x1="10" y1="0" x2="3" y2="28" stroke="#D97706" strokeWidth="1" />
          </g>
        </svg>
      </div>
    );
  }

  if (type === "comprehension") {
    return (
      <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80">
        <div className="absolute h-16 w-16 rounded-full bg-sky-400/20 blur-xl" />

        {/* 3D Isometric Document & Magnifier Artwork */}
        <svg
          viewBox="0 0 120 90"
          className="h-20 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="58" cy="74" rx="34" ry="6" fill="#1E3A8A" fillOpacity="0.1" />

          {/* 3D Stacked Background Sheet */}
          <rect x="34" y="16" width="46" height="54" rx="5" fill="#E2E8F0" transform="rotate(-6 34 16)" />

          {/* 3D Main Document Sheet */}
          <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))">
            <rect x="32" y="15" width="46" height="54" rx="5" fill="url(#docGrad)" stroke="#CBD5E1" strokeWidth="1" />
            {/* Top accent badge */}
            <rect x="38" y="21" width="18" height="4" rx="2" fill="#2563EB" />
            {/* Document Text Rows */}
            <line x1="38" y1="30" x2="68" y2="30" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
            <line x1="38" y1="36" x2="72" y2="36" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="38" y1="42" x2="62" y2="42" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="38" y1="48" x2="70" y2="48" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="38" y1="54" x2="56" y2="54" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="38" y1="60" x2="66" y2="60" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Floating 3D Magnifying Glass */}
          <g transform="translate(60, 24)" filter="drop-shadow(0 6px 8px rgba(30,58,138,0.25))">
            {/* Handle */}
            <line x1="24" y1="24" x2="38" y2="38" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
            <line x1="24" y1="24" x2="38" y2="38" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
            {/* Outer Rim */}
            <circle cx="16" cy="16" r="16" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
            {/* Lens Glass with Sky Gradient */}
            <circle cx="16" cy="16" r="13" fill="url(#glassGrad)" />
            {/* Magnified Text Highlight */}
            <path d="M10 16 L14 20 L22 12" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Specular Highlight */}
            <path d="M8 12 A10 10 0 0 1 20 8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    );
  }

  // Arithmetic & Reasoning
  return (
    <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80">
      <div className="absolute h-16 w-16 rounded-full bg-blue-500/20 blur-xl" />

      {/* 3D Isometric Math Analytics & Shapes Artwork */}
      <svg
        viewBox="0 0 120 90"
        className="h-20 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bar1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="bar2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="bar3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="cubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>

        {/* Base Shadow */}
        <ellipse cx="60" cy="74" rx="36" ry="6" fill="#1E3A8A" fillOpacity="0.1" />

        {/* 3D Isometric Bar 1 */}
        <g transform="translate(24, 38)">
          <path d="M0 6 L8 0 L16 6 L8 12 Z" fill="#93C5FD" />
          <path d="M0 6 L8 12 L8 30 L0 24 Z" fill="#2563EB" />
          <path d="M8 12 L16 6 L16 24 L8 30 Z" fill="#1D4ED8" />
        </g>

        {/* 3D Isometric Bar 2 (Taller) */}
        <g transform="translate(42, 24)">
          <path d="M0 6 L8 0 L16 6 L8 12 Z" fill="#7DD3FC" />
          <path d="M0 6 L8 12 L8 44 L0 38 Z" fill="#0284C7" />
          <path d="M8 12 L16 6 L16 38 L8 44 Z" fill="#0369A1" />
        </g>

        {/* 3D Isometric Bar 3 (Tallest) */}
        <g transform="translate(60, 14)">
          <path d="M0 6 L8 0 L16 6 L8 12 Z" fill="#FDE68A" />
          <path d="M0 6 L8 12 L8 54 L0 48 Z" fill="#F59E0B" />
          <path d="M8 12 L16 6 L16 48 L8 54 Z" fill="#D97706" />
        </g>

        {/* Floating 3D Geometric Math Cube */}
        <g transform="translate(80, 20)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))">
          <path d="M12 0 L24 6 L12 12 L0 6 Z" fill="url(#cubeTop)" />
          <path d="M0 6 L12 12 L12 24 L0 18 Z" fill="#2563EB" />
          <path d="M12 12 L24 6 L24 18 L12 24 Z" fill="#1E40AF" />
          {/* Percentage symbol on top face */}
          <text x="8" y="16" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="sans-serif">%</text>
        </g>

        {/* Floating Math Symbols */}
        <g transform="translate(18, 16)">
          <circle cx="8" cy="8" r="8" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
          <path d="M5 8 L11 8 M8 5 L8 11" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <g transform="translate(76, 56)">
          <circle cx="7" cy="7" r="7" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M4 7 L10 7 M4 9.5 L10 9.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
