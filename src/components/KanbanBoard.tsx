"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Project } from "@prisma/client";
import { COLUMNS, ProjectFormData, ProjectStatus } from "@/types/project";
import KanbanColumn from "./KanbanColumn";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";

export default function KanbanBoard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [modalProject, setModalProject] = useState<Project | null | undefined>(
    undefined
  );
  const [modalDefaultStatus, setModalDefaultStatus] =
    useState<ProjectStatus>("todo");
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getColumnProjects = (status: ProjectStatus) =>
    projects
      .filter((p) => p.status === status)
      .sort((a, b) => a.position - b.position);

  const handleDragStart = (event: DragStartEvent) => {
    const project = projects.find((p) => p.id === event.active.id);
    setActiveProject(project || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeProject = projects.find((p) => p.id === activeId);
    if (!activeProject) return;

    // over가 컬럼 ID인 경우 (빈 컬럼에 드롭)
    const isOverColumn = COLUMNS.some((c) => c.id === overId);
    const overProject = projects.find((p) => p.id === overId);

    const newStatus = isOverColumn
      ? (overId as ProjectStatus)
      : overProject?.status;

    if (newStatus && activeProject.status !== newStatus) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeId ? { ...p, status: newStatus } : p
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const movedProject = projects.find((p) => p.id === activeId);
    if (!movedProject) return;

    const isOverColumn = COLUMNS.some((c) => c.id === overId);
    const targetStatus = isOverColumn
      ? (overId as ProjectStatus)
      : projects.find((p) => p.id === overId)?.status || movedProject.status;

    const columnProjects = projects
      .filter((p) => p.status === targetStatus)
      .sort((a, b) => a.position - b.position);

    let newPosition: number;

    if (isOverColumn) {
      // 빈 컬럼이나 컬럼 자체에 드롭 → 맨 끝으로
      newPosition = columnProjects.filter((p) => p.id !== activeId).length;
    } else if (activeId !== overId) {
      const oldIndex = columnProjects.findIndex((p) => p.id === activeId);
      const newIndex = columnProjects.findIndex((p) => p.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(columnProjects, oldIndex, newIndex);
        // 전체 projects 업데이트
        setProjects((prev) => {
          const others = prev.filter((p) => p.status !== targetStatus);
          return [
            ...others,
            ...reordered.map((p, i) => ({ ...p, position: i })),
          ];
        });
        newPosition = newIndex;
      } else {
        newPosition = columnProjects.filter((p) => p.id !== activeId).length;
      }
    } else {
      // 같은 위치 → 상태만 변경될 수 있음
      newPosition = columnProjects.findIndex((p) => p.id === activeId);
      if (newPosition === -1)
        newPosition = columnProjects.length;
    }

    // API로 저장
    await fetch(`/api/projects/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: targetStatus,
        position: newPosition,
      }),
    });
  };

  const openCreateModal = (status: ProjectStatus) => {
    setModalProject(null);
    setModalDefaultStatus(status);
  };

  const openEditModal = (project: Project) => {
    setModalProject(project);
  };

  const closeModal = () => {
    setModalProject(undefined);
  };

  const handleSave = async (data: ProjectFormData) => {
    if (modalProject) {
      // 수정
      await fetch(`/api/projects/${modalProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      // 생성
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    closeModal();
    fetchProjects();
  };

  const handleDelete = async () => {
    if (!modalProject || !confirm("정말 삭제할까요?")) return;
    await fetch(`/api/projects/${modalProject.id}`, { method: "DELETE" });
    closeModal();
    fetchProjects();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-400 text-lg">불러오는 중...</p>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              projects={getColumnProjects(col.id)}
              onCardClick={openEditModal}
              onAddClick={() => openCreateModal(col.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeProject ? (
            <div className="rotate-3">
              <ProjectCard
                project={activeProject}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {modalProject !== undefined && (
        <ProjectModal
          project={modalProject}
          defaultStatus={modalDefaultStatus}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={modalProject ? handleDelete : undefined}
        />
      )}
    </>
  );
}
