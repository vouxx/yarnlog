"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Project } from "@prisma/client";
import ProjectCard from "./ProjectCard";
import { ProjectStatus } from "@/types/project";

interface KanbanColumnProps {
  id: ProjectStatus;
  title: string;
  projects: Project[];
  onCardClick: (project: Project) => void;
  onAddClick: () => void;
}

const columnColors: Record<ProjectStatus, string> = {
  todo: "border-t-rose-main",
  "in-progress": "border-t-sky-main",
  done: "border-t-sage-main",
};

export default function KanbanColumn({
  id,
  title,
  projects,
  onCardClick,
  onAddClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={`flex flex-col rounded-2xl bg-warm-50 border-t-4 ${columnColors[id]} min-h-[300px] ${
        isOver ? "ring-2 ring-warm-300" : ""
      }`}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-warm-700 text-lg">{title}</h2>
          <span className="text-sm text-warm-400 bg-warm-100 px-2 py-0.5 rounded-full">
            {projects.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="w-7 h-7 flex items-center justify-center rounded-full text-warm-400 hover:bg-warm-200 hover:text-warm-600 transition-colors text-xl leading-none"
        >
          +
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 px-3 pb-3 space-y-3">
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onCardClick(project)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
