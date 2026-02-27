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
  droppableId: string;
  status: ProjectStatus;
  title: string;
  projects: Project[];
  compact?: boolean;
  onCardClick: (project: Project) => void;
  onAddClick: () => void;
}

const columnAccent: Record<ProjectStatus, string> = {
  todo: "text-accent",
  "in-progress": "text-sky-main",
  done: "text-sage-main",
};

export default function KanbanColumn({
  droppableId,
  status,
  title,
  projects,
  compact = false,
  onCardClick,
  onAddClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <div
      className={`flex flex-col rounded-2xl ${
        compact
          ? "bg-warm-50 min-h-[160px]"
          : "bg-warm-50 border border-warm-100 min-h-[300px]"
      } relative overflow-hidden transition-all ${
        isOver ? "ring-2 ring-accent/30 bg-warm-100" : ""
      }`}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <h2 className={`font-semibold text-base ${columnAccent[status]}`}>
            {title}
          </h2>
          <span className="text-xs text-warm-300 bg-warm-100 px-2 py-0.5 rounded-full">
            {projects.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-warm-300 hover:bg-warm-200 hover:text-warm-600 transition-all text-lg leading-none"
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

        {projects.length === 0 && (
          <div className="flex items-center justify-center h-16 text-warm-300 text-xs">
            비어있음
          </div>
        )}
      </div>
    </div>
  );
}
