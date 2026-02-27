"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SidebarProps {
  onAddProject: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function Sidebar({
  onAddProject,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: SidebarProps) {
  const [stitchCount, setStitchCount] = useState(0);

  const [gaugePer10cm, setGaugePer10cm] = useState("");
  const [desiredWidth, setDesiredWidth] = useState("");
  const calculatedStitches =
    gaugePer10cm && desiredWidth
      ? Math.round((Number(gaugePer10cm) / 10) * Number(desiredWidth))
      : null;

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
    <aside className="w-64 flex-shrink-0 space-y-4">
      <button
        onClick={onAddProject}
        className="w-full py-2.5 bg-warm-800 text-white rounded-xl hover:bg-warm-700 transition-colors font-medium text-sm"
      >
        + 새 프로젝트
      </button>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-warm-100">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="검색..."
          className="w-full px-3 py-2 bg-warm-50 border border-warm-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-warm-100">
        <label className="text-[11px] font-medium text-warm-400 uppercase tracking-wider block mb-2">
          정렬
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 bg-warm-50 border border-warm-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="recent">최신순</option>
          <option value="name">이름순</option>
          <option value="progress">진행률순</option>
          <option value="difficulty">난이도순</option>
        </select>
      </div>

      <div className="border-t border-warm-100" />

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
        <h3 className="text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-3">
          코 카운터
        </h3>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setStitchCount((c) => Math.max(0, c - 1))}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-warm-100 text-warm-600 hover:bg-warm-200 transition-all text-lg font-bold"
          >
            -
          </button>
          <span className="text-4xl font-light text-warm-800 min-w-[60px] text-center tabular-nums">
            {stitchCount}
          </span>
          <button
            onClick={() => setStitchCount((c) => c + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-accent text-white hover:bg-accent/85 transition-all text-lg font-bold"
          >
            +
          </button>
        </div>
        <button
          onClick={() => setStitchCount(0)}
          className="w-full mt-2 text-xs text-warm-300 hover:text-warm-600 transition-colors"
        >
          리셋
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
        <h3 className="text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-3">
          게이지 계산기
        </h3>
        <div className="space-y-2.5">
          <div>
            <label className="text-[11px] text-warm-400 block mb-1">
              10cm당 코 수
            </label>
            <input
              type="number"
              value={gaugePer10cm}
              onChange={(e) => setGaugePer10cm(e.target.value)}
              className="w-full px-3 py-2 bg-warm-50 border border-warm-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="예: 20"
            />
          </div>
          <div>
            <label className="text-[11px] text-warm-400 block mb-1">
              원하는 폭 (cm)
            </label>
            <input
              type="number"
              value={desiredWidth}
              onChange={(e) => setDesiredWidth(e.target.value)}
              className="w-full px-3 py-2 bg-warm-50 border border-warm-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="예: 50"
            />
          </div>
          {calculatedStitches !== null && (
            <div className="text-center pt-2 pb-1 bg-accent-light rounded-lg">
              <span className="text-[11px] text-warm-400">필요한 코 수 </span>
              <span className="text-xl font-serif text-accent">
                {calculatedStitches}
              </span>
              <span className="text-[11px] text-warm-400"> 코</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
        <h3 className="text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-3">
          타이머
        </h3>
        <div className="text-center">
          <span className="text-3xl font-light text-warm-800 block mb-3 tabular-nums tracking-wider">
            {formatTime(timerSeconds)}
          </span>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timerRunning
                  ? "bg-warm-100 text-warm-600 hover:bg-warm-200"
                  : "bg-accent text-white hover:bg-accent/85"
              }`}
            >
              {timerRunning ? "정지" : "시작"}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="px-4 py-2 rounded-lg text-sm text-warm-400 hover:text-warm-600 hover:bg-warm-50 transition-all"
            >
              리셋
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
