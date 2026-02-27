"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Project } from "@prisma/client";
import { Check, Timer, Calculator } from "lucide-react";

interface DashboardSidebarProps {
  doneProjects: Project[];
  onProjectClick: (project: Project) => void;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardSidebar({
  doneProjects,
  onProjectClick,
}: DashboardSidebarProps) {
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

  const recentDone = doneProjects.slice(0, 5);

  return (
    <aside className="space-y-4">
      {/* 타이머 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
        <div className="flex items-center gap-2 mb-4">
          <Timer size={13} className="text-warm-400" />
          <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider">
            타이머
          </h3>
        </div>
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

      {/* 게이지 계산기 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={13} className="text-warm-400" />
          <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider">
            게이지 계산기
          </h3>
        </div>
        <div className="space-y-2.5">
          <div>
            <label className="text-[11px] text-warm-400 block mb-1">
              10cm당 코 수
            </label>
            <input
              type="number"
              value={gaugePer10cm}
              onChange={(e) => setGaugePer10cm(e.target.value)}
              className="w-full px-3 py-2 bg-warm-50 border border-warm-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
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
              className="w-full px-3 py-2 bg-warm-50 border border-warm-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
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

      {/* 최근 완성 */}
      {recentDone.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
          <div className="flex items-center gap-2 mb-4">
            <Check size={13} className="text-sage-main" />
            <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider">
              최근 완성
            </h3>
          </div>
          <div className="space-y-1">
            {recentDone.map((project) => (
              <button
                key={project.id}
                onClick={() => onProjectClick(project)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-warm-50 transition-all text-left group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-sage-main/40 flex-shrink-0" />
                <span className="text-sm text-warm-600 truncate flex-1 group-hover:text-warm-800">
                  {project.title}
                </span>
                {project.endDate && (
                  <span className="text-[10px] text-warm-300 flex-shrink-0">
                    {formatDate(project.endDate)}
                  </span>
                )}
              </button>
            ))}
          </div>
          {doneProjects.length > 5 && (
            <p className="text-[10px] text-warm-300 text-center mt-2">
              +{doneProjects.length - 5}개 더
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
