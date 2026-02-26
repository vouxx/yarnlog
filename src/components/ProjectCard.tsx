"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Project } from "@prisma/client";
import { YarnInfo, NeedleInfo } from "@/types/project";
import { useMemo } from "react";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const difficultyLabel = ["", "입문", "초급", "중급", "고급", "마스터"];

const postitColors: Record<string, { bg: string; border: string }> = {
  todo: { bg: "bg-postit-yellow", border: "border-amber-200" },
  "in-progress": { bg: "bg-postit-blue", border: "border-blue-200" },
  done: { bg: "bg-postit-green", border: "border-green-200" },
};

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  // 카드마다 미세 회전 (-2deg ~ 2deg)
  const rotation = useMemo(() => {
    const hash = project.id.charCodeAt(0) + project.id.charCodeAt(1);
    return ((hash % 5) - 2) * 0.8;
  }, [project.id]);

  const colors = postitColors[project.status] || postitColors.todo;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    "--rotation": `${rotation}deg`,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`tape rounded-sm ${colors.bg} border ${colors.border} p-4 pt-5 shadow-md cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-0.5 transition-all ${
        isDragging ? "opacity-60 shadow-xl scale-105" : ""
      }`}
    >
      <h3 className="text-xl text-warm-800 mb-1 truncate leading-tight">
        {project.title}
      </h3>

      {project.memo && (
        <p className="text-sm text-warm-500 mb-2 line-clamp-2 text-base leading-tight">
          {project.memo}
        </p>
      )}

      {/* 진행률 바 */}
      {project.progress > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-warm-400 mb-1">
            <span>진행률</span>
            <span className="text-sm">{project.progress}%</span>
          </div>
          <div className="h-2 bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-main rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        {(() => {
          const yarns = (project.yarns as unknown as YarnInfo[]) || [];
          const needles = (project.needles as unknown as NeedleInfo[]) || [];
          return (
            <>
              {yarns.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-rose-main font-medium">
                  {yarns[0].name}
                </span>
              )}
              {needles.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-sky-main font-medium">
                  {needles[0].size}
                </span>
              )}
            </>
          );
        })()}
        {project.difficulty > 1 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-sage-main font-medium">
            {difficultyLabel[project.difficulty]}
          </span>
        )}
      </div>

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-white/40 text-warm-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
