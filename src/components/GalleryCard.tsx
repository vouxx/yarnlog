"use client";

import { Project } from "@prisma/client";
import { YarnInfo } from "@/types/project";
import { Check } from "lucide-react";

interface GalleryCardProps {
  project: Project;
  onClick: () => void;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function GalleryCard({ project, onClick }: GalleryCardProps) {
  const yarns = (project.yarns as unknown as YarnInfo[]) || [];

  return (
    <div
      className="bg-white border border-warm-100 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 mt-0.5">
          <Check size={11} className="text-sage-main" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-warm-700 truncate group-hover:text-sage-main transition-colors">
            {project.title}
          </h3>
          {yarns.length > 0 && (
            <p className="text-xs text-warm-300 truncate mt-1">
              {yarns[0].name}
            </p>
          )}
          {project.endDate && (
            <p className="text-[10px] text-warm-300 mt-1.5">
              {formatDate(project.endDate)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
