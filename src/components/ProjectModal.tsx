"use client";

import { useState, useEffect } from "react";
import { Project } from "@prisma/client";
import { ProjectFormData, ProjectStatus } from "@/types/project";

interface ProjectModalProps {
  project?: Project | null;
  defaultStatus?: ProjectStatus;
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
  onClose,
  onSave,
  onDelete,
}: ProjectModalProps) {
  const [form, setForm] = useState<ProjectFormData>({
    title: "",
    memo: "",
    yarnType: "",
    needleSize: "",
    gauge: "",
    patternUrl: "",
    imageUrl: "",
    progress: 0,
    difficulty: 1,
    tags: [],
    status: defaultStatus,
    startDate: "",
    endDate: "",
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title,
        memo: project.memo || "",
        yarnType: project.yarnType || "",
        needleSize: project.needleSize || "",
        gauge: project.gauge || "",
        patternUrl: project.patternUrl || "",
        imageUrl: project.imageUrl || "",
        progress: project.progress,
        difficulty: project.difficulty,
        tags: project.tags,
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

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                메모
              </label>
              <textarea
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main resize-none"
                rows={3}
                placeholder="자유롭게 메모..."
              />
            </div>

            {/* 실 종류 & 바늘 호수 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-warm-600 mb-1">
                  실 종류
                </label>
                <input
                  type="text"
                  value={form.yarnType}
                  onChange={(e) =>
                    setForm({ ...form, yarnType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
                  placeholder="예: 메리노 울"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-600 mb-1">
                  바늘 호수
                </label>
                <input
                  type="text"
                  value={form.needleSize}
                  onChange={(e) =>
                    setForm({ ...form, needleSize: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
                  placeholder="예: 5mm"
                />
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
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
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
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
                >
                  {difficultyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 패턴 링크 */}
            <div>
              <label className="block text-sm font-medium text-warm-600 mb-1">
                패턴 링크
              </label>
              <input
                type="url"
                value={form.patternUrl}
                onChange={(e) =>
                  setForm({ ...form, patternUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
                placeholder="https://..."
              />
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
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
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
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
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
                  className="flex-1 px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
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
