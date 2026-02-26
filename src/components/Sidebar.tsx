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
  // 코 카운터
  const [stitchCount, setStitchCount] = useState(0);

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
    <aside className="w-64 flex-shrink-0 space-y-4">
      {/* 새 프로젝트 */}
      <button
        onClick={onAddProject}
        className="w-full py-2.5 bg-warm-700 text-white rounded-lg hover:bg-warm-800 transition-colors font-medium text-sm shadow-md"
      >
        + 새 프로젝트
      </button>

      {/* 검색 */}
      <div className="bg-warm-50/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="검색..."
          className="w-full px-3 py-1.5 bg-white/70 border border-warm-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
        />
      </div>

      {/* 정렬 */}
      <div className="bg-warm-50/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <label className="text-xs font-medium text-warm-400 uppercase tracking-wider block mb-1.5">
          정렬
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white/70 border border-warm-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
        >
          <option value="recent">최신순</option>
          <option value="name">이름순</option>
          <option value="progress">진행률순</option>
          <option value="difficulty">난이도순</option>
        </select>
      </div>

      {/* 구분선 */}
      <div className="border-t border-warm-300/50" />

      {/* 코 카운터 */}
      <div className="bg-warm-50/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
        <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">
          코 카운터
        </h3>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setStitchCount((c) => Math.max(0, c - 1))}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-warm-200 text-warm-600 hover:bg-warm-300 transition-colors text-lg font-bold"
          >
            -
          </button>
          <span className="text-4xl text-warm-800 min-w-[60px] text-center">
            {stitchCount}
          </span>
          <button
            onClick={() => setStitchCount((c) => c + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-rose-main text-white hover:bg-rose-main/80 transition-colors text-lg font-bold"
          >
            +
          </button>
        </div>
        <button
          onClick={() => setStitchCount(0)}
          className="w-full mt-2 text-xs text-warm-400 hover:text-warm-600 transition-colors"
        >
          리셋
        </button>
      </div>

      {/* 게이지 계산기 */}
      <div className="bg-warm-50/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
        <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">
          게이지 계산기
        </h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-warm-500 block mb-0.5">
              10cm당 코 수
            </label>
            <input
              type="number"
              value={gaugePer10cm}
              onChange={(e) => setGaugePer10cm(e.target.value)}
              className="w-full px-2 py-1 bg-white/70 border border-warm-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
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
              className="w-full px-2 py-1 bg-white/70 border border-warm-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
              placeholder="예: 50"
            />
          </div>
          {calculatedStitches !== null && (
            <div className="text-center pt-1">
              <span className="text-xs text-warm-400">필요한 코 수: </span>
              <span className="text-2xl text-warm-800">
                {calculatedStitches}
              </span>
              <span className="text-xs text-warm-400"> 코</span>
            </div>
          )}
        </div>
      </div>

      {/* 타이머 */}
      <div className="bg-warm-50/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
        <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">
          타이머
        </h3>
        <div className="text-center">
          <span className="text-3xl text-warm-800 block mb-3">
            {formatTime(timerSeconds)}
          </span>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
              className="px-3 py-1 rounded-md text-sm text-warm-400 hover:text-warm-600 hover:bg-warm-100 transition-colors"
            >
              리셋
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
