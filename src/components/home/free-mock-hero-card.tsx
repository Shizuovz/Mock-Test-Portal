"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";

export function FreeMockHeroCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="lg:col-span-5 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] p-8 sm:p-10 text-white flex flex-col justify-between shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/30 border border-blue-400/20"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* 1. Spotlight Cursor Follow Glow (Tight, focused specular spotlight) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `
            radial-gradient(
              180px circle at var(--mouse-x) var(--mouse-y),
              rgba(255, 255, 255, 0.38) 0%,
              rgba(147, 197, 253, 0.25) 30%,
              rgba(59, 130, 246, 0.1) 60%,
              transparent 80%
            ),
            radial-gradient(
              300px circle at var(--mouse-x) var(--mouse-y),
              rgba(96, 165, 250, 0.15) 0%,
              transparent 65%
            )
          `,
        }}
      />

      {/* 2. Interactive Spotlight Border Glow (Tighter border illumination) */}
      <div
        className="pointer-events-none absolute -inset-[1px] rounded-3xl transition-opacity duration-300 ease-out z-20"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(160px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.75), rgba(147, 197, 253, 0.35) 45%, transparent 75%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
      />

      {/* 3. Subtle Technical Grid Texture Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)`,
          backgroundSize: "22px 22px",
        }}
      />

      {/* 4. Soft Ambient Background Blobs */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-blue-950/50 blur-xl" />

      {/* Content Area (Elevated z-index for crisp legibility and full clickability) */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur-md border border-white/20">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse" />
          <p className="label-sm uppercase tracking-wider text-blue-100 font-bold">
            START FREE
          </p>
        </div>
        <h2 className="headline-lg text-white mt-4 leading-tight font-serif">
          Your First Complete NSSB Mock Is On Us.
        </h2>
        <p className="body-md text-blue-100/90 mt-4 leading-relaxed">
          Experience the full mock-test flow before you pay anything. Complete your first test, see your score and decide if you want more practice.
        </p>
      </div>

      <div className="relative z-10 mt-8 pt-2">
        <Link
          href="/exams"
          className="label-md inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-[#1D4ED8] font-bold hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
        >
          <span>Start My Free Mock</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1 font-bold">→</span>
        </Link>
      </div>
    </div>
  );
}
