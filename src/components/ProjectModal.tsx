"use client";

import { useState, useEffect, useRef } from "react";
import { Project } from "@prisma/client";
import {
  ProjectFormData,
  ProjectStatus,
  YarnInfo,
  NeedleInfo,
  SupplyInfo,
  Attachment,
} from "@/types/project";
import { Plus, X, Upload, Link, Youtube } from "lucide-react";

interface ProjectModalProps {
  project?: Project | null;
  defaultStatus?: ProjectStatus;
  defaultFolder?: string;
  folders: string[];
  onClose: () => void;
  onSave: (data: ProjectFormData) => void;
  onDelete?: () => void;
}

const difficultyOptions = [
  { value: 1, label: "입문" },
  { value: 2, label: "초급" },
  { value: 3, label: "중급" },
  { value: 4, label: "고급" },
  { value: 5, label: "마스터" },
];

export default function ProjectModal({
  project,
  defaultStatus = "todo",
  defaultFolder = "",
  folders,
  onClose,
  onSave,
  onDelete,
}: ProjectModalProps) {
  const [form, setForm] = useState<ProjectFormData>({
    title: "",
    memo: "",
    gauge: "",
    yarns: [],
    needles: [],
    supplies: [],
    attachments: [],
    progress: 0,
    difficulty: 1,
    tags: [],
    folder: defaultFolder,
    status: defaultStatus,
    startDate: "",
    endDate: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title,
        memo: project.memo || "",
        gauge: project.gauge || "",
        yarns: (project.yarns as unknown as YarnInfo[]) || [],
        needles: (project.needles as unknown as NeedleInfo[]) || [],
        supplies: (project.supplies as unknown as SupplyInfo[]) || [],
        attachments: (project.attachments as unknown as Attachment[]) || [],
        progress: project.progress,
        difficulty: project.difficulty,
        tags: project.tags,
        folder: project.folder || "",
        status: project.status as ProjectStatus,
        startDate: project.startDate
          ? new Date(project.startDate).toISOString().split("T")[0]
          : "",
        endDate: project.endDate
          ? new Date(project.endDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  };

  // --- 태그 ---
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags?.includes(tag)) {
      setForm({ ...form, tags: [...(form.tags || []), tag] });
      setTagInput("");
    }
  };
  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags?.filter((t) => t !== tag) });
  };

  // --- 실 ---
  const addYarn = () => {
    setForm({
      ...form,
      yarns: [...(form.yarns || []), { name: "", color: "", weight: "", quantity: "" }],
    });
  };
  const updateYarn = (index: number, field: keyof YarnInfo, value: string) => {
    const updated = [...(form.yarns || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, yarns: updated });
  };
  const removeYarn = (index: number) => {
    setForm({ ...form, yarns: form.yarns?.filter((_, i) => i !== index) });
  };

  // --- 바늘 ---
  const addNeedle = () => {
    setForm({
      ...form,
      needles: [...(form.needles || []), { type: "", size: "" }],
    });
  };
  const updateNeedle = (index: number, field: keyof NeedleInfo, value: string) => {
    const updated = [...(form.needles || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, needles: updated });
  };
  const removeNeedle = (index: number) => {
    setForm({ ...form, needles: form.needles?.filter((_, i) => i !== index) });
  };

  // --- 부자재 ---
  const addSupply = () => {
    setForm({
      ...form,
      supplies: [...(form.supplies || []), { name: "", quantity: "", note: "" }],
    });
  };
  const updateSupply = (index: number, field: keyof SupplyInfo, value: string) => {
    const updated = [...(form.supplies || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, supplies: updated });
  };
  const removeSupply = (index: number) => {
    setForm({ ...form, supplies: form.supplies?.filter((_, i) => i !== index) });
  };

  // --- 첨부 ---
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
        const attachment: Attachment = {
          id: crypto.randomUUID(),
          type: data.type,
          url: data.url,
          name: data.name,
        };
        setForm((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), attachment],
        }));
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

    const attachment: Attachment = {
      id: crypto.randomUUID(),
      type,
      url,
      name,
    };
    setForm((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), attachment],
    }));
    setLinkInput("");
  };

  const removeAttachment = (id: string) => {
    setForm({
      ...form,
      attachments: form.attachments?.filter((a) => a.id !== id),
    });
  };

  const isEdit = !!project;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-warm-800">
              {isEdit ? "프로젝트 수정" : "새 프로젝트"}
            </h2>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                프로젝트 이름 *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
                placeholder="예: 케이블 니트 스웨터"
                autoFocus
              />
            </div>

            {/* 폴더 */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                폴더
              </label>
              <div className="flex gap-2">
                <select
                  value={form.folder}
                  onChange={(e) =>
                    setForm({ ...form, folder: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
                >
                  <option value="">미분류</option>
                  {[...new Set([...folders, ...(form.folder ? [form.folder] : [])])]
                    .sort((a, b) => a.localeCompare(b, "ko"))
                    .map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                </select>
                <input
                  type="text"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const name = newFolder.trim();
                      if (name) {
                        setForm({ ...form, folder: name });
                        setNewFolder("");
                      }
                    }
                  }}
                  className="w-28 px-2 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                  placeholder="새 폴더"
                />
                <button
                  type="button"
                  onClick={() => {
                    const name = newFolder.trim();
                    if (name) {
                      setForm({ ...form, folder: name });
                      setNewFolder("");
                    }
                  }}
                  className="px-2 py-2 bg-warm-100 text-warm-600 rounded-lg hover:bg-warm-200 transition-colors text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                메모
              </label>
              <textarea
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 resize-none"
                rows={3}
                placeholder="자유롭게 메모..."
              />
            </div>

            {/* 실 */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                사용하는 실
              </label>
              <div className="space-y-2">
                {form.yarns?.map((yarn, i) => (
                  <div key={i} className="flex gap-1.5 items-start">
                    <input
                      type="text"
                      value={yarn.name}
                      onChange={(e) => updateYarn(i, "name", e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                      placeholder="실 이름"
                    />
                    <input
                      type="text"
                      value={yarn.color || ""}
                      onChange={(e) => updateYarn(i, "color", e.target.value)}
                      className="w-20 px-2 py-1.5 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                      placeholder="색상"
                    />
                    <input
                      type="text"
                      value={yarn.weight || ""}
                      onChange={(e) => updateYarn(i, "weight", e.target.value)}
                      className="w-20 px-2 py-1.5 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                      placeholder="굵기"
                    />
                    <button
                      type="button"
                      onClick={() => removeYarn(i)}
                      className="p-1.5 text-warm-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addYarn}
                  className="flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700 transition-colors"
                >
                  <Plus size={14} />
                  실 추가
                </button>
              </div>
            </div>

            {/* 바늘 */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                사용하는 바늘
              </label>
              <div className="space-y-2">
                {form.needles?.map((needle, i) => (
                  <div key={i} className="flex gap-1.5 items-start">
                    <input
                      type="text"
                      value={needle.type}
                      onChange={(e) => updateNeedle(i, "type", e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                      placeholder="종류 (대바늘, 코바늘...)"
                    />
                    <input
                      type="text"
                      value={needle.size}
                      onChange={(e) => updateNeedle(i, "size", e.target.value)}
                      className="w-24 px-2 py-1.5 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                      placeholder="호수"
                    />
                    <button
                      type="button"
                      onClick={() => removeNeedle(i)}
                      className="p-1.5 text-warm-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addNeedle}
                  className="flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700 transition-colors"
                >
                  <Plus size={14} />
                  바늘 추가
                </button>
              </div>
            </div>

            {/* 부자재 */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                부자재
              </label>
              <div className="space-y-2">
                {form.supplies?.map((supply, i) => (
                  <div key={i} className="flex gap-1.5 items-start">
                    <input
                      type="text"
                      value={supply.name}
                      onChange={(e) => updateSupply(i, "name", e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                      placeholder="부자재 이름"
                    />
                    <input
                      type="text"
                      value={supply.quantity || ""}
                      onChange={(e) => updateSupply(i, "quantity", e.target.value)}
                      className="w-20 px-2 py-1.5 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                      placeholder="수량"
                    />
                    <button
                      type="button"
                      onClick={() => removeSupply(i)}
                      className="p-1.5 text-warm-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSupply}
                  className="flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700 transition-colors"
                >
                  <Plus size={14} />
                  부자재 추가
                </button>
              </div>
            </div>

            {/* 게이지 & 난이도 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-warm-600 mb-1">
                  게이지
                </label>
                <input
                  type="text"
                  value={form.gauge}
                  onChange={(e) => setForm({ ...form, gauge: e.target.value })}
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                  placeholder="예: 20코 x 28단"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-600 mb-1">
                  난이도
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({ ...form, difficulty: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                >
                  {difficultyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 첨부 (파일 + 링크) */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                첨부 (도안, 참고자료)
              </label>
              <div className="space-y-2">
                {/* 파일 업로드 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-100 text-warm-600 rounded-lg hover:bg-warm-200 transition-colors text-sm disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {uploading ? "업로드 중..." : "파일 첨부"}
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

                {/* URL/유튜브 입력 */}
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Link
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-400"
                    />
                    <input
                      type="text"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLink();
                        }
                      }}
                      className="w-full pl-8 pr-3 py-1.5 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                      placeholder="URL 또는 유튜브 링크"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addLink}
                    className="px-3 py-1.5 bg-warm-100 text-warm-600 rounded-lg hover:bg-warm-200 transition-colors text-sm"
                  >
                    추가
                  </button>
                </div>

                {/* 첨부 목록 */}
                {form.attachments && form.attachments.length > 0 && (
                  <div className="space-y-1">
                    {form.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 px-2 py-1.5 bg-warm-50 rounded-lg"
                      >
                        <span className="text-xs px-1.5 py-0.5 rounded bg-warm-200 text-warm-600 uppercase">
                          {att.type === "youtube" ? "YT" : att.type}
                        </span>
                        <span className="text-sm text-warm-700 truncate flex-1">
                          {att.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="text-warm-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 진행률 */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                진행률: {form.progress}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.progress}
                onChange={(e) =>
                  setForm({ ...form, progress: Number(e.target.value) })
                }
                className="w-full accent-rose-main"
              />
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-warm-600 mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-600 mb-1">
                  완료일
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                />
              </div>
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                태그
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                  placeholder="태그 입력 후 Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-warm-100 text-warm-600 rounded-lg hover:bg-warm-200 transition-colors"
                >
                  추가
                </button>
              </div>
              {form.tags && form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded-full bg-warm-100 text-warm-600"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-warm-800"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-between p-4 border-t border-warm-100">
            <div>
              {isEdit && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-sm text-red-400 hover:text-red-600 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-warm-500 hover:bg-warm-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-warm-700 text-white rounded-lg hover:bg-warm-800 transition-colors"
              >
                {isEdit ? "수정" : "만들기"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
