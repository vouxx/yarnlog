"use client";

import { Project } from "@prisma/client";
import { YarnInfo } from "@/types/project";
import { CheckCircle } from "lucide-react";

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
      className="tape bg-postit-green border border-green-200 rounded-sm p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-warm-800 truncate">
            {project.title}
          </h3>
          {yarns.length > 0 && (
            <p className="text-xs text-warm-400 truncate mt-0.5">
              {yarns[0].name}
            </p>
          )}
          {project.endDate && (
            <p className="text-[10px] text-warm-400 mt-1">
              {formatDate(project.endDate)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
