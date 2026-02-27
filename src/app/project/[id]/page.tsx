"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Project } from "@prisma/client";
import {
  StitchCounter,
  Attachment,
} from "@/types/project";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  FileText,
  Play,
  Upload,
  Link,
  ExternalLink,
  X,
} from "lucide-react";

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
  );
  return match ? match[1] : null;
}

export default function WorkModePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable states
  const [counters, setCounters] = useState<StitchCounter[]>([]);
  const [newCounterName, setNewCounterName] = useState("");
  const [memo, setMemo] = useState("");
  const [progress, setProgress] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch project
  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        setCounters((data.counters as unknown as StitchCounter[]) || []);
        setMemo(data.memo || "");
        setProgress(data.progress || 0);
        const atts = (data.attachments as unknown as Attachment[]) || [];
        setAttachments(atts);
        const viewable = atts.filter(
          (a) => a.type === "image" || a.type === "pdf" || a.type === "youtube"
        );
        if (viewable.length > 0) setActiveAttachmentId(viewable[0].id);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Save helper
  const saveField = useCallback(
    async (data: Record<string, unknown>) => {
      if (!project) return;
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
      }
    },
    [project]
  );

  // Counter actions
  const updateCount = (counterId: string, delta: number) => {
    const updated = counters.map((c) =>
      c.id === counterId ? { ...c, value: Math.max(0, c.value + delta) } : c
    );
    setCounters(updated);
    saveField({ counters: updated });
  };

  const addCounter = () => {
    const name = newCounterName.trim() || `카운터 ${counters.length + 1}`;
    const updated = [
      ...counters,
      { id: crypto.randomUUID(), name, value: 0 },
    ];
    setCounters(updated);
    setNewCounterName("");
    saveField({ counters: updated });
  };

  const removeCounter = (counterId: string) => {
    const updated = counters.filter((c) => c.id !== counterId);
    setCounters(updated);
    saveField({ counters: updated });
  };

  // Progress
  const handleProgressChange = (val: number) => {
    setProgress(val);
    saveField({ progress: val });
  };

  // Attachments
  const viewableAttachments = attachments.filter(
    (a) => a.type === "image" || a.type === "pdf" || a.type === "youtube"
  );
  const urlAttachments = attachments.filter((a) => a.type === "url");
  const activeAttachment =
    viewableAttachments.find((a) => a.id === activeAttachmentId) ??
    viewableAttachments[0] ??
    null;

  useEffect(() => {
    if (activeAttachmentId && !attachments.find((a) => a.id === activeAttachmentId)) {
      const first = viewableAttachments[0];
      setActiveAttachmentId(first?.id ?? null);
    }
  }, [attachments, activeAttachmentId, viewableAttachments]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newAtts = [...attachments];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        newAtts.push({
          id: crypto.randomUUID(),
          type: data.type as "image" | "pdf",
          url: data.url,
          name: data.name,
        });
      }
    }
    setAttachments(newAtts);
    saveField({ attachments: newAtts });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Auto-select newly added viewable
    const newViewable = newAtts.filter(
      (a) => a.type === "image" || a.type === "pdf" || a.type === "youtube"
    );
    if (newViewable.length > 0 && !activeAttachmentId) {
      setActiveAttachmentId(newViewable[0].id);
    }
  };

  const addLink = () => {
    const url = linkInput.trim();
    if (!url) return;
    const isYoutube = /youtube\.com|youtu\.be/.test(url);
    const newAtt: Attachment = {
      id: crypto.randomUUID(),
      type: isYoutube ? "youtube" : "url",
      url,
      name: isYoutube ? "YouTube" : url,
    };
    const updated = [...attachments, newAtt];
    setAttachments(updated);
    saveField({ attachments: updated });
    setLinkInput("");
    if (isYoutube && !activeAttachmentId) {
      setActiveAttachmentId(newAtt.id);
    }
  };

  const removeAttachment = (attId: string) => {
    const updated = attachments.filter((a) => a.id !== attId);
    setAttachments(updated);
    saveField({ attachments: updated });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-warm-400 text-sm">불러오는 중...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-3">
        <div className="text-warm-500 text-sm">프로젝트를 찾을 수 없습니다</div>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-accent hover:underline"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    todo: "예정",
    "in-progress": "진행중",
    done: "완료",
  };

  const statusColor: Record<string, string> = {
    todo: "bg-accent-light text-accent",
    "in-progress": "bg-sky-light text-sky-main",
    done: "bg-sage-light text-sage-main",
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b border-warm-200 bg-white/60 backdrop-blur-sm">
        <button
          onClick={() => router.push("/")}
          className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-warm-800 truncate flex-1">
          {project.title}
        </h1>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[project.status] || ""}`}
        >
          {statusLabel[project.status] || project.status}
        </span>
        <div className="flex items-center gap-2 text-sm text-warm-500">
          <span className="font-semibold text-accent">{progress}%</span>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Content Viewer */}
        <div className="w-full md:w-[65%] flex flex-col border-b md:border-b-0 md:border-r border-warm-100 min-h-[40vh] md:min-h-0">
          {/* Viewer */}
          <div className="flex-1 overflow-hidden flex items-center justify-center bg-warm-50 relative">
            {activeAttachment ? (
              <>
                {activeAttachment.type === "pdf" && (
                  <iframe
                    src={activeAttachment.url}
                    className="w-full h-full"
                    title={activeAttachment.name}
                  />
                )}
                {activeAttachment.type === "youtube" && (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(activeAttachment.url)}`}
                    className="w-full aspect-video max-h-full rounded-xl"
                    allowFullScreen
                  />
                )}
                {activeAttachment.type === "image" && (
                  <img
                    src={activeAttachment.url}
                    alt={activeAttachment.name}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </>
            ) : (
              <div className="text-center text-warm-400 px-6">
                <p className="text-sm">첨부된 도안이 없습니다</p>
                <p className="text-xs mt-1">아래에서 파일을 업로드하거나 링크를 추가하세요</p>
              </div>
            )}
          </div>

          {/* Thumbnail strip + upload bar */}
          <div className="flex-shrink-0 border-t border-warm-100 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              {/* Thumbnails */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
                {viewableAttachments.map((att) => (
                  <button
                    key={att.id}
                    onClick={() => setActiveAttachmentId(att.id)}
                    className={`relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all group ${
                      activeAttachment?.id === att.id
                        ? "border-accent ring-2 ring-accent/20"
                        : "border-warm-200 hover:border-warm-300"
                    }`}
                  >
                    {att.type === "image" && (
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {att.type === "pdf" && (
                      <div className="w-full h-full flex items-center justify-center bg-rose-light">
                        <FileText size={16} className="text-rose-main" />
                      </div>
                    )}
                    {att.type === "youtube" && (
                      <div className="w-full h-full flex items-center justify-center bg-red-50">
                        <Play size={16} className="text-red-500" />
                      </div>
                    )}
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAttachment(att.id);
                      }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={8} />
                    </span>
                  </button>
                ))}
              </div>

              {/* Upload controls */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-warm-500 hover:text-accent hover:bg-warm-50 rounded-lg transition-all disabled:opacity-50"
                >
                  <Upload size={12} />
                  {uploading ? "..." : "파일"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-1">
                  <input
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addLink()}
                    placeholder="URL / YouTube"
                    className="w-36 px-2 py-1.5 text-xs border border-warm-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                  <button
                    onClick={addLink}
                    className="px-2 py-1.5 text-xs text-white bg-accent rounded-lg hover:bg-accent/85 transition-all"
                  >
                    <Link size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Counters + Info */}
        <div className="w-full md:w-[35%] flex flex-col min-h-0">
          {/* Stitch Counters - always visible */}
          <div className="flex-shrink-0 max-h-[50%] overflow-y-auto px-4 pt-4 pb-2">
            <div className="text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-3">
              단수 카운터
            </div>
            <div className="space-y-2">
              {counters.map((counter) => (
                <div
                  key={counter.id}
                  className="flex items-center gap-2 bg-warm-50 rounded-xl px-3 py-2"
                >
                  <span className="flex-1 text-sm font-medium text-warm-700 truncate">
                    {counter.name}
                  </span>
                  <button
                    onClick={() => updateCount(counter.id, -1)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-warm-200 text-warm-500 hover:bg-warm-100 active:scale-95 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-2xl font-bold text-warm-800 min-w-[48px] text-center tabular-nums">
                    {counter.value}
                  </span>
                  <button
                    onClick={() => updateCount(counter.id, 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent text-white hover:bg-accent/85 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeCounter(counter.id)}
                    className="w-7 h-7 flex items-center justify-center text-warm-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="flex gap-1.5">
                <input
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCounter()}
                  placeholder="카운터 이름"
                  className="flex-1 px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <button
                  onClick={addCounter}
                  className="px-3 py-2 text-sm text-white bg-accent rounded-xl hover:bg-accent/85 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-warm-100 mx-4" />

          {/* Scrollable info */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {/* Progress */}
            <div>
              <div className="text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-2">
                진행률
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-accent min-w-[52px]">
                  {progress}%
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progress}
                  onChange={(e) => handleProgressChange(Number(e.target.value))}
                  className="flex-1 accent-accent"
                />
              </div>
            </div>

            {/* Memo */}
            <div>
              <div className="text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-2">
                메모
              </div>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                onBlur={() => saveField({ memo })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                placeholder="메모를 입력하세요..."
              />
            </div>

            {/* URL links */}
            {urlAttachments.length > 0 && (
              <div>
                <div className="text-[11px] font-medium text-warm-400 uppercase tracking-wider mb-2">
                  링크
                </div>
                <div className="space-y-1.5">
                  {urlAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 px-3 py-2 bg-warm-50 rounded-lg text-sm group"
                    >
                      <ExternalLink size={13} className="text-warm-400 flex-shrink-0" />
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sky-main break-all hover:underline truncate"
                      >
                        {att.name}
                      </a>
                      <button
                        onClick={() => removeAttachment(att.id)}
                        className="text-warm-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
