"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Project } from "@prisma/client";
import { ProjectFormData, YarnInfo } from "@/types/project";
import { Scissors, Package, FolderOpen, Trash2 } from "lucide-react";
import Image from "next/image";
import FocusHeader from "./FocusHeader";
import FocusSection from "./FocusSection";
import ActiveProjectCard from "./ActiveProjectCard";
import CompactProjectCard from "./CompactProjectCard";
import GalleryCard from "./GalleryCard";
import { CompactTimer, CompactTimerIcon, CompactGaugeIcon, CompactGaugeForm, SidebarSection } from "./DashboardSidebar";
import CardCarousel from "./CardCarousel";
import MaterialStash from "./MaterialStash";
import ProjectDetail from "./ProjectDetail";

export default function FocusView() {
  const [projects, setProjects] = useState<Project[]>([]);
  // undefined = closed, null = create mode, Project = view/edit
  const [detailProject, setDetailProject] = useState<Project | null | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"projects" | "stash">("projects");
  const [extraFolders, setExtraFolders] = useState<string[]>([]);
  const [folderDeleteConfirm, setFolderDeleteConfirm] = useState<{
    folder: string;
    count: number;
  } | null>(null);
  const [renamingFolder, setRenamingFolder] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingFolder) {
      renameInputRef.current?.focus();
    }
  }, [renamingFolder]);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const folders = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.folder) set.add(p.folder);
    });
    extraFolders.forEach((f) => set.add(f));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [projects, extraFolders]);

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

  const inProgressProjects = filteredProjects.filter(
    (p) => p.status === "in-progress"
  );
  const todoProjects = filteredProjects.filter((p) => p.status === "todo");
  const doneProjects = filteredProjects.filter((p) => p.status === "done");

  const avgProgress =
    inProgressProjects.length > 0
      ? Math.round(
          inProgressProjects.reduce((sum, p) => sum + p.progress, 0) /
            inProgressProjects.length
        )
      : 0;

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

  const handleDelete = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setDetailProject(undefined);
    fetchProjects();
  };

  const openDetail = (project: Project) => {
    setDetailProject(project);
  };

  const openCreateDetail = () => {
    setDetailProject(null);
  };

  const handleAddFolder = (name: string) => {
    if (!folders.includes(name)) {
      setExtraFolders((prev) => [...prev, name]);
    }
    setActiveFolder(name);
  };

  const handleRenameFolder = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    await fetch("/api/projects/batch-folder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldFolder: oldName, newFolder: trimmed }),
    });
    setExtraFolders((prev) => prev.filter((f) => f !== oldName).concat(trimmed));
    if (activeFolder === oldName) setActiveFolder(trimmed);
    fetchProjects();
  };

  const handleDeleteFolder = (folder: string) => {
    const count = projects.filter((p) => p.folder === folder).length;
    if (count > 0) {
      setFolderDeleteConfirm({ folder, count });
    } else {
      // 빈 폴더 → 바로 삭제
      setExtraFolders((prev) => prev.filter((f) => f !== folder));
      setActiveFolder(null);
    }
  };

  const executeFolderDelete = async (deleteContents: boolean) => {
    if (!folderDeleteConfirm) return;
    const { folder } = folderDeleteConfirm;

    if (deleteContents) {
      await fetch("/api/projects/batch-folder", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
    } else {
      await fetch("/api/projects/batch-folder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldFolder: folder, newFolder: null }),
      });
    }

    setExtraFolders((prev) => prev.filter((f) => f !== folder));
    setActiveFolder(null);
    setFolderDeleteConfirm(null);
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
    <div className="min-h-screen flex flex-col">
    {/* 헤더 */}
    <header className="bg-warm-700 border-b border-warm-800 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-end justify-between">
        <div>
          <Image src="/logo.svg" alt="YarnLog" width={28} height={28} />
        </div>
        {/* 메인 탭 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all ${
              activeTab === "projects"
                ? "bg-white/20 text-white shadow-sm"
                : "text-warm-300 hover:text-warm-100 hover:bg-white/10"
            }`}
          >
            <Scissors size={14} />
            프로젝트
          </button>
          <button
            onClick={() => setActiveTab("stash")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all ${
              activeTab === "stash"
                ? "bg-white/20 text-white shadow-sm"
                : "text-warm-300 hover:text-warm-100 hover:bg-white/10"
            }`}
          >
            <Package size={14} />
            재료함
          </button>
        </div>
      </div>
    </header>

    <div className="flex-1 max-w-6xl mx-auto px-4 py-8 space-y-6 w-full">

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
        onAddProject={openCreateDetail}
        onAddFolder={handleAddFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      {/* 프로젝트가 없을 때 */}
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

      {/* 2열 레이아웃 */}
      {projects.length > 0 && (
        <div className="flex gap-6 items-start">
          {/* 왼쪽: 프로젝트 목록 컨테이너 */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-warm-100 p-6 space-y-6">
            {/* 현재 폴더 표시 — 항상 표시 */}
            <div className="flex items-center gap-2">
              <FolderOpen size={15} className="text-warm-400 flex-shrink-0" />
              {renamingFolder && activeFolder ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleRenameFolder(activeFolder, renameValue);
                        setRenamingFolder(false);
                      }
                      if (e.key === "Escape") setRenamingFolder(false);
                    }}
                    className="px-2.5 py-1 rounded-lg text-sm font-medium border border-accent/40 bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 w-36"
                  />
                  <button
                    onClick={() => {
                      handleRenameFolder(activeFolder, renameValue);
                      setRenamingFolder(false);
                    }}
                    className="px-2.5 py-1 bg-warm-800 text-white rounded-lg text-xs hover:bg-warm-700 transition-colors"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setRenamingFolder(false)}
                    className="px-2 py-1 text-warm-400 hover:text-warm-600 rounded-lg text-xs hover:bg-warm-100 transition-colors"
                  >
                    취소
                  </button>
                </div>
              ) : activeFolder !== null && activeFolder !== "" ? (
                <>
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full bg-warm-50 text-sm font-medium text-warm-700 cursor-pointer hover:text-accent transition-colors"
                    onClick={() => {
                      setRenameValue(activeFolder);
                      setRenamingFolder(true);
                      setTimeout(() => renameInputRef.current?.focus(), 0);
                    }}
                  >
                    {activeFolder}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleDeleteFolder(activeFolder)}
                    className="p-1.5 text-warm-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : activeFolder === "" ? (
                <span className="text-sm font-medium text-warm-500">미분류</span>
              ) : (
                <span className="text-sm font-medium text-warm-500">전체</span>
              )}
            </div>

            <FocusSection
              title="뜨는 중"
              count={inProgressProjects.length}
              accentColor="text-sky-main"
            >
              {inProgressProjects.length > 0 ? (
                <CardCarousel>
                  {inProgressProjects.map((project) => (
                    <div key={project.id} className="w-72 md:w-80 flex-shrink-0 snap-start">
                      <ActiveProjectCard
                        project={project}
                        onClick={() => openDetail(project)}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </CardCarousel>
              ) : (
                <div className="h-[130px] flex items-center justify-center text-warm-300 bg-warm-50/50 rounded-2xl border border-dashed border-warm-150">
                  <div className="text-center">
                    <p className="text-sm mb-1">진행중인 프로젝트가 없어요</p>
                    <p className="text-xs text-warm-300">
                      아래 예정 목록에서 시작해보세요
                    </p>
                  </div>
                </div>
              )}
            </FocusSection>

            <hr className="border-warm-100" />

            <FocusSection
              title="예정"
              count={todoProjects.length}
              accentColor="text-accent"
            >
              {todoProjects.length > 0 ? (
                <CardCarousel>
                  {todoProjects.map((project) => (
                    <div key={project.id} className="w-44 flex-shrink-0 snap-start">
                      <CompactProjectCard
                        project={project}
                        onStatusChange={handleStatusChange}
                        onClick={() => openDetail(project)}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </CardCarousel>
              ) : (
                <div className="h-[80px] flex items-center justify-center text-warm-300 bg-warm-50/50 rounded-xl border border-dashed border-warm-150">
                  <p className="text-sm">예정된 프로젝트가 없어요</p>
                </div>
              )}
            </FocusSection>

            <hr className="border-warm-100" />

            <FocusSection
              title="완성"
              count={doneProjects.length}
              accentColor="text-sage-main"
              defaultCollapsed={doneProjects.length > 8}
            >
              {doneProjects.length > 0 ? (
                <CardCarousel>
                  {doneProjects.map((project) => (
                    <div key={project.id} className="w-44 flex-shrink-0 snap-start">
                      <GalleryCard
                        project={project}
                        onClick={() => openDetail(project)}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </CardCarousel>
              ) : (
                <div className="h-[72px] flex items-center justify-center text-warm-300 bg-warm-50/50 rounded-xl border border-dashed border-warm-150">
                  <p className="text-sm">완성된 프로젝트가 없어요</p>
                </div>
              )}
            </FocusSection>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="w-72 flex-shrink-0 hidden md:block">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-warm-100 p-5 space-y-5">
                {/* 진행상황 */}
                <div>
                  <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-4">진행상황</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-warm-800 block">{inProgressProjects.length}</span>
                      <span className="text-xs text-warm-400">뜨는 중</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-warm-800 block">{todoProjects.length}</span>
                      <span className="text-xs text-warm-400">예정</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-warm-800 block">{doneProjects.length}</span>
                      <span className="text-xs text-warm-400">완성</span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-warm-800 block">{avgProgress}%</span>
                      <span className="text-xs text-warm-400">평균 진행률</span>
                    </div>
                  </div>
                </div>

                <hr className="border-warm-100" />

                {/* 타이머 */}
                <SidebarSection title="타이머" icon={<CompactTimerIcon />} defaultOpen>
                  <CompactTimer />
                </SidebarSection>

                <hr className="border-warm-100" />

                {/* 게이지 계산기 */}
                <SidebarSection title="게이지 계산기" icon={<CompactGaugeIcon />}>
                  <CompactGaugeForm />
                </SidebarSection>
              </div>
            </div>
          </div>
        </div>
      )}

      </>
      )}

      {detailProject !== undefined && (
        <ProjectDetail
          project={detailProject}
          folders={folders}
          onClose={() => setDetailProject(undefined)}
          onDelete={handleDelete}
          onUpdate={handleProjectUpdate}
          onCreate={handleCreate}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* 폴더 삭제 확인 */}
      {folderDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setFolderDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-warm-800 text-lg mb-2">
              폴더 삭제
            </h3>
            <p className="text-sm text-warm-500 mb-5 leading-relaxed">
              <span className="font-medium text-warm-700">&ldquo;{folderDeleteConfirm.folder}&rdquo;</span> 폴더에
              프로젝트 <span className="font-medium text-warm-700">{folderDeleteConfirm.count}개</span>가 있습니다.
              <br />
              내용도 같이 삭제할까요?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => executeFolderDelete(true)}
                className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                폴더 + 프로젝트 모두 삭제
              </button>
              <button
                onClick={() => executeFolderDelete(false)}
                className="w-full py-2.5 text-sm font-medium text-warm-700 bg-warm-50 hover:bg-warm-100 rounded-xl transition-colors"
              >
                폴더만 삭제 (프로젝트는 미분류로 이동)
              </button>
              <button
                onClick={() => setFolderDeleteConfirm(null)}
                className="w-full py-2.5 text-sm text-warm-400 hover:text-warm-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* 푸터 */}
    <footer className="bg-warm-700 border-t border-warm-800 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-2 text-center">
        <p className="text-xs text-warm-300">&copy; {new Date().getFullYear()} zei. All rights reserved.</p>
      </div>
    </footer>
    </div>
  );
}
