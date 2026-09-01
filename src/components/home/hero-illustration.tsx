"use client";

export function HeroIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-lg items-center justify-center lg:max-w-none">
      {/* 1. Large 3D Isometric Blue/Indigo Backdrop Plane */}
      <div className="relative w-full aspect-[4/3] max-w-[540px] overflow-hidden rounded-3xl bg-gradient-to-tr from-[#4F46E5] via-[#6366F1] to-[#38BDF8] p-6 shadow-2xl shadow-indigo-500/20">
        {/* Isometric Grid Floor Overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Diagonal Perspective Accent Shapes */}
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-900/20 blur-xl pointer-events-none" />

        {/* 2. Stylized Main Screen Terminal (Isometric Tilt Effect) */}
        <div className="relative z-10 mx-auto flex h-full flex-col justify-between rounded-2xl border border-white/40 bg-white/95 p-4 shadow-2xl backdrop-blur-md transition duration-500 hover:scale-[1.01]">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
              <span className="ml-1.5 text-[11px] font-bold text-[#4F46E5]">
                MockTest CBT Engine 2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-bold text-[#4F46E5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              Live Evaluation
            </div>
          </div>

          {/* Dashboard Canvas Area */}
          <div className="mt-3 grid grid-cols-12 gap-3 flex-1">
            {/* Left Scorecard & Bar Chart (7 cols) */}
            <div className="col-span-7 flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Score & Pacing Analytics
                  </span>
                  <span className="text-[10px] font-bold text-[#16A34A]">94.6% Accuracy</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-[#0F172A]">182.5</span>
                  <span className="text-[11px] font-semibold text-[#64748B]">/ 200 Marks</span>
                </div>
              </div>

              {/* Bar Chart Bars */}
              <div className="mt-2 flex h-24 items-end gap-1.5 border-b border-[#E2E8F0] pb-1 px-1">
                {[
                  { h: 65, color: "bg-[#4F46E5]", label: "GS" },
                  { h: 88, color: "bg-[#16A34A]", label: "NPSC" },
                  { h: 45, color: "bg-[#4F46E5]", label: "GK" },
                  { h: 92, color: "bg-[#16A34A]", label: "Math" },
                  { h: 78, color: "bg-[#4F46E5]", label: "Eng" },
                  { h: 84, color: "bg-[#16A34A]", label: "NSSB" },
                  { h: 96, color: "bg-[#4F46E5]", label: "Tier 1" },
                ].map((b, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      style={{ height: `${b.h}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${b.color}`}
                    />
                    <span className="text-[8px] font-medium text-[#64748B]">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Mini Widgets (5 cols) */}
            <div className="col-span-5 flex flex-col justify-between gap-2">
              {/* Doughnut / Circular Accuracy Widget */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                  Subject Breakdown
                </span>
                <div className="relative mx-auto my-1.5 flex h-14 w-14 items-center justify-center">
                  {/* SVG Donut */}
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="3.5"
                      strokeDasharray="60 100"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="3.5"
                      strokeDasharray="25 100"
                      strokeDashoffset="-60"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-extrabold text-[#0F172A]">88%</span>
                </div>
                <span className="text-[9px] font-semibold text-[#16A34A]">Rank #12 / 1,480</span>
              </div>

              {/* Live Timer Status Card */}
              <div className="rounded-xl border border-[#EEF2FF] bg-[#EEF2FF] p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#4F46E5]">
                  <span>⏱️</span>
                  <span>45:20 Remaining</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-indigo-200">
                  <div className="h-full w-2/3 bg-[#4F46E5] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Desk / Laptop Foreground */}
          <div className="mt-2.5 flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-sm">💻</span>
              <span className="font-semibold text-[#0F172A]">NSSB CGL Full Mock 04</span>
            </div>
            <span className="rounded bg-[#DCFCE7] px-2 py-0.5 font-bold text-[#16A34A]">
              In Progress
            </span>
          </div>
        </div>

        {/* 3. Floating Feature Chips */}
        <div className="absolute -bottom-3 left-4 z-20 flex items-center gap-2 rounded-full border border-white/80 bg-white px-3.5 py-1.5 shadow-lg backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-[#16A34A]" />
          <span className="text-xs font-bold text-[#0F172A]">100% CBT Simulation</span>
        </div>

        <div className="absolute -top-3 right-4 z-20 flex items-center gap-2 rounded-full border border-white/80 bg-white px-3.5 py-1.5 shadow-lg backdrop-blur-md">
          <span className="text-xs">⚡</span>
          <span className="text-xs font-bold text-[#4F46E5]">Real-time Negative Marking</span>
        </div>
      </div>

      {/* 4. Floating WhatsApp-style Quick Assist Button (Bottom Right) */}
      <a
        href="https://wa.me/"
        target="_blank"
        rel="noopener noreferrer"
        title="Student Support & Exam Queries"
        className="absolute -bottom-4 -right-2 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl"
      >
        <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
      </a>
    </div>
  );
}
