"use client";

import { useState } from "react";
import { Project } from "@prisma/client";
import {
  ProjectStatus,
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
  Image as ImageIcon,
  X,
} from "lucide-react";

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (project: Project) => void;
  onStatusChange?: (projectId: string, newStatus: string) => void;
}

const difficultyLabel = ["", "입문", "초급", "중급", "고급", "마스터"];
const difficultyStars = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];

const statusLabel: Record<ProjectStatus, string> = {
  todo: "예정",
  "in-progress": "진행중",
  done: "완료",
};

const statusColor: Record<ProjectStatus, string> = {
  todo: "bg-amber-100 text-amber-700",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
  );
  return match ? match[1] : null;
}

export default function ProjectDetail({
  project,
  onClose,
  onEdit,
  onDelete,
  onUpdate,
  onStatusChange,
}: ProjectDetailProps) {
  const status = project.status as ProjectStatus;
  const yarns = (project.yarns as unknown as YarnInfo[]) || [];
  const needles = (project.needles as unknown as NeedleInfo[]) || [];
  const supplies = (project.supplies as unknown as SupplyInfo[]) || [];
  const attachments = (project.attachments as unknown as Attachment[]) || [];

  const [counters, setCounters] = useState<StitchCounter[]>(
    (project.counters as unknown as StitchCounter[]) || []
  );
  const [newCounterName, setNewCounterName] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const saveCounters = async (updated: StitchCounter[]) => {
    setCounters(updated);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counters: updated }),
    });
    const data = await res.json();
    onUpdate(data);
  };

  const addCounter = () => {
    const name = newCounterName.trim() || `카운터 ${counters.length + 1}`;
    const updated = [
      ...counters,
      { id: crypto.randomUUID(), name, value: 0 },
    ];
    setNewCounterName("");
    saveCounters(updated);
  };

  const updateCount = (id: string, delta: number) => {
    const updated = counters.map((c) =>
      c.id === id ? { ...c, value: Math.max(0, c.value + delta) } : c
    );
    saveCounters(updated);
  };

  const removeCounter = (id: string) => {
    saveCounters(counters.filter((c) => c.id !== id));
  };

  const imageAttachments = attachments.filter((a) => a.type === "image");
  const youtubeAttachments = attachments.filter((a) => a.type === "youtube");
  const pdfAttachments = attachments.filter((a) => a.type === "pdf");
  const urlAttachments = attachments.filter((a) => a.type === "url");

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-warm-50 rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${statusColor[status]}`}
            >
              {statusLabel[status]}
            </span>
            <button
              onClick={onClose}
              className="text-warm-400 hover:text-warm-600 text-xl transition-colors"
            >
              &times;
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-6 pb-6">
            {/* 폴더 + 제목 */}
            {project.folder && (
              <span className="text-xs text-warm-400 mb-1 block">
                {project.folder}
              </span>
            )}
            <h2 className="text-3xl text-warm-800 mb-4 leading-tight">
              {project.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* 왼쪽 (3/5) */}
              <div className="md:col-span-3 space-y-4">
                {project.memo && (
                  <div>
                    <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-1">
                      메모
                    </h3>
                    <p className="text-warm-700 whitespace-pre-wrap leading-relaxed">
                      {project.memo}
                    </p>
                  </div>
                )}

                {/* 재료 정보 */}
                {(yarns.length > 0 || needles.length > 0 || supplies.length > 0 || project.gauge) && (
                  <div className="bg-white/50 rounded-lg p-4 space-y-3">
                    <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider">
                      재료 정보
                    </h3>
                    {yarns.length > 0 && (
                      <div>
                        <span className="text-xs text-warm-500 block mb-1">
                          실
                        </span>
                        {yarns.map((y, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm text-warm-700 py-0.5"
                          >
                            <span className="font-medium">{y.name}</span>
                            {y.color && (
                              <span className="text-warm-400">
                                {y.color}
                              </span>
                            )}
                            {y.weight && (
                              <span className="text-warm-400">
                                {y.weight}
                              </span>
                            )}
                            {y.quantity && (
                              <span className="text-warm-400">
                                x{y.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {needles.length > 0 && (
                      <div>
                        <span className="text-xs text-warm-500 block mb-1">
                          바늘
                        </span>
                        {needles.map((n, i) => (
                          <div
                            key={i}
                            className="text-sm text-warm-700 py-0.5"
                          >
                            <span className="font-medium">{n.type}</span>{" "}
                            <span className="text-warm-400">{n.size}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {project.gauge && (
                      <div>
                        <span className="text-xs text-warm-500 block mb-1">
                          게이지
                        </span>
                        <span className="text-sm text-warm-700 font-medium">
                          {project.gauge}
                        </span>
                      </div>
                    )}
                    {supplies.length > 0 && (
                      <div>
                        <span className="text-xs text-warm-500 block mb-1">
                          부자재
                        </span>
                        {supplies.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm text-warm-700 py-0.5"
                          >
                            <span className="font-medium">{s.name}</span>
                            {s.quantity && (
                              <span className="text-warm-400">
                                x{s.quantity}
                              </span>
                            )}
                            {s.note && (
                              <span className="text-warm-400 text-xs">
                                ({s.note})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 첨부파일 */}
                {attachments.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">
                      첨부파일
                    </h3>
                    <div className="space-y-3">
                      {/* 이미지 미리보기 */}
                      {imageAttachments.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {imageAttachments.map((att) => (
                            <button
                              key={att.id}
                              onClick={() => setPreviewImage(att.url)}
                              className="aspect-square rounded-lg overflow-hidden bg-warm-100 hover:opacity-80 transition-opacity"
                            >
                              <img
                                src={att.url}
                                alt={att.name}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 유튜브 */}
                      {youtubeAttachments.map((att) => {
                        const ytId = getYoutubeId(att.url);
                        return ytId ? (
                          <div
                            key={att.id}
                            className="aspect-video rounded-lg overflow-hidden"
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}`}
                              className="w-full h-full"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          </div>
                        ) : (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-sky-main hover:underline"
                          >
                            <ExternalLink size={14} />
                            {att.name}
                          </a>
                        );
                      })}

                      {/* PDF */}
                      {pdfAttachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg text-sm text-warm-700 hover:bg-white/80 transition-colors"
                        >
                          <FileText size={16} className="text-red-400" />
                          {att.name}
                          <ExternalLink
                            size={12}
                            className="text-warm-400 ml-auto"
                          />
                        </a>
                      ))}

                      {/* URL */}
                      {urlAttachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg text-sm text-sky-main hover:bg-white/80 transition-colors break-all"
                        >
                          <ExternalLink size={14} className="flex-shrink-0" />
                          {att.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 단수 카운터 */}
                <div>
                  <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">
                    단수 카운터
                  </h3>
                  <div className="space-y-2">
                    {counters.map((counter) => (
                      <div
                        key={counter.id}
                        className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm text-warm-600 flex-1 truncate">
                          {counter.name}
                        </span>
                        <button
                          onClick={() => updateCount(counter.id, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-warm-200 text-warm-600 hover:bg-warm-300 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-lg font-semibold text-warm-800 min-w-[40px] text-center tabular-nums">
                          {counter.value}
                        </span>
                        <button
                          onClick={() => updateCount(counter.id, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-rose-main text-white hover:bg-rose-main/80 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeCounter(counter.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full text-warm-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCounterName}
                        onChange={(e) => setNewCounterName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCounter();
                          }
                        }}
                        placeholder="카운터 이름"
                        className="flex-1 px-3 py-1.5 bg-white/70 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                      />
                      <button
                        onClick={addCounter}
                        className="px-3 py-1.5 bg-warm-200 text-warm-600 rounded-lg hover:bg-warm-300 transition-colors text-sm"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽 (2/5) */}
              <div className="md:col-span-2 space-y-4">
                {/* 진행률 */}
                <div className="bg-white/50 rounded-lg p-4">
                  <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-2">
                    진행률
                  </h3>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl text-warm-800 leading-none">
                      {project.progress}
                    </span>
                    <span className="text-warm-400 text-lg mb-0.5">%</span>
                  </div>
                  <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-main rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* 난이도 */}
                <div className="bg-white/50 rounded-lg p-4">
                  <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-1">
                    난이도
                  </h3>
                  <span className="text-xl text-warm-700">
                    {difficultyLabel[project.difficulty]}
                  </span>
                  <span className="text-rose-main ml-2 text-sm">
                    {difficultyStars[project.difficulty]}
                  </span>
                </div>

                {/* 날짜 */}
                {(project.startDate || project.endDate) && (
                  <div className="bg-white/50 rounded-lg p-4 space-y-1">
                    <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-2">
                      일정
                    </h3>
                    {project.startDate && (
                      <div className="text-sm text-warm-600">
                        시작: {formatDate(project.startDate)}
                      </div>
                    )}
                    {project.endDate && (
                      <div className="text-sm text-warm-600">
                        완료: {formatDate(project.endDate)}
                      </div>
                    )}
                  </div>
                )}

                {/* 태그 */}
                {project.tags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-2">
                      태그
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-sm px-2 py-0.5 rounded-full bg-warm-100 text-warm-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="px-6 py-4 border-t border-warm-200/50 bg-warm-50/80 space-y-3">
            {/* 상태 변경 */}
            {onStatusChange && (
              <div className="flex gap-2">
                {status !== "in-progress" && (
                  <button
                    onClick={() => {
                      onStatusChange(project.id, "in-progress");
                      onClose();
                    }}
                    className="flex-1 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    진행중으로
                  </button>
                )}
                {status !== "todo" && (
                  <button
                    onClick={() => {
                      onStatusChange(project.id, "todo");
                      onClose();
                    }}
                    className="flex-1 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    예정으로
                  </button>
                )}
                {status !== "done" && (
                  <button
                    onClick={() => {
                      onStatusChange(project.id, "done");
                      onClose();
                    }}
                    className="flex-1 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    완료
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm("정말 삭제할까요?")) onDelete();
                }}
                className="text-sm text-red-400 hover:text-red-600 transition-colors"
              >
                삭제
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-warm-500 hover:bg-warm-100 rounded-lg transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-warm-700 text-white rounded-lg hover:bg-warm-800 transition-colors"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 이미지 확대 미리보기 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={24} />
          </button>
          <img
            src={previewImage}
            alt="미리보기"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
