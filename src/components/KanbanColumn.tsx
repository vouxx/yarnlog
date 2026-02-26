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
  todo: "bg-amber-100/80 text-amber-700",
  "in-progress": "bg-blue-100/80 text-blue-700",
  done: "bg-green-100/80 text-green-700",
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
      className={`flex flex-col rounded-lg ${
        compact
          ? "bg-warm-100/60 min-h-[160px]"
          : "bg-warm-50/90 backdrop-blur-sm shadow-md min-h-[300px]"
      } relative overflow-hidden transition-shadow ${
        isOver ? "ring-2 ring-warm-300 bg-warm-100/80" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
        <div className="flex items-center gap-1.5">
          <h2
            className={`masking-tape font-bold text-sm px-1.5 py-0.5 rounded-sm ${columnAccent[status]}`}
          >
            {title}
          </h2>
          <span className="text-xs text-warm-400">{projects.length}</span>
        </div>
        <button
          onClick={onAddClick}
          className="w-6 h-6 flex items-center justify-center rounded-full text-warm-400 hover:bg-warm-200/60 hover:text-warm-600 transition-colors text-lg leading-none"
        >
          +
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 px-2 pb-2 space-y-3">
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
