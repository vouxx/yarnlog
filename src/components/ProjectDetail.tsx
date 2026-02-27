"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@prisma/client";
import {
  ProjectStatus,
  ProjectFormData,
  StitchCounter,
  YarnInfo,
  NeedleInfo,
  SupplyInfo,
  Attachment,
} from "@/types/project";
import {
  Minus,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  X,
  Upload,
  Link,
  Pencil,
  Maximize2,
} from "lucide-react";
import Dropdown from "./Dropdown";

interface ProjectDetailProps {
  project: Project | null;
  folders: string[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (project: Project) => void;
  onCreate: (data: ProjectFormData) => Promise<Project | null>;
  onStatusChange?: (projectId: string, newStatus: string) => void;
}

const difficultyLabel = ["", "입문", "초급", "중급", "고급", "마스터"];
const difficultyOptions = [
  { value: "1", label: "입문" },
  { value: "2", label: "초급" },
  { value: "3", label: "중급" },
  { value: "4", label: "고급" },
  { value: "5", label: "마스터" },
];

const statusLabel: Record<ProjectStatus, string> = {
  todo: "예정",
  "in-progress": "진행중",
  done: "완료",
};

const statusColor: Record<ProjectStatus, string> = {
  todo: "bg-accent-light text-accent",
  "in-progress": "bg-sky-light text-sky-main",
  done: "bg-sage-light text-sage-main",
};

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
  );
  return match ? match[1] : null;
}

type EditingField =
  | null
  | "title"
  | "memo"
  | "folder"
  | "yarns"
  | "needles"
  | "supplies"
  | "gauge"
  | "progress"
  | "difficulty"
  | "tags"
  | "startDate"
  | "endDate"
  | "attachments";

export default function ProjectDetail({
  project,
  folders,
  onClose,
  onDelete,
  onUpdate,
  onCreate,
  onStatusChange,
}: ProjectDetailProps) {
  const router = useRouter();
  const isCreate = !project;
  const [localProject, setLocalProject] = useState<Project | null>(project);
  const [editing, setEditing] = useState<EditingField>(isCreate ? "title" : null);

  // Editable field states
  const [title, setTitle] = useState(project?.title || "");
  const [memo, setMemo] = useState(project?.memo || "");
  const [folder, setFolder] = useState(project?.folder || "");
  const [newFolder, setNewFolder] = useState("");
  const [gauge, setGauge] = useState(project?.gauge || "");
  const [progress, setProgress] = useState(project?.progress || 0);
  const [difficulty, setDifficulty] = useState(project?.difficulty || 1);
  const [startDate, setStartDate] = useState(toDateInput(project?.startDate));
  const [endDate, setEndDate] = useState(toDateInput(project?.endDate));
  const [yarns, setYarns] = useState<YarnInfo[]>(
    (project?.yarns as unknown as YarnInfo[]) || []
  );
  const [needles, setNeedles] = useState<NeedleInfo[]>(
    (project?.needles as unknown as NeedleInfo[]) || []
  );
  const [supplies, setSupplies] = useState<SupplyInfo[]>(
    (project?.supplies as unknown as SupplyInfo[]) || []
  );
  const [attachments, setAttachments] = useState<Attachment[]>(
    (project?.attachments as unknown as Attachment[]) || []
  );
  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [counters, setCounters] = useState<StitchCounter[]>(
    (project?.counters as unknown as StitchCounter[]) || []
  );
  const [newCounterName, setNewCounterName] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const status = (localProject?.status || "todo") as ProjectStatus;

  // Save a field to the server
  const saveField = useCallback(
    async (data: Partial<ProjectFormData>) => {
      if (!localProject) return;
      const res = await fetch(`/api/projects/${localProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setLocalProject(updated);
      onUpdate(updated);
    },
    [localProject, onUpdate]
  );

  // Create project on first title save
  const handleCreateProject = useCallback(async () => {
    if (!title.trim()) return;
    const data: ProjectFormData = {
      title: title.trim(),
      status: "todo",
      folder,
      counters,
      memo,
      yarns,
      needles,
      supplies,
      gauge,
      tags,
      difficulty,
      progress,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      attachments,
    };
    const created = await onCreate(data);
    if (created) {
      setLocalProject(created);
    }
  }, [title, folder, counters, memo, yarns, needles, supplies, gauge, tags, difficulty, progress, startDate, endDate, attachments, onCreate]);

  // Field save handlers
  const saveTitle = () => {
    if (isCreate && !localProject) {
      handleCreateProject();
    } else if (localProject && title !== localProject.title) {
      saveField({ title });
    }
    setEditing(null);
  };

  const saveMemo = () => {
    if (localProject && memo !== (localProject.memo || "")) {
      saveField({ memo });
    }
    setEditing(null);
  };

  const saveFolder = (val: string) => {
    setFolder(val);
    if (localProject) {
      saveField({ folder: val });
    }
    setEditing(null);
  };

  const saveGauge = () => {
    if (localProject && gauge !== (localProject.gauge || "")) {
      saveField({ gauge });
    }
    setEditing(null);
  };

  const saveProgress = (val: number) => {
    setProgress(val);
    if (localProject) {
      saveField({ progress: val });
    }
  };

  const saveDifficulty = (val: string) => {
    const num = Number(val);
    setDifficulty(num);
    if (localProject) {
      saveField({ difficulty: num });
    }
    setEditing(null);
  };

  const saveStartDate = (val: string) => {
    setStartDate(val);
    if (localProject) {
      saveField({ startDate: val || undefined });
    }
  };

  const saveEndDate = (val: string) => {
    setEndDate(val);
    if (localProject) {
      saveField({ endDate: val || undefined });
    }
  };

  const saveYarns = () => {
    if (localProject) {
      saveField({ yarns });
    }
    setEditing(null);
  };

  const saveNeedles = () => {
    if (localProject) {
      saveField({ needles });
    }
    setEditing(null);
  };

  const saveSupplies = () => {
    if (localProject) {
      saveField({ supplies });
    }
    setEditing(null);
  };

  const saveTags = () => {
    if (localProject) {
      saveField({ tags });
    }
    setEditing(null);
  };

  // Counter operations
  const saveCounters = async (updated: StitchCounter[]) => {
    setCounters(updated);
    if (!localProject) return;
    const res = await fetch(`/api/projects/${localProject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counters: updated }),
    });
    const data = await res.json();
    setLocalProject(data);
    onUpdate(data);
  };

  const addCounter = () => {
    const name = newCounterName.trim() || `카운터 ${counters.length + 1}`;
    saveCounters([...counters, { id: crypto.randomUUID(), name, value: 0 }]);
    setNewCounterName("");
  };

  const updateCount = (id: string, delta: number) => {
    saveCounters(
      counters.map((c) =>
        c.id === id ? { ...c, value: Math.max(0, c.value + delta) } : c
      )
    );
  };

  const removeCounter = (id: string) => {
    saveCounters(counters.filter((c) => c.id !== id));
  };

  // Tag helpers
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      const updated = [...tags, tag];
      setTags(updated);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
  };

  // Attachment helpers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "업로드 실패");
          continue;
        }
        const data = await res.json();
        const att: Attachment = {
          id: crypto.randomUUID(),
          type: data.type,
          url: data.url,
          name: data.name,
        };
        setAttachments((prev) => {
          const updated = [...prev, att];
          if (localProject) {
            saveField({ attachments: updated });
          }
          return updated;
        });
      } catch {
        alert("업로드 중 오류가 발생했습니다");
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addLink = () => {
    const url = linkInput.trim();
    if (!url) return;
    let type: Attachment["type"] = "url";
    let name = url;
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
    );
    if (ytMatch) {
      type = "youtube";
      name = `YouTube: ${ytMatch[1]}`;
    }
    const att: Attachment = { id: crypto.randomUUID(), type, url, name };
    const updated = [...attachments, att];
    setAttachments(updated);
    if (localProject) {
      saveField({ attachments: updated });
    }
    setLinkInput("");
  };

  const removeAttachment = (id: string) => {
    const updated = attachments.filter((a) => a.id !== id);
    setAttachments(updated);
    if (localProject) {
      saveField({ attachments: updated });
    }
  };

  // Sync when project prop changes
  useEffect(() => {
    if (project) {
      setLocalProject(project);
    }
  }, [project]);

  const imageAttachments = attachments.filter((a) => a.type === "image");
  const youtubeAttachments = attachments.filter((a) => a.type === "youtube");
  const pdfAttachments = attachments.filter((a) => a.type === "pdf");
  const urlAttachments = attachments.filter((a) => a.type === "url");
  const hasViewableContent = imageAttachments.length > 0 || youtubeAttachments.length > 0 || pdfAttachments.length > 0;

  const inputClass =
    "w-full px-3 py-2 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all";
  const smallInputClass =
    "px-3 py-2 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all";
  const sectionLabel = "text-[11px] font-medium text-warm-400 uppercase tracking-wider";
  const editableHover = "cursor-pointer hover:bg-warm-50 rounded-lg transition-colors -mx-2 px-2 py-1 group";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className={`bg-white rounded-2xl shadow-xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col ${pdfAttachments.length > 0 ? "max-w-6xl" : "max-w-4xl"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            {localProject ? (
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor[status]}`}>
                {statusLabel[status]}
              </span>
            ) : (
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-accent-light text-accent">
                새 프로젝트
              </span>
            )}
            <button
              onClick={onClose}
              className="text-warm-300 hover:text-warm-600 p-1 rounded-lg hover:bg-warm-50 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            {/* 폴더 */}
            {editing === "folder" ? (
              <div className="flex gap-2 mb-2">
                <Dropdown
                  value={folder}
                  onChange={(v) => saveFolder(v)}
                  options={[
                    { value: "", label: "미분류" },
                    ...[...new Set([...folders, ...(folder ? [folder] : [])])]
                      .sort((a, b) => a.localeCompare(b, "ko"))
                      .map((f) => ({ value: f, label: f })),
                  ]}
                  className="w-40"
                />
                <input
                  type="text"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const name = newFolder.trim();
                      if (name) {
                        saveFolder(name);
                        setNewFolder("");
                      }
                    }
                  }}
                  className={`w-24 ${smallInputClass}`}
                  placeholder="새 폴더"
                />
              </div>
            ) : (
              <span
                onClick={() => setEditing("folder")}
                className="text-[11px] text-warm-400 font-medium tracking-wide uppercase mb-1 block cursor-pointer hover:text-warm-600 transition-colors"
              >
                {folder || "폴더 선택"}
              </span>
            )}

            {/* 제목 */}
            {editing === "title" ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                }}
                autoFocus
                placeholder="프로젝트 이름"
                className="w-full text-2xl font-semibold text-warm-800 bg-transparent border-b-2 border-accent/40 focus:outline-none focus:border-accent pb-1 mb-5"
              />
            ) : (
              <h2
                onClick={() => setEditing("title")}
                className="font-semibold text-2xl text-warm-800 mb-5 leading-tight cursor-pointer hover:text-accent transition-colors"
              >
                {title || <span className="text-warm-300">프로젝트 이름을 입력하세요</span>}
              </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* 왼쪽 (3/5) */}
              <div className="md:col-span-3 space-y-5">
                {/* 메모 */}
                <div>
                  <h3 className={sectionLabel}>메모</h3>
                  {editing === "memo" ? (
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      onBlur={saveMemo}
                      autoFocus
                      rows={4}
                      placeholder="자유롭게 메모..."
                      className={`${inputClass} resize-none mt-2`}
                    />
                  ) : (
                    <div onClick={() => setEditing("memo")} className={editableHover}>
                      {memo ? (
                        <p className="text-warm-600 whitespace-pre-wrap leading-relaxed text-sm">{memo}</p>
                      ) : (
                        <p className="text-warm-300 text-sm">메모를 입력하세요</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 재료 정보 */}
                <div className="bg-warm-50 rounded-xl p-4 space-y-3">
                  <h3 className={sectionLabel}>재료 정보</h3>

                  {/* 실 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-warm-400">실</span>
                      {editing !== "yarns" && (
                        <button onClick={() => setEditing("yarns")} className="text-warm-300 hover:text-accent transition-colors">
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                    {editing === "yarns" ? (
                      <div className="space-y-2">
                        {yarns.map((yarn, i) => (
                          <div key={i} className="flex gap-1.5 items-start">
                            <input type="text" value={yarn.name} onChange={(e) => { const u = [...yarns]; u[i] = { ...u[i], name: e.target.value }; setYarns(u); }} className={`flex-1 ${smallInputClass}`} placeholder="실 이름" />
                            <input type="text" value={yarn.color || ""} onChange={(e) => { const u = [...yarns]; u[i] = { ...u[i], color: e.target.value }; setYarns(u); }} className={`w-16 ${smallInputClass}`} placeholder="색상" />
                            <input type="text" value={yarn.weight || ""} onChange={(e) => { const u = [...yarns]; u[i] = { ...u[i], weight: e.target.value }; setYarns(u); }} className={`w-16 ${smallInputClass}`} placeholder="굵기" />
                            <button onClick={() => setYarns(yarns.filter((_, j) => j !== i))} className="p-2 text-warm-300 hover:text-red-500"><X size={14} /></button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button onClick={() => setYarns([...yarns, { name: "", color: "", weight: "", quantity: "" }])} className="flex items-center gap-1 text-sm text-warm-400 hover:text-accent transition-colors"><Plus size={14} />추가</button>
                          <button onClick={saveYarns} className="ml-auto text-sm text-accent hover:text-accent/80 transition-colors font-medium">완료</button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => setEditing("yarns")} className="cursor-pointer">
                        {yarns.length > 0 ? yarns.map((y, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-warm-700 py-0.5">
                            <span className="font-medium">{y.name}</span>
                            {y.color && <span className="text-warm-400">{y.color}</span>}
                            {y.weight && <span className="text-warm-400">{y.weight}</span>}
                            {y.quantity && <span className="text-warm-400">x{y.quantity}</span>}
                          </div>
                        )) : <p className="text-warm-300 text-sm">실 정보 추가</p>}
                      </div>
                    )}
                  </div>

                  {/* 바늘 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-warm-400">바늘</span>
                      {editing !== "needles" && (
                        <button onClick={() => setEditing("needles")} className="text-warm-300 hover:text-accent transition-colors">
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                    {editing === "needles" ? (
                      <div className="space-y-2">
                        {needles.map((needle, i) => (
                          <div key={i} className="flex gap-1.5 items-start">
                            <input type="text" value={needle.type} onChange={(e) => { const u = [...needles]; u[i] = { ...u[i], type: e.target.value }; setNeedles(u); }} className={`flex-1 ${smallInputClass}`} placeholder="종류" />
                            <input type="text" value={needle.size} onChange={(e) => { const u = [...needles]; u[i] = { ...u[i], size: e.target.value }; setNeedles(u); }} className={`w-24 ${smallInputClass}`} placeholder="호수" />
                            <button onClick={() => setNeedles(needles.filter((_, j) => j !== i))} className="p-2 text-warm-300 hover:text-red-500"><X size={14} /></button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button onClick={() => setNeedles([...needles, { type: "", size: "" }])} className="flex items-center gap-1 text-sm text-warm-400 hover:text-accent transition-colors"><Plus size={14} />추가</button>
                          <button onClick={saveNeedles} className="ml-auto text-sm text-accent hover:text-accent/80 transition-colors font-medium">완료</button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => setEditing("needles")} className="cursor-pointer">
                        {needles.length > 0 ? needles.map((n, i) => (
                          <div key={i} className="text-sm text-warm-700 py-0.5">
                            <span className="font-medium">{n.type}</span> <span className="text-warm-400">{n.size}</span>
                          </div>
                        )) : <p className="text-warm-300 text-sm">바늘 정보 추가</p>}
                      </div>
                    )}
                  </div>

                  {/* 게이지 */}
                  <div>
                    <span className="text-xs text-warm-400 block mb-1">게이지</span>
                    {editing === "gauge" ? (
                      <input
                        type="text"
                        value={gauge}
                        onChange={(e) => setGauge(e.target.value)}
                        onBlur={saveGauge}
                        onKeyDown={(e) => { if (e.key === "Enter") saveGauge(); }}
                        autoFocus
                        className={smallInputClass}
                        placeholder="예: 20코 x 28단"
                      />
                    ) : (
                      <div onClick={() => setEditing("gauge")} className="cursor-pointer">
                        <span className="text-sm text-warm-700 font-medium">
                          {gauge || <span className="text-warm-300 font-normal">게이지 입력</span>}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 부자재 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-warm-400">부자재</span>
                      {editing !== "supplies" && (
                        <button onClick={() => setEditing("supplies")} className="text-warm-300 hover:text-accent transition-colors">
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                    {editing === "supplies" ? (
                      <div className="space-y-2">
                        {supplies.map((supply, i) => (
                          <div key={i} className="flex gap-1.5 items-start">
                            <input type="text" value={supply.name} onChange={(e) => { const u = [...supplies]; u[i] = { ...u[i], name: e.target.value }; setSupplies(u); }} className={`flex-1 ${smallInputClass}`} placeholder="이름" />
                            <input type="text" value={supply.quantity || ""} onChange={(e) => { const u = [...supplies]; u[i] = { ...u[i], quantity: e.target.value }; setSupplies(u); }} className={`w-16 ${smallInputClass}`} placeholder="수량" />
                            <button onClick={() => setSupplies(supplies.filter((_, j) => j !== i))} className="p-2 text-warm-300 hover:text-red-500"><X size={14} /></button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button onClick={() => setSupplies([...supplies, { name: "", quantity: "", note: "" }])} className="flex items-center gap-1 text-sm text-warm-400 hover:text-accent transition-colors"><Plus size={14} />추가</button>
                          <button onClick={saveSupplies} className="ml-auto text-sm text-accent hover:text-accent/80 transition-colors font-medium">완료</button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => setEditing("supplies")} className="cursor-pointer">
                        {supplies.length > 0 ? supplies.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-warm-700 py-0.5">
                            <span className="font-medium">{s.name}</span>
                            {s.quantity && <span className="text-warm-400">x{s.quantity}</span>}
                            {s.note && <span className="text-warm-400 text-xs">({s.note})</span>}
                          </div>
                        )) : <p className="text-warm-300 text-sm">부자재 추가</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* 첨부파일 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={sectionLabel}>첨부파일</h3>
                    <div className="flex gap-2 items-center">
                      {hasViewableContent && localProject && (
                        <button
                          onClick={() => router.push(`/project/${localProject.id}`)}
                          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                        >
                          <Maximize2 size={11} />
                          작업 모드
                        </button>
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-1 text-xs text-warm-400 hover:text-accent transition-colors disabled:opacity-50"
                      >
                        <Upload size={12} />
                        {uploading ? "업로드 중..." : "파일"}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* 링크 입력 */}
                  <div className="flex gap-1.5 mb-3">
                    <div className="relative flex-1">
                      <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-300" />
                      <input
                        type="text"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
                        className="w-full pl-9 pr-3 py-2 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                        placeholder="URL 또는 유튜브 링크"
                      />
                    </div>
                    <button onClick={addLink} className="px-3 py-2 bg-warm-50 text-warm-600 rounded-xl hover:bg-warm-100 transition-all text-sm border border-warm-100">추가</button>
                  </div>

                  <div className="space-y-3">
                    {imageAttachments.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {imageAttachments.map((att) => (
                          <div key={att.id} className="relative group">
                            <button
                              onClick={() => setPreviewImage(att.url)}
                              className="aspect-square rounded-xl overflow-hidden bg-warm-50 hover:opacity-80 transition-opacity w-full"
                            >
                              <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                            </button>
                            <button
                              onClick={() => removeAttachment(att.id)}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {youtubeAttachments.map((att) => {
                      const ytId = getYoutubeId(att.url);
                      return (
                        <div key={att.id} className="relative group">
                          {ytId ? (
                            <div className="aspect-video rounded-xl overflow-hidden">
                              <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full" allowFullScreen />
                            </div>
                          ) : (
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-sky-main hover:underline">
                              <ExternalLink size={14} />{att.name}
                            </a>
                          )}
                          <button onClick={() => removeAttachment(att.id)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                        </div>
                      );
                    })}

                    {pdfAttachments.map((att) => (
                      <div key={att.id} className="rounded-xl overflow-hidden border border-warm-200 group">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-warm-50 text-sm text-warm-700">
                          <FileText size={15} className="text-rose-main flex-shrink-0" />
                          <span className="flex-1 truncate">{att.name}</span>
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-warm-400 hover:text-accent transition-colors" title="새 탭에서 열기">
                            <ExternalLink size={13} />
                          </a>
                          <button onClick={() => removeAttachment(att.id)} className="text-warm-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                        </div>
                        <iframe
                          src={att.url}
                          className="w-full bg-white"
                          style={{ height: "500px" }}
                          title={att.name}
                        />
                      </div>
                    ))}

                    {urlAttachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-2 px-4 py-3 bg-warm-50 rounded-xl text-sm text-sky-main group">
                        <ExternalLink size={14} className="flex-shrink-0" />
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex-1 break-all hover:underline">{att.name}</a>
                        <button onClick={() => removeAttachment(att.id)} className="text-warm-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                      </div>
                    ))}

                    {attachments.length === 0 && (
                      <p className="text-warm-300 text-sm">첨부파일이 없습니다</p>
                    )}
                  </div>
                </div>

                {/* 단수 카운터 */}
                <div>
                  <h3 className={`${sectionLabel} mb-3`}>단수 카운터</h3>
                  <div className="space-y-2">
                    {counters.map((counter) => (
                      <div key={counter.id} className="flex items-center gap-2.5 bg-warm-50 rounded-xl px-4 py-2.5">
                        <span className="text-sm text-warm-600 flex-1 truncate">{counter.name}</span>
                        <button onClick={() => updateCount(counter.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-warm-500 hover:bg-warm-200 transition-all border border-warm-100"><Minus size={13} /></button>
                        <span className="text-lg font-semibold text-warm-800 min-w-[40px] text-center tabular-nums">{counter.value}</span>
                        <button onClick={() => updateCount(counter.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent text-white hover:bg-accent/85 transition-all"><Plus size={13} /></button>
                        <button onClick={() => removeCounter(counter.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-warm-300 hover:text-red-400 hover:bg-red-50 transition-all"><Trash2 size={12} /></button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCounterName}
                        onChange={(e) => setNewCounterName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCounter(); } }}
                        placeholder="카운터 이름"
                        className="flex-1 px-3 py-2 bg-warm-50 border border-warm-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                      />
                      <button onClick={addCounter} className="px-4 py-2 bg-warm-100 text-warm-600 rounded-xl hover:bg-warm-200 transition-all text-sm font-medium">추가</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽 (2/5) */}
              <div className="md:col-span-2 space-y-4">
                {/* 진행률 */}
                <div className="bg-warm-50 rounded-xl p-4">
                  <h3 className={`${sectionLabel} mb-2`}>진행률</h3>
                  <div className="flex items-end gap-1.5 mb-3">
                    <span className="text-4xl font-bold text-warm-800 leading-none">{progress}</span>
                    <span className="text-warm-300 text-lg mb-0.5">%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progress}
                    onChange={(e) => saveProgress(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>

                {/* 난이도 */}
                <div className="bg-warm-50 rounded-xl p-4">
                  <h3 className={`${sectionLabel} mb-1`}>난이도</h3>
                  {editing === "difficulty" ? (
                    <Dropdown
                      value={String(difficulty)}
                      onChange={saveDifficulty}
                      options={difficultyOptions}
                    />
                  ) : (
                    <span
                      onClick={() => setEditing("difficulty")}
                      className="text-lg text-warm-700 font-medium cursor-pointer hover:text-accent transition-colors"
                    >
                      {difficultyLabel[difficulty]}
                    </span>
                  )}
                </div>

                {/* 일정 */}
                <div className="bg-warm-50 rounded-xl p-4 space-y-2">
                  <h3 className={`${sectionLabel} mb-2`}>일정</h3>
                  <div>
                    <span className="text-xs text-warm-400 block mb-1">시작일</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => saveStartDate(e.target.value)}
                      className={`${smallInputClass} w-full bg-white`}
                    />
                  </div>
                  <div>
                    <span className="text-xs text-warm-400 block mb-1">완료일</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => saveEndDate(e.target.value)}
                      className={`${smallInputClass} w-full bg-white`}
                    />
                  </div>
                </div>

                {/* 태그 */}
                <div>
                  <h3 className={`${sectionLabel} mb-2`}>태그</h3>
                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addTag(); }
                      }}
                      onBlur={() => { if (tags.length > 0) saveTags(); }}
                      className={`flex-1 ${smallInputClass}`}
                      placeholder="태그 입력"
                    />
                    <button onClick={() => { addTag(); }} className="px-3 py-2 bg-warm-100 text-warm-600 rounded-xl hover:bg-warm-200 transition-all text-sm">+</button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-warm-100 text-warm-500">
                          #{tag}
                          <button onClick={() => { removeTag(tag); const updated = tags.filter(t => t !== tag); if (localProject) saveField({ tags: updated }); }} className="hover:text-warm-800 ml-0.5"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 하단: 상태 변경 */}
          {localProject && onStatusChange && (
            <div className="px-6 py-3 border-t border-warm-100">
              <div className="flex gap-2">
                {status !== "in-progress" && (
                  <button onClick={() => { onStatusChange(localProject.id, "in-progress"); onClose(); }} className="flex-1 py-2 text-sm font-medium text-sky-main bg-sky-light hover:bg-sky-main hover:text-white rounded-xl transition-all">진행중으로</button>
                )}
                {status !== "todo" && (
                  <button onClick={() => { onStatusChange(localProject.id, "todo"); onClose(); }} className="flex-1 py-2 text-sm font-medium text-accent bg-accent-light hover:bg-accent hover:text-white rounded-xl transition-all">예정으로</button>
                )}
                {status !== "done" && (
                  <button onClick={() => { onStatusChange(localProject.id, "done"); onClose(); }} className="flex-1 py-2 text-sm font-medium text-sage-main bg-sage-light hover:bg-sage-main hover:text-white rounded-xl transition-all">완료</button>
                )}
              </div>
            </div>
          )}

          {/* 하단: 삭제/닫기 */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-warm-100 flex-shrink-0">
            {localProject ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-warm-300 hover:text-red-500 transition-colors"
              >
                삭제
              </button>
            ) : <div />}
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-warm-500 hover:bg-warm-50 rounded-xl transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
          onClick={() => setPreviewImage(null)}
        >
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={24} /></button>
          <img src={previewImage} alt="미리보기" className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl" />
        </div>
      )}

      {showDeleteConfirm && localProject && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-warm-800 text-lg mb-2">
              프로젝트 삭제
            </h3>
            <p className="text-sm text-warm-500 mb-5 leading-relaxed">
              <span className="font-medium text-warm-700">&ldquo;{localProject.title}&rdquo;</span>을(를) 삭제할까요?
              <br />
              <span className="text-warm-400">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(localProject.id);
                }}
                className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                삭제
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-2.5 text-sm text-warm-400 hover:text-warm-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
