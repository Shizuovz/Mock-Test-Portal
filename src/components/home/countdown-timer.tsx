"use client";

import { useEffect, useState } from "react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<{
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    days: "02",
    hours: "18",
    minutes: "45",
    seconds: "20",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const getTargetTime = () => {
      const now = new Date();
      // Target: 2 days + remaining hours today (rolling 3-day promotional window)
      const target = new Date();
      target.setDate(target.getDate() + 2);
      target.setHours(23, 59, 59, 999);
      const diff = target.getTime() - now.getTime();
      return diff > 0 ? Math.floor(diff / 1000) : 2 * 86400 + 18 * 3600;
    };

    let remainingSeconds = getTargetTime();

    const updateTimer = () => {
      if (remainingSeconds <= 0) {
        remainingSeconds = 2 * 86400 + 12 * 3600;
      } else {
        remainingSeconds -= 1;
      }

      const d = Math.floor(remainingSeconds / 86400);
      const h = Math.floor((remainingSeconds % 86400) / 3600);
      const m = Math.floor((remainingSeconds % 3600) / 60);
      const s = remainingSeconds % 60;

      setTimeLeft({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50/90 border border-amber-200/80 px-2.5 py-0.5 text-[11px] text-amber-900 shadow-2xs">
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
      </span>
      <span className="font-bold tracking-wide uppercase text-[10px] text-amber-800">
        Limited Free Access
      </span>
      <span className="text-amber-300 select-none">•</span>
      <span className="font-mono text-[11px] font-semibold text-amber-700">
        {mounted
          ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s left`
          : "2d 18h left"}
      </span>
    </div>
  );
}
