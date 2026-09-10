"use client";

import React, { useRef, useState, useCallback } from "react";

interface StepData {
  step: string;
  title: string;
  description: string;
  icon: string;
}

const steps: StepData[] = [
  {
    step: "01",
    title: "Choose Your Subject",
    description:
      "Select General Knowledge, Computer, English, Comprehension, Arithmetic or Reasoning.",
    icon: "🎯",
  },
  {
    step: "02",
    title: "Take the Test",
    description:
      "Answer questions under a timer and practise managing exam pressure.",
    icon: "⏱️",
  },
  {
    step: "03",
    title: "Analyse Your Result",
    description:
      "Review your score and accuracy to identify what needs more work.",
    icon: "📊",
  },
];

function StepCard({ item, idx }: { item: StepData; idx: number }) {
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
      className="group relative flex flex-col justify-between rounded-3xl border border-[#E2E8F0] bg-white p-7 sm:p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/70 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* 1. Interactive Cursor Follow Spotlight Glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(220px circle at var(--mouse-x) var(--mouse-y), rgba(219, 234, 254, 0.45) 0%, rgba(239, 246, 255, 0.2) 40%, transparent 75%)`,
        }}
      />

      {/* 2. Card Content (Exact Original Height & Typography) */}
      <div className="relative z-10">
        {/* Step Number Row with Micro-Badge */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-3xl sm:text-4xl font-bold text-[#93C5FD] group-hover:text-[#2563EB] transition-colors duration-300">
            {item.step}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 border border-slate-200/70 text-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:shadow-xs">
            {item.icon}
          </span>
        </div>

        {/* Title */}
        <h3 className="headline-sm text-[#0F172A] mt-4 group-hover:text-[#2563EB] transition-colors duration-200 leading-snug">
          {item.title}
        </h3>

        {/* Description */}
        <p className="body-sm text-[#64748B] mt-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* 3. Subtle Animated Bottom Accent Glow Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] to-[#60A5FA] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
}

export function InteractiveStepsSection() {
  return (
    <section className="border-t border-[#E2E8F0] bg-white px-6 py-16 sm:py-20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="label-sm uppercase tracking-wider text-[#2563EB]">
            SIMPLE 3-STEP PREPARATION
          </p>
          <h2 className="headline-lg text-[#0F172A] mt-2 font-serif">
            Practice. Analyse. Improve.
          </h2>
        </div>

        {/* 3-Column Card Grid (Preserving exact original dimensions) */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((item, idx) => (
            <StepCard key={item.step} item={item} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
