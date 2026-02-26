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
    <div className="tape bg-postit-yellow border border-amber-200 rounded-sm p-3 shadow-sm hover:shadow-md transition-shadow group">
      <div className="cursor-pointer" onClick={onClick}>
        {project.folder && (
          <span className="text-[10px] text-warm-400 block mb-0.5">
            {project.folder}
          </span>
        )}
        <h3 className="text-sm font-bold text-warm-800 truncate mb-1">
          {project.title}
        </h3>
        {project.memo && (
          <p className="text-xs text-warm-500 line-clamp-1 mb-2">
            {project.memo}
          </p>
        )}

        {/* 진행률 바 */}
        {project.progress > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-warm-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-main rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-warm-400">
                {project.progress}%
              </span>
            </div>
          </div>
        )}

        {/* 뱃지 */}
        <div className="flex flex-wrap gap-1">
          {yarns.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {yarns[0].name}{yarns.length > 1 && ` +${yarns.length - 1}`}
            </span>
          )}
          {needles.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {needles[0].size}{needles.length > 1 && ` +${needles.length - 1}`}
            </span>
          )}
          {project.difficulty > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {difficultyLabel[project.difficulty]}
            </span>
          )}
        </div>
      </div>

      {/* 시작하기 버튼 */}
      <button
        onClick={() => onStatusChange(project.id, "in-progress")}
        className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Play size={12} />
        시작하기
      </button>
    </div>
  );
}
