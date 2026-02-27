"use client";

import { Project } from "@prisma/client";
import { YarnInfo } from "@/types/project";
import { Play, Trash2 } from "lucide-react";

interface CompactProjectCardProps {
  project: Project;
  onStatusChange: (projectId: string, newStatus: string) => void;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

const difficultyLabel = ["", "입문", "초급", "중급", "고급", "마스터"];

export default function CompactProjectCard({
  project,
  onStatusChange,
  onClick,
  onDelete,
}: CompactProjectCardProps) {
  const yarns = (project.yarns as unknown as YarnInfo[]) || [];

  return (
    <div
      className="bg-white border border-warm-100 rounded-xl p-3.5 hover:shadow-sm transition-all cursor-pointer group relative"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {project.folder && (
            <span className="text-[10px] text-warm-300 font-medium tracking-wide uppercase">
              {project.folder}
            </span>
          )}
          <h3 className="text-sm font-semibold text-warm-700 truncate mt-0.5 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
        </div>
        {project.progress > 0 && (
          <span className="text-[11px] font-medium text-warm-400 tabular-nums flex-shrink-0">
            {project.progress}%
          </span>
        )}
      </div>

      {project.progress > 0 && (
        <div className="mt-2">
          <div className="h-1 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent/50 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-end mt-2.5">
        <div className="flex flex-wrap gap-1 flex-1">
          {yarns.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-50 text-warm-500">
              {yarns[0].name}
            </span>
          )}
          {project.difficulty > 1 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-50 text-warm-500">
              {difficultyLabel[project.difficulty]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
              className="p-1 text-warm-300 hover:text-red-500 rounded hover:bg-red-50 transition-all"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(project.id, "in-progress"); }}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-accent hover:bg-accent hover:text-white transition-all"
          >
            <Play size={9} />
            시작
          </button>
        </div>
      </div>
    </div>
  );
}
