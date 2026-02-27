"use client";

import { Project } from "@prisma/client";
import { YarnInfo, NeedleInfo } from "@/types/project";
import { Play } from "lucide-react";

interface CompactProjectCardProps {
  project: Project;
  onStatusChange: (projectId: string, newStatus: string) => void;
  onClick: () => void;
}

const difficultyLabel = ["", "입문", "초급", "중급", "고급", "마스터"];

export default function CompactProjectCard({
  project,
  onStatusChange,
  onClick,
}: CompactProjectCardProps) {
  const yarns = (project.yarns as unknown as YarnInfo[]) || [];
  const needles = (project.needles as unknown as NeedleInfo[]) || [];

  return (
    <div className="bg-white border border-warm-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
      <div className="cursor-pointer" onClick={onClick}>
        {project.folder && (
          <span className="text-[10px] text-warm-300 font-medium tracking-wide uppercase">
            {project.folder}
          </span>
        )}
        <h3 className="text-sm font-semibold text-warm-800 truncate mt-0.5 mb-1.5 group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        {project.memo && (
          <p className="text-xs text-warm-400 line-clamp-1 mb-2">
            {project.memo}
          </p>
        )}

        {project.progress > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-warm-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent/60 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-warm-400 tabular-nums">
                {project.progress}%
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {yarns.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-50 text-warm-500 border border-warm-100">
              {yarns[0].name}{yarns.length > 1 && ` +${yarns.length - 1}`}
            </span>
          )}
          {needles.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-50 text-warm-500 border border-warm-100">
              {needles[0].size}{needles.length > 1 && ` +${needles.length - 1}`}
            </span>
          )}
          {project.difficulty > 1 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-50 text-warm-500 border border-warm-100">
              {difficultyLabel[project.difficulty]}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onStatusChange(project.id, "in-progress")}
        className="mt-3 w-full flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-accent bg-accent-light hover:bg-accent hover:text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <Play size={11} />
        시작하기
      </button>
    </div>
  );
}
