"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Project } from "@prisma/client";
import { YarnInfo, NeedleInfo } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const difficultyLabel = ["", "입문", "초급", "중급", "고급", "마스터"];

const statusBorder: Record<string, string> = {
  todo: "border-l-accent",
  "in-progress": "border-l-sky-main",
  done: "border-l-sage-main",
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

  const border = statusBorder[project.status] || statusBorder.todo;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-xl border border-warm-100 border-l-4 ${border} p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all ${
        isDragging ? "opacity-60 shadow-lg scale-[1.02]" : ""
      }`}
    >
      <h3 className="text-sm font-semibold text-warm-800 mb-1 truncate leading-tight">
        {project.title}
      </h3>

      {project.memo && (
        <p className="text-xs text-warm-400 mb-2 line-clamp-2 leading-relaxed">
          {project.memo}
        </p>
      )}

      {project.progress > 0 && (
        <div className="mb-2.5">
          <div className="flex justify-between text-[10px] text-warm-400 mb-1">
            <span>진행률</span>
            <span className="tabular-nums">{project.progress}%</span>
          </div>
          <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
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
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-light text-rose-main">
                  {yarns[0].name}
                </span>
              )}
              {needles.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-light text-sky-main">
                  {needles[0].size}
                </span>
              )}
            </>
          );
        })()}
        {project.difficulty > 1 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-light text-accent">
            {difficultyLabel[project.difficulty]}
          </span>
        )}
      </div>

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-warm-50 text-warm-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
