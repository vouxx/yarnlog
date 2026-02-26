"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Project } from "@prisma/client";
import { ProjectFormData, ProjectStatus, YarnInfo } from "@/types/project";
import { Scissors, Clock, CheckCircle, Layers, Package } from "lucide-react";
import FocusHeader from "./FocusHeader";
import FocusSection from "./FocusSection";
import ActiveProjectCard from "./ActiveProjectCard";
import CompactProjectCard from "./CompactProjectCard";
import GalleryCard from "./GalleryCard";
import DashboardSidebar from "./DashboardSidebar";
import MaterialStash from "./MaterialStash";
import ProjectDetail from "./ProjectDetail";
import ProjectModal from "./ProjectModal";

export default function FocusView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [modalProject, setModalProject] = useState<Project | null | undefined>(
    undefined
  );
  const [modalDefaultStatus, setModalDefaultStatus] =
    useState<ProjectStatus>("todo");
  const [modalDefaultFolder, setModalDefaultFolder] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"projects" | "stash">("projects");

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 폴더 목록
  const folders = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.folder) set.add(p.folder);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [projects]);

  // 필터링
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
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          ((p.yarns as unknown as YarnInfo[]) || []).some(
            (y) => y.name.toLowerCase().includes(q)
          )
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

  // 상태별 프로젝트
  const inProgressProjects = filteredProjects.filter(
    (p) => p.status === "in-progress"
  );
  const todoProjects = filteredProjects.filter((p) => p.status === "todo");
  const doneProjects = filteredProjects.filter((p) => p.status === "done");

  // 통계
  const avgProgress =
    inProgressProjects.length > 0
      ? Math.round(
          inProgressProjects.reduce((sum, p) => sum + p.progress, 0) /
            inProgressProjects.length
        )
      : 0;

  // 상태 변경
  const handleStatusChange = async (
    projectId: string,
    newStatus: string
  ) => {
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

  // 프로젝트 업데이트
  const handleProjectUpdate = (updated: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    if (detailProject?.id === updated.id) {
      setDetailProject(updated);
    }
  };

  // 모달 핸들러
  const openDetail = (project: Project) => {
    setDetailProject(project);
  };

  const openEditFromDetail = () => {
    if (!detailProject) return;
    setModalProject(detailProject);
    setDetailProject(null);
  };

  const deleteFromDetail = async () => {
    if (!detailProject) return;
    await fetch(`/api/projects/${detailProject.id}`, { method: "DELETE" });
    setDetailProject(null);
    fetchProjects();
  };

  const openCreateModal = (status: ProjectStatus = "todo") => {
    setModalProject(null);
    setModalDefaultStatus(status);
    setModalDefaultFolder(activeFolder === null ? "" : activeFolder);
  };

  const openEditModal = (project: Project) => {
    setModalProject(project);
  };

  const closeModal = () => {
    setModalProject(undefined);
  };

  const handleSave = async (data: ProjectFormData) => {
    if (modalProject) {
      await fetch(`/api/projects/${modalProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-warm-400 text-lg">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 메인 탭 */}
      <div className="flex items-center gap-1 border-b border-warm-200/50">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "projects"
              ? "border-warm-700 text-warm-800"
              : "border-transparent text-warm-400 hover:text-warm-600"
          }`}
        >
          <Scissors size={15} />
          프로젝트
        </button>
        <button
          onClick={() => setActiveTab("stash")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "stash"
              ? "border-warm-700 text-warm-800"
              : "border-transparent text-warm-400 hover:text-warm-600"
          }`}
        >
          <Package size={15} />
          재료함
        </button>
      </div>

      {activeTab === "stash" ? (
        <MaterialStash />
      ) : (
      <>
      {/* 상단 헤더 */}
      <FocusHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        folders={folders}
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        onAddProject={() => openCreateModal("todo")}
      />

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-warm-50/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <Scissors size={14} className="text-blue-500" />
            <span className="text-xs text-warm-400">진행중</span>
          </div>
          <span className="text-2xl font-bold text-warm-800">
            {inProgressProjects.length}
          </span>
        </div>
        <div className="bg-warm-50/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-500" />
            <span className="text-xs text-warm-400">예정</span>
          </div>
          <span className="text-2xl font-bold text-warm-800">
            {todoProjects.length}
          </span>
        </div>
        <div className="bg-warm-50/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-xs text-warm-400">완성</span>
          </div>
          <span className="text-2xl font-bold text-warm-800">
            {doneProjects.length}
          </span>
        </div>
        <div className="bg-warm-50/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={14} className="text-rose-main" />
            <span className="text-xs text-warm-400">평균 진행률</span>
          </div>
          <span className="text-2xl font-bold text-warm-800">
            {avgProgress}
            <span className="text-sm font-normal text-warm-400">%</span>
          </span>
        </div>
      </div>

      {/* 프로젝트가 없을 때 */}
      {projects.length === 0 && (
        <div className="text-center py-20 text-warm-400">
          <p className="text-lg mb-2">아직 프로젝트가 없어요</p>
          <button
            onClick={() => openCreateModal("todo")}
            className="text-sm text-rose-main hover:underline"
          >
            첫 프로젝트 만들기
          </button>
        </div>
      )}

      {/* 메인 2열 레이아웃 */}
      {projects.length > 0 && (
        <div className="flex gap-6">
          {/* 왼쪽: 진행중 + 예정 */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* 지금 뜨고 있는 것 */}
            <FocusSection
              title="지금 뜨고 있는 것"
              count={inProgressProjects.length}
              accentColor="bg-blue-100/80 text-blue-700"
            >
              {inProgressProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inProgressProjects.map((project) => (
                    <ActiveProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => openDetail(project)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-warm-400 bg-warm-50/50 rounded-lg">
                  <p className="text-sm mb-1">진행중인 프로젝트가 없어요</p>
                  <p className="text-xs">
                    아래 예정 목록에서 시작해보세요
                  </p>
                </div>
              )}
            </FocusSection>

            {/* 다음에 뜰 것 */}
            <FocusSection
              title="다음에 뜰 것"
              count={todoProjects.length}
              accentColor="bg-amber-100/80 text-amber-700"
            >
              {todoProjects.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {todoProjects.map((project) => (
                    <CompactProjectCard
                      key={project.id}
                      project={project}
                      onStatusChange={handleStatusChange}
                      onClick={() => openDetail(project)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-warm-400 bg-warm-50/50 rounded-lg">
                  <p className="text-sm">예정된 프로젝트가 없어요</p>
                </div>
              )}
            </FocusSection>
          </div>

          {/* 오른쪽: 도구 + 최근 완성 */}
          <div className="w-64 flex-shrink-0 hidden md:block">
            <DashboardSidebar
              doneProjects={doneProjects}
              onProjectClick={openDetail}
            />
          </div>
        </div>
      )}

      {/* 완성 갤러리 */}
      {doneProjects.length > 0 && (
        <FocusSection
          title="완성"
          count={doneProjects.length}
          accentColor="bg-green-100/80 text-green-700"
          defaultCollapsed={doneProjects.length > 8}
        >
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {doneProjects.map((project) => (
              <GalleryCard
                key={project.id}
                project={project}
                onClick={() => openDetail(project)}
              />
            ))}
          </div>
        </FocusSection>
      )}

      </>
      )}

      {/* 상세 보기 */}
      {detailProject && (
        <ProjectDetail
          project={detailProject}
          onClose={() => setDetailProject(null)}
          onEdit={openEditFromDetail}
          onDelete={deleteFromDetail}
          onUpdate={handleProjectUpdate}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* 편집 모달 */}
      {modalProject !== undefined && (
        <ProjectModal
          project={modalProject}
          defaultStatus={modalDefaultStatus}
          defaultFolder={modalDefaultFolder}
          folders={folders}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={modalProject ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
