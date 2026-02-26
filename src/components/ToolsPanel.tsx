"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Wrench, ChevronDown, ChevronUp } from "lucide-react";

export default function ToolsPanel() {
  const [open, setOpen] = useState(false);

  // 게이지 계산기
  const [gaugePer10cm, setGaugePer10cm] = useState("");
  const [desiredWidth, setDesiredWidth] = useState("");
  const calculatedStitches =
    gaugePer10cm && desiredWidth
      ? Math.round((Number(gaugePer10cm) / 10) * Number(desiredWidth))
      : null;

  // 타이머
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className="bg-warm-50/90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-warm-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-warm-500" />
          <span className="text-sm font-medium text-warm-600">도구</span>
          {timerRunning && (
            <span className="text-xs text-rose-main font-medium">
              {formatTime(timerSeconds)}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown size={16} className="text-warm-400" />
        ) : (
          <ChevronUp size={16} className="text-warm-400" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 게이지 계산기 */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider">
              게이지 계산기
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-warm-500 block mb-0.5">
                  10cm당 코 수
                </label>
                <input
                  type="number"
                  value={gaugePer10cm}
                  onChange={(e) => setGaugePer10cm(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white/70 border border-warm-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                  placeholder="예: 20"
                />
              </div>
              <div>
                <label className="text-xs text-warm-500 block mb-0.5">
                  원하는 폭 (cm)
                </label>
                <input
                  type="number"
                  value={desiredWidth}
                  onChange={(e) => setDesiredWidth(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white/70 border border-warm-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                  placeholder="예: 50"
                />
              </div>
            </div>
            {calculatedStitches !== null && (
              <div className="text-center pt-1">
                <span className="text-xs text-warm-400">필요한 코 수: </span>
                <span className="text-xl text-warm-800 font-medium">
                  {calculatedStitches}
                </span>
                <span className="text-xs text-warm-400"> 코</span>
              </div>
            )}
          </div>

          {/* 타이머 */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider">
              타이머
            </h3>
            <div className="text-center">
              <span className="text-3xl text-warm-800 block mb-2">
                {formatTime(timerSeconds)}
              </span>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    timerRunning
                      ? "bg-warm-200 text-warm-600 hover:bg-warm-300"
                      : "bg-rose-main text-white hover:bg-rose-main/80"
                  }`}
                >
                  {timerRunning ? "정지" : "시작"}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="px-3 py-1.5 rounded-md text-sm text-warm-400 hover:text-warm-600 hover:bg-warm-100 transition-colors"
                >
                  리셋
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
