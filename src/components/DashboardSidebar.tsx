"use client";

import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { Timer, Calculator, Play, Pause, RotateCcw, ChevronDown } from "lucide-react";

export function CompactTimerIcon() {
  return <Timer size={13} />;
}

export function CompactGaugeIcon() {
  return <Calculator size={13} />;
}

export function SidebarSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 mb-3 group"
      >
        <span className="text-warm-400">{icon}</span>
        <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider flex-1 text-left">{title}</h3>
        <ChevronDown
          size={14}
          className={`text-warm-300 group-hover:text-warm-500 transition-all duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && children}
    </div>
  );
}

export function CompactTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatTime = useCallback((s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="text-center">
      <span className="text-3xl font-light text-warm-800 block mb-3 tabular-nums tracking-wider">
        {formatTime(seconds)}
      </span>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setRunning(!running)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            running
              ? "bg-warm-100 text-warm-600 hover:bg-warm-200"
              : "bg-accent text-white hover:bg-accent/85"
          }`}
        >
          {running ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        {seconds > 0 && (
          <button
            onClick={() => { setRunning(false); setSeconds(0); }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-warm-400 hover:bg-warm-100 transition-all"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function CompactGaugeForm() {
  const [stitches, setStitches] = useState("");
  const [width, setWidth] = useState("");

  const result = stitches && width
    ? Math.round((Number(stitches) / 10) * Number(width))
    : null;

  return (
    <div className="space-y-2.5">
      <div>
        <label className="text-[11px] text-warm-400 block mb-1">10cm당 코 수</label>
        <input
          type="number"
          value={stitches}
          onChange={(e) => setStitches(e.target.value)}
          className="w-full px-3 py-2 bg-warm-50 border border-warm-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
          placeholder="예: 20"
        />
      </div>
      <div>
        <label className="text-[11px] text-warm-400 block mb-1">원하는 폭 (cm)</label>
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          className="w-full px-3 py-2 bg-warm-50 border border-warm-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
          placeholder="예: 50"
        />
      </div>
      {result !== null && (
        <div className="text-center pt-2 pb-1 bg-accent-light rounded-lg">
          <span className="text-[11px] text-warm-400">필요한 코 수 </span>
          <span className="text-xl font-bold text-accent">{result}</span>
          <span className="text-[11px] text-warm-400"> 코</span>
        </div>
      )}
    </div>
  );
}
