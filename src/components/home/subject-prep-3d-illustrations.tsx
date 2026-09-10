import React from "react";

interface SubjectPrepIllustrationProps {
  type: "gk_prep" | "computer_prep" | "english_prep" | "arithmetic_prep";
}

export function SubjectPrep3DIllustration({ type }: SubjectPrepIllustrationProps) {
  // 1. General Knowledge (History, Geography, Polity, Current Affairs & Science)
  // Visual: 3D Glossy World Globe on Chrome Arc Stand + Golden Discovery Compass Star & Map Beacon
  if (type === "gk_prep") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80 shadow-2xs p-1">
        <div className="absolute h-16 w-16 rounded-full bg-blue-400/20 blur-xl" />

        <svg
          viewBox="0 0 140 100"
          className="h-full max-h-20 w-auto transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="gkSphere" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="45%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </radialGradient>
            <linearGradient id="globeStand" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id="goldStar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="70" cy="84" rx="46" ry="7" fill="#1E3A8A" fillOpacity="0.1" />

          {/* 3D Stand Foot Base */}
          <ellipse cx="64" cy="78" rx="20" ry="5" fill="url(#globeStand)" />
          <path d="M60 62 L68 62 L66 78 L62 78 Z" fill="#94A3B8" />

          {/* 3D Curved Arc Arm (Behind Globe) */}
          <path
            d="M34 40 C32 18, 70 14, 88 32 C92 36, 92 48, 90 56"
            stroke="url(#globeStand)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* 3D Main World Globe Sphere */}
          <g transform="translate(62, 42)" filter="drop-shadow(0 6px 10px rgba(30,58,138,0.25))">
            <circle cx="0" cy="0" r="25" fill="url(#gkSphere)" />
            {/* Specular Highlight */}
            <ellipse cx="-8" cy="-11" rx="9" ry="5" fill="#FFFFFF" fillOpacity="0.45" transform="rotate(-30 -8 -11)" />
            {/* Longitude & Latitude Rings */}
            <ellipse cx="0" cy="0" rx="25" ry="10" stroke="#BFDBFE" strokeWidth="1.2" strokeOpacity="0.75" />
            <ellipse cx="0" cy="0" rx="12" ry="25" stroke="#BFDBFE" strokeWidth="1.2" strokeOpacity="0.75" />
            <line x1="-25" y1="0" x2="25" y2="0" stroke="#BFDBFE" strokeWidth="1.2" strokeOpacity="0.8" />
            <line x1="0" y1="-25" x2="0" y2="25" stroke="#BFDBFE" strokeWidth="1.2" strokeOpacity="0.8" />
          </g>

          {/* 3D Curved Arc Arm (Foreground Bottom Anchor) */}
          <path
            d="M90 56 C86 70, 52 74, 38 58"
            stroke="url(#globeStand)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* North and South Pole Pivot Caps */}
          <circle cx="62" cy="17" r="2.5" fill="#FBBF24" />
          <circle cx="62" cy="67" r="2.5" fill="#FBBF24" />

          {/* Floating 3D Golden Discovery Star (Top-Right) */}
          <g transform="translate(94, 14)" filter="drop-shadow(0 3px 6px rgba(217,119,6,0.35))">
            <polygon points="12,0 15,9 24,12 15,15 12,24 9,15 0,12 9,9" fill="url(#goldStar)" />
            <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
          </g>

          {/* Floating Red/White Map Pin (Left) */}
          <g transform="translate(14, 24)" filter="drop-shadow(0 3px 5px rgba(239,68,68,0.3))">
            <path d="M10 0 C4.5 0 0 4.5 0 10 C0 16 10 24 10 24 C10 24 20 16 20 10 C20 4.5 15.5 0 10 0 Z" fill="#EF4444" />
            <circle cx="10" cy="9" r="4" fill="#FFFFFF" />
          </g>
        </svg>
      </div>
    );
  }

  // 2. Computer Awareness (Hardware, Operating Systems, Office & Internet)
  // Visuals: 3D Motherboard PCB, Microprocessor & Cyber Shield (User Approved)
  if (type === "computer_prep") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80 shadow-2xs p-1">
        <div className="absolute h-16 w-16 rounded-full bg-cyan-400/20 blur-xl" />

        <svg
          viewBox="0 0 140 100"
          className="h-full max-h-20 w-auto transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="chipTop2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="circuitGold2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="shieldCyber2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="70" cy="84" rx="46" ry="7" fill="#1E3A8A" fillOpacity="0.1" />

          {/* 3D Isometric Motherboard PCB Base */}
          <g transform="translate(24, 32)">
            <path d="M46 0 L92 22 L46 44 L0 22 Z" fill="#1E293B" stroke="#3B82F6" strokeWidth="1" />
            <path d="M0 22 L46 44 L46 48 L0 26 Z" fill="#0F172A" />
            <path d="M46 44 L92 22 L92 26 L46 48 Z" fill="#1E1E2E" />

            {/* Glowing Golden Circuit Traces */}
            <path d="M18 16 L32 23 L26 26" stroke="url(#circuitGold2)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="18" cy="16" r="1.5" fill="#FDE047" />
            <path d="M72 12 L60 18 L64 20" stroke="url(#circuitGold2)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="72" cy="12" r="1.5" fill="#FDE047" />

            {/* 3D Isometric CPU Core Processor Die */}
            <g transform="translate(24, 9)">
              <path d="M22 0 L44 11 L22 22 L0 11 Z" fill="url(#chipTop2)" stroke="#60A5FA" strokeWidth="1" />
              <path d="M0 11 L22 22 L22 26 L0 15 Z" fill="#1D4ED8" />
              <path d="M22 22 L44 11 L44 15 L22 26 Z" fill="#1E40AF" />
              <rect x="18" y="8" width="8" height="6" rx="1.5" fill="#38BDF8" transform="rotate(-15 18 8)" />
            </g>
          </g>

          {/* Floating 3D Cyber Shield */}
          <g transform="translate(86, 16)" filter="drop-shadow(0 4px 6px rgba(37,99,235,0.3))">
            <path d="M16 0 L32 6 C32 20 24 30 16 34 C8 30 0 20 0 6 Z" fill="url(#shieldCyber2)" />
            <path d="M16 4 L28 9 C28 19 22 27 16 30 C10 27 4 19 4 9 Z" fill="#FFFFFF" fillOpacity="0.25" />
            <circle cx="16" cy="14" r="3" fill="#FFFFFF" />
            <path d="M14.5 16 L17.5 16 L18.5 22 L13.5 22 Z" fill="#FFFFFF" />
          </g>

          <circle cx="28" cy="22" r="3" fill="#38BDF8" filter="drop-shadow(0 2px 4px rgba(56,189,248,0.4))" />
          <circle cx="18" cy="42" r="2" fill="#818CF8" />
        </svg>
      </div>
    );
  }

  // 3. General English (Grammar, Vocabulary, Spelling, Synonyms, Antonyms, Idioms)
  // Visuals: 3D Open Grammar Book + Floating Bold "Aa" & "Z" Letters + Golden Fountain Pen
  if (type === "english_prep") {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80 shadow-2xs p-1">
        <div className="absolute h-16 w-16 rounded-full bg-blue-400/20 blur-xl" />

        <svg
          viewBox="0 0 140 100"
          className="h-full max-h-20 w-auto transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bookCoverEng" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="penGoldNib" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Floor Shadow */}
          <ellipse cx="70" cy="84" rx="46" ry="7" fill="#1E3A8A" fillOpacity="0.1" />

          {/* 3D Open Book Base */}
          <g transform="translate(18, 32)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))">
            {/* Book Hardcover Spine */}
            <path d="M0 38 C18 32, 46 36, 52 44 C58 36, 86 32, 104 38 L104 44 C86 38, 58 42, 52 50 C46 42, 18 38, 0 44 Z" fill="url(#bookCoverEng)" />

            {/* Left Page Leaf */}
            <path d="M2 35 C20 28, 48 32, 51 40 L51 12 C48 4, 20 0, 2 8 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
            {/* Left Page Grammar Text Lines */}
            <line x1="10" y1="14" x2="36" y2="12" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="20" x2="42" y2="18" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="10" y1="26" x2="38" y2="24" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />

            {/* Right Page Leaf */}
            <path d="M53 40 C56 32, 84 28, 102 35 L102 8 C84 0, 56 4, 53 12 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="0.8" />
            {/* Right Page Grammar Text Lines */}
            <line x1="62" y1="12" x2="92" y2="14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
            <line x1="62" y1="18" x2="94" y2="20" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="62" y1="24" x2="86" y2="26" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />

            {/* Red Bookmark Ribbon */}
            <path d="M50 12 L54 12 L54 48 L52 45 L50 48 Z" fill="#EF4444" />
          </g>

          {/* Floating 3D Typography "Aa" Badge (Center Top) */}
          <g transform="translate(56, 12)" filter="drop-shadow(0 4px 6px rgba(37,99,235,0.35))">
            <circle cx="14" cy="14" r="14" fill="#2563EB" />
            <text x="6" y="20" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="serif">Aa</text>
          </g>

          {/* Floating 3D Golden Fountain Pen (Right) */}
          <g transform="translate(94, 16) rotate(-22)" filter="drop-shadow(0 3px 5px rgba(217,119,6,0.3))">
            {/* Pen Barrel */}
            <rect x="3" y="0" width="8" height="24" rx="2" fill="#1E293B" />
            <rect x="3" y="24" width="8" height="3" fill="#D97706" />
            {/* Gold Nib */}
            <polygon points="3,27 11,27 7,38" fill="url(#penGoldNib)" />
            <line x1="7" y1="27" x2="7" y2="36" stroke="#1E293B" strokeWidth="0.8" />
          </g>

          {/* Floating Letter "Z" (Left Top) */}
          <g transform="translate(18, 14)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))">
            <circle cx="9" cy="9" r="9" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.2" />
            <text x="5.5" y="13.5" fill="#1D4ED8" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Z</text>
          </g>
        </svg>
      </div>
    );
  }

  // 4. Arithmetic & Reasoning (Number System, Percentages, Ratio, Data Interpretation, Problem Solving)
  // Visuals: 3D Digital Calculator + Triangular Drafting Ruler + 3D Percentage & Math Operator Badges
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#EFF6FF] via-[#F0F7FF] to-[#F8FAFC] border border-[#DBEAFE]/80 shadow-2xs p-1">
      <div className="absolute h-16 w-16 rounded-full bg-blue-500/20 blur-xl" />

      <svg
        viewBox="0 0 140 100"
        className="h-full max-h-20 w-auto transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="calcBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EFF6FF" />
          </linearGradient>
          <linearGradient id="rulerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Floor Shadow */}
        <ellipse cx="70" cy="84" rx="46" ry="7" fill="#1E3A8A" fillOpacity="0.1" />

        {/* 3D Isometric Calculator (Left) */}
        <g transform="translate(20, 24)" filter="drop-shadow(0 4px 8px rgba(30,58,138,0.18))">
          {/* Main Calculator Base Block */}
          <rect x="0" y="0" width="46" height="54" rx="6" fill="url(#calcBody)" stroke="#93C5FD" strokeWidth="1.2" />
          <path d="M0 48 L46 48 L46 54 L0 54 Z" fill="#BFDBFE" />
          
          {/* LCD Digital Display Screen */}
          <rect x="5" y="6" width="36" height="13" rx="3" fill="#1E293B" />
          <text x="37" y="16" fill="#34D399" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="end">89.4%</text>

          {/* Calculator Keypad Grid */}
          {/* Row 1 */}
          <rect x="6" y="23" width="7" height="6" rx="1.5" fill="#DBEAFE" />
          <rect x="15" y="23" width="7" height="6" rx="1.5" fill="#DBEAFE" />
          <rect x="24" y="23" width="7" height="6" rx="1.5" fill="#DBEAFE" />
          <rect x="33" y="23" width="7" height="6" rx="1.5" fill="#F59E0B" />

          {/* Row 2 */}
          <rect x="6" y="31" width="7" height="6" rx="1.5" fill="#DBEAFE" />
          <rect x="15" y="31" width="7" height="6" rx="1.5" fill="#DBEAFE" />
          <rect x="24" y="31" width="7" height="6" rx="1.5" fill="#DBEAFE" />
          <rect x="33" y="31" width="7" height="6" rx="1.5" fill="#2563EB" />

          {/* Row 3 */}
          <rect x="6" y="39" width="7" height="6" rx="1.5" fill="#DBEAFE" />
          <rect x="15" y="39" width="7" height="6" rx="1.5" fill="#DBEAFE" />
          <rect x="24" y="39" width="7" height="6" rx="1.5" fill="#10B981" />
          <rect x="33" y="39" width="7" height="6" rx="1.5" fill="#2563EB" />
        </g>

        {/* 3D Geometry Drafting Triangular Set Square / Ruler (Right) */}
        <g transform="translate(74, 26)" filter="drop-shadow(0 3px 6px rgba(2,132,199,0.25))">
          {/* Outer Triangle */}
          <polygon points="0,52 46,52 0,6" fill="url(#rulerGrad)" stroke="#0284C7" strokeWidth="1.2" />
          {/* Inner Triangle Cutout */}
          <polygon points="8,46 34,46 8,20" fill="#FFFFFF" fillOpacity="0.8" stroke="#0284C7" strokeWidth="0.8" />
          {/* Ruler Measurement Tick Marks */}
          <line x1="3" y1="12" x2="6" y2="12" stroke="#0369A1" strokeWidth="1" />
          <line x1="3" y1="20" x2="6" y2="20" stroke="#0369A1" strokeWidth="1" />
          <line x1="3" y1="28" x2="6" y2="28" stroke="#0369A1" strokeWidth="1" />
          <line x1="3" y1="36" x2="6" y2="36" stroke="#0369A1" strokeWidth="1" />
          <line x1="3" y1="44" x2="6" y2="44" stroke="#0369A1" strokeWidth="1" />
        </g>

        {/* Floating 3D Percentage Node */}
        <g transform="translate(100, 14)" filter="drop-shadow(0 4px 6px rgba(37,99,235,0.3))">
          <circle cx="13" cy="13" r="13" fill="#2563EB" />
          <text x="8" y="18" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">%</text>
        </g>

        {/* Floating Math Symbols */}
        <g transform="translate(8, 14)">
          <circle cx="7" cy="7" r="7" fill="#10B981" />
          <text x="4" y="11" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">+</text>
        </g>
      </svg>
    </div>
  );
}
