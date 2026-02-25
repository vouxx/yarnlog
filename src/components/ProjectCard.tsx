"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Project } from "@prisma/client";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const difficultyLabel = ["", "입문", "초급", "중급", "고급", "마스터"];

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`rounded-xl border border-warm-200 bg-white p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <h3 className="font-semibold text-warm-800 mb-1 truncate">
        {project.title}
      </h3>

      {project.memo && (
        <p className="text-sm text-warm-500 mb-2 line-clamp-2">
          {project.memo}
        </p>
      )}

      {/* 진행률 바 */}
      {project.progress > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-warm-400 mb-1">
            <span>진행률</span>
            <span>{project.progress}%</span>
          </div>
          <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-main rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        {project.yarnType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-light text-rose-main">
            {project.yarnType}
          </span>
        )}
        {project.needleSize && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-light text-sky-main">
            {project.needleSize}
          </span>
        )}
        {project.difficulty > 1 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-sage-light text-sage-main">
            {difficultyLabel[project.difficulty]}
          </span>
        )}
      </div>

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-warm-100 text-warm-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
