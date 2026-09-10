"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";

export function FinalCtaBanner() {
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
    <section className="border-t border-[#E2E8F0] bg-white px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div
          ref={cardRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#1E3A8A] to-[#2563EB] p-8 sm:p-14 lg:p-16 text-white shadow-2xl shadow-blue-900/20 border border-blue-400/30"
          style={
            {
              "--mouse-x": "50%",
              "--mouse-y": "50%",
            } as React.CSSProperties
          }
        >
          {/* 1. Subtle Dynamic Cursor Spotlight Glow (Reduced size & soft intensity) */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `
                radial-gradient(
                  180px circle at var(--mouse-x) var(--mouse-y),
                  rgba(255, 255, 255, 0.18) 0%,
                  rgba(147, 197, 253, 0.12) 35%,
                  rgba(59, 130, 246, 0.06) 65%,
                  transparent 80%
                )
              `,
            }}
          />

          {/* 2. Micro Grid Texture Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* 3. Ambient Background Depth Orbs */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-60 w-60 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-indigo-500/15 blur-3xl" />

          {/* Grid Layout: Left Content & Right Floating Test Badge */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Main Content */}
            <div className="lg:col-span-7 text-left">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 backdrop-blur-md border border-white/20 mb-4 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="label-sm uppercase tracking-wider text-blue-100 font-bold text-xs">
                  YOUR NSSB PREPARATION STARTS HERE
                </span>
              </div>

              {/* Headline */}
              <h2 className="headline-xl text-white font-serif leading-tight">
                Start With One Free Mock.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-100 to-white">
                  See Where You Stand.
                </span>
              </h2>

              {/* Description */}
              <p className="body-md text-blue-100/90 mt-4 leading-relaxed max-w-xl">
                No payment required to begin. Take your first full-length NSSB mock test, check your score and accuracy breakdown, and practice more whenever you are ready.
              </p>

              {/* CTA Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/exams"
                  className="group/btn relative overflow-hidden label-md inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-[#1D4ED8] font-bold shadow-lg hover:shadow-xl hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-200/40 to-transparent group-hover/btn:animate-btn-shimmer" />
                  <span>Start Your Free Mock</span>
                  <span className="transition-transform duration-200 group-hover/btn:translate-x-1 font-bold">
                    →
                  </span>
                </Link>

                <Link
                  href="/pricing"
                  className="label-sm inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-4 text-white font-semibold hover:bg-white/20 border border-white/20 backdrop-blur-xs transition-all"
                >
                  <span>View Full Package (₹499)</span>
                </Link>
              </div>

              {/* Trust Guarantees Row */}
              <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-blue-100/80">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> No credit card required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> Instant score & solutions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span> Official NSSB pattern
                </span>
              </div>
            </div>

            {/* Right Floating Test Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/25 bg-white/10 p-6 backdrop-blur-md shadow-xl text-left space-y-4 transition-transform duration-300 group-hover:scale-[1.01]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Free Mock Available
                  </span>
                  <span className="text-xs font-mono text-blue-200">
                    Full Syllabus Test
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-serif">
                    NSSB General Paper — Mock 01
                  </h3>
                  <p className="text-xs text-blue-200/90 mt-1">
                    Complete 5-section mock test matching the official Nagaland syllabus.
                  </p>
                </div>

                {/* Meta Matrix */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-center">
                  <div className="rounded-lg bg-white/10 p-2">
                    <div className="text-xs text-blue-200">Questions</div>
                    <div className="text-sm font-bold text-white font-mono">100</div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-2">
                    <div className="text-xs text-blue-200">Duration</div>
                    <div className="text-sm font-bold text-white font-mono">90 Min</div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-2">
                    <div className="text-xs text-blue-200">Max Marks</div>
                    <div className="text-sm font-bold text-white font-mono">200</div>
                  </div>
                </div>

                <Link
                  href="/exams"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold py-2.5 text-xs shadow-md transition-all"
                >
                  <span>Start Mock Test</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
