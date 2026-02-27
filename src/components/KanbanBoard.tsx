"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import ProjectDetail from "./ProjectDetail";
import Sidebar from "./Sidebar";

export default function KanbanBoard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  // undefined = closed, null = create mode, Project = view/edit
  const [detailProject, setDetailProject] = useState<Project | null | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

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

  // 폴더 목록
  const folders = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.folder) set.add(p.folder);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [projects]);

  // 필터링 (폴더 + 검색)
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (activeFolder !== null) {
      filtered = filtered.filter((p) =>
        activeFolder === "" ? !p.folder : p.folder === activeFolder
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.memo?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title, "ko");
        case "progress":
          return b.progress - a.progress;
        case "difficulty":
          return b.difficulty - a.difficulty;
        case "recent":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  }, [projects, activeFolder, searchQuery, sortBy]);

  const getColumnProjects = (status: ProjectStatus) =>
    filteredProjects
      .filter((p) => p.status === status)
      .sort((a, b) => a.position - b.position);

  // --- DnD ---
  const handleDragStart = (event: DragStartEvent) => {
    const project = projects.find((p) => p.id === event.active.id);
    setActiveProject(project || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const draggedProject = projects.find((p) => p.id === activeId);
    if (!draggedProject) return;

    // over가 컬럼 ID인지 (예정/진행중/완료)
    const isOverColumn = COLUMNS.some((c) => c.id === overId);
    const overProject = projects.find((p) => p.id === overId);

    const newStatus = isOverColumn
      ? (overId as ProjectStatus)
      : overProject?.status;

    if (newStatus && draggedProject.status !== newStatus) {
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
      : (projects.find((p) => p.id === overId)?.status as ProjectStatus) ||
        (movedProject.status as ProjectStatus);

    const columnProjects = projects
      .filter((p) => p.status === targetStatus)
      .sort((a, b) => a.position - b.position);

    let newPosition: number;

    if (isOverColumn) {
      newPosition = columnProjects.filter((p) => p.id !== activeId).length;
    } else if (activeId !== overId) {
      const oldIndex = columnProjects.findIndex((p) => p.id === activeId);
      const newIndex = columnProjects.findIndex((p) => p.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(columnProjects, oldIndex, newIndex);
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
      newPosition = columnProjects.findIndex((p) => p.id === activeId);
      if (newPosition === -1) newPosition = columnProjects.length;
    }

    await fetch(`/api/projects/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: targetStatus,
        position: newPosition,
      }),
    });
  };

  // --- 핸들러 ---
  const openDetail = (project: Project) => {
    setDetailProject(project);
  };

  const openCreateDetail = () => {
    setDetailProject(null);
  };

  const handleProjectUpdate = (updated: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    if (detailProject && detailProject.id === updated.id) {
      setDetailProject(updated);
    }
  };

  const handleCreate = async (data: ProjectFormData): Promise<Project | null> => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const created = await res.json();
    fetchProjects();
    return created;
  };

  const handleDeleteProject = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setDetailProject(undefined);
    fetchProjects();
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: newStatus } : p
      )
    );
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchProjects();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-warm-400 text-lg">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 p-6">
      {/* 메인 보드 */}
      <div className="flex-1 min-w-0">
        {/* 폴더 필터 탭 */}
        {folders.length > 0 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <button
              onClick={() => setActiveFolder(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFolder === null
                  ? "bg-warm-700 text-white shadow-sm"
                  : "bg-warm-50/90 text-warm-500 hover:bg-warm-200/60"
              }`}
            >
              전체
            </button>
            {folders.map((f) => (
              <button
                key={f}
                onClick={() =>
                  setActiveFolder(activeFolder === f ? null : f)
                }
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFolder === f
                    ? "bg-warm-700 text-white shadow-sm"
                    : "bg-warm-50/90 text-warm-500 hover:bg-warm-200/60"
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() =>
                setActiveFolder(activeFolder === "" ? null : "")
              }
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFolder === ""
                  ? "bg-warm-700 text-white shadow-sm"
                  : "bg-warm-50/90 text-warm-400 hover:bg-warm-200/60"
              }`}
            >
              미분류
            </button>
          </div>
        )}

        {/* 3열 칸반 */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                droppableId={col.id}
                status={col.id}
                title={col.title}
                projects={getColumnProjects(col.id)}
                onCardClick={openDetail}
                onAddClick={() => openCreateDetail()}
              />
            ))}
          </div>

          {/* 프로젝트가 아예 없을 때 */}
          {projects.length === 0 && (
            <div className="text-center py-24">
              <p className="font-semibold text-xl text-warm-300 mb-3">아직 프로젝트가 없어요</p>
              <button
                onClick={() => openCreateDetail()}
                className="text-sm text-accent hover:text-accent/80 underline underline-offset-4 transition-colors"
              >
                첫 프로젝트 만들기
              </button>
            </div>
          )}

          <DragOverlay>
            {activeProject ? (
              <div className="rotate-3">
                <ProjectCard project={activeProject} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 사이드바 */}
      <Sidebar
        onAddProject={openCreateDetail}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* 상세 보기 / 생성 */}
      {detailProject !== undefined && (
        <ProjectDetail
          project={detailProject}
          folders={folders}
          onClose={() => setDetailProject(undefined)}
          onDelete={handleDeleteProject}
          onUpdate={handleProjectUpdate}
          onCreate={handleCreate}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
