"use client";

import { Project } from "@prisma/client";
import { YarnInfo } from "@/types/project";
import { Check, Trash2 } from "lucide-react";

interface GalleryCardProps {
  project: Project;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

export default function GalleryCard({ project, onClick, onDelete }: GalleryCardProps) {
  const yarns = (project.yarns as unknown as YarnInfo[]) || [];

  return (
    <div
      className="bg-white border border-warm-100 rounded-xl p-3.5 hover:shadow-sm transition-all cursor-pointer group relative"
      onClick={onClick}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-5 h-5 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 mt-0.5">
          <Check size={11} className="text-sage-main" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-warm-600 truncate group-hover:text-sage-main transition-colors">
            {project.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            {yarns.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-50 text-warm-400">
                {yarns[0].name}
              </span>
            )}
            {project.endDate && (
              <span className="text-[10px] text-warm-300">
                {formatDate(project.endDate)}
              </span>
            )}
          </div>
        </div>
      </div>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
          className="absolute bottom-2.5 right-2.5 p-1 text-warm-300 hover:text-red-500 rounded hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
