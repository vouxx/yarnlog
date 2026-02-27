"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Material } from "@prisma/client";
import { Plus, X, Pencil, Trash2, Camera, Image as ImageIcon, CheckSquare, Square, Minus, FolderOpen, FolderPlus, ChevronDown, Package, Layers } from "lucide-react";

type ViewMode = "type" | "folder";

type MaterialType = "yarn" | "supply" | "needle";

interface MaterialFormData {
  type: MaterialType;
  name: string;
  brand: string;
  color: string;
  weight: string;
  quantity: string;
  notes: string;
  imageUrl: string;
  folder: string;
}

const emptyForm: MaterialFormData = {
  type: "yarn",
  name: "",
  brand: "",
  color: "",
  weight: "",
  quantity: "",
  notes: "",
  imageUrl: "",
  folder: "",
};

const typeLabel: Record<MaterialType, string> = {
  yarn: "실",
  supply: "부자재",
  needle: "바늘",
};

const typeColors: Record<MaterialType, { badge: string; border: string; active: string; accent: string }> = {
  yarn: {
    badge: "bg-accent-light text-accent",
    border: "border-warm-100",
    active: "bg-accent text-white",
    accent: "border-l-accent",
  },
  needle: {
    badge: "bg-sky-light text-sky-main",
    border: "border-warm-100",
    active: "bg-sky-main text-white",
    accent: "border-l-sky-main",
  },
  supply: {
    badge: "bg-warm-200 text-warm-600",
    border: "border-warm-100",
    active: "bg-warm-600 text-white",
    accent: "border-l-warm-500",
  },
};

function FolderSelector({
  value,
  folders,
  onChange,
}: {
  value: string;
  folders: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      onChange(trimmed);
      setNewName("");
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-600 hover:border-warm-300 transition-all text-left"
      >
        <span className="truncate flex items-center gap-1.5">
          <FolderOpen size={13} className="text-warm-400" />
          {value || "미분류"}
        </span>
        <ChevronDown
          size={14}
          className={`text-warm-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-warm-200 rounded-xl shadow-lg py-1 max-h-52 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              !value ? "bg-warm-100 text-warm-800 font-medium" : "text-warm-600 hover:bg-warm-50"
            }`}
          >
            미분류
          </button>
          {folders.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => { onChange(f); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                f === value ? "bg-warm-100 text-warm-800 font-medium" : "text-warm-600 hover:bg-warm-50"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="border-t border-warm-100 mt-1 pt-1 px-2 pb-1">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submittedRef.current = true;
                    handleCreate();
                  }
                }}
                onBlur={() => {
                  if (!submittedRef.current) handleCreate();
                  submittedRef.current = false;
                }}
                placeholder="새 폴더 이름"
                className="flex-1 px-2.5 py-1.5 border border-warm-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
              <button
                type="button"
                onMouseDown={() => { submittedRef.current = true; }}
                onClick={handleCreate}
                className="px-2.5 py-1.5 bg-warm-700 text-white rounded-lg text-xs hover:bg-warm-600 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FolderMoveDropdown({
  folders,
  disabled,
  onMove,
}: {
  folders: string[];
  disabled: boolean;
  onMove: (folder: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-4 py-1.5 bg-warm-700 text-white rounded-lg hover:bg-warm-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        <FolderOpen size={13} />
        이동
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-48 bg-white border border-warm-200 rounded-xl shadow-lg py-1 max-h-52 overflow-y-auto">
          <button
            onClick={() => { onMove(""); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-warm-600 hover:bg-warm-50 transition-colors"
          >
            미분류로 이동
          </button>
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => { onMove(f); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-warm-600 hover:bg-warm-50 transition-colors"
            >
              {f}
            </button>
          ))}
          <div className="border-t border-warm-100 mt-1 pt-1 px-2 pb-1">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const trimmed = newName.trim();
                    if (trimmed) { onMove(trimmed); setNewName(""); setOpen(false); }
                  }
                }}
                placeholder="새 폴더"
                className="flex-1 px-2.5 py-1.5 border border-warm-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
              <button
                onClick={() => {
                  const trimmed = newName.trim();
                  if (trimmed) { onMove(trimmed); setNewName(""); setOpen(false); }
                }}
                className="px-2.5 py-1.5 bg-warm-700 text-white rounded-lg text-xs hover:bg-warm-600 transition-colors"
              >
                이동
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaterialStash() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("type");
  const [filter, setFilter] = useState<"all" | MaterialType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialFormData>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string | null>(null); // null=전체, ""=미분류, string=특정 폴더
  const [movingFolder, setMovingFolder] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [folderInput, setFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [manualFolders, setManualFolders] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem("yarnlog-material-folders");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [folderDeleteConfirm, setFolderDeleteConfirm] = useState<string | null>(null); // 삭제 확인 팝업 대상 폴더
  const renameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const folderSubmittedRef = useRef(false);

  const fetchMaterials = useCallback(async () => {
    const res = await fetch("/api/materials");
    const data = await res.json();
    setMaterials(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  useEffect(() => {
    localStorage.setItem("yarnlog-material-folders", JSON.stringify(Array.from(manualFolders)));
  }, [manualFolders]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (folderInput && folderInputRef.current) folderInputRef.current.focus();
  }, [folderInput]);

  useEffect(() => {
    if (renamingFolder !== null && renameInputRef.current) renameInputRef.current.focus();
  }, [renamingFolder]);

  const folders = useMemo(() => {
    const set = new Set<string>();
    materials.forEach((m) => {
      if (m.folder) set.add(m.folder);
    });
    manualFolders.forEach((f) => set.add(f));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [materials, manualFolders]);

  const filtered = useMemo(() => {
    let result = materials;
    if (activeFolder !== null) {
      result = result.filter((m) =>
        activeFolder === "" ? !m.folder : m.folder === activeFolder
      );
    }
    if (filter !== "all") {
      result = result.filter((m) => m.type === filter);
    }
    return result;
  }, [materials, activeFolder, filter]);

  const groupedByFolder = useMemo(() => {
    const groups: { folder: string; items: Material[] }[] = [];
    const folderMap = new Map<string, Material[]>();
    const uncategorized: Material[] = [];

    const source = filter !== "all" ? materials.filter((m) => m.type === filter) : materials;

    source.forEach((m) => {
      if (m.folder) {
        if (!folderMap.has(m.folder)) folderMap.set(m.folder, []);
        folderMap.get(m.folder)!.push(m);
      } else {
        uncategorized.push(m);
      }
    });

    // 모든 폴더 표시 (빈 폴더 포함)
    folders.forEach((f) => {
      groups.push({ folder: f, items: folderMap.get(f) || [] });
    });
    if (uncategorized.length > 0 || groups.length === 0) {
      groups.push({ folder: "", items: uncategorized });
    }

    return groups;
  }, [materials, filter, folders]);

  const yarnCount = materials.filter((m) => m.type === "yarn").length;
  const supplyCount = materials.filter((m) => m.type === "supply").length;
  const needleCount = materials.filter((m) => m.type === "needle").length;

  const switchViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "type") {
      setActiveFolder(null);
    }
  };

  const openCreate = (type: MaterialType = "yarn") => {
    setEditingId(null);
    setForm({ ...emptyForm, type, folder: activeFolder && activeFolder !== "" ? activeFolder : "" });
    setShowForm(true);
  };

  const openEdit = (material: Material) => {
    setEditingId(material.id);
    setForm({
      type: material.type as MaterialType,
      name: material.name,
      brand: material.brand || "",
      color: material.color || "",
      weight: material.weight || "",
      quantity: material.quantity || "",
      notes: material.notes || "",
      imageUrl: material.imageUrl || "",
      folder: material.folder || "",
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch {
      alert("이미지 업로드에 실패했습니다");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    if (editingId) {
      await fetch(`/api/materials/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    fetchMaterials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제할까요?")) return;
    await fetch(`/api/materials/${id}`, { method: "DELETE" });
    fetchMaterials();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const filteredIds = filtered.map((m) => m.id);
    const allSelected = filteredIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleRenameFolder = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setRenamingFolder(null);
      return;
    }
    await fetch("/api/materials/batch-folder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldFolder: oldName, newFolder: trimmed }),
    });
    setManualFolders((prev) => {
      const next = new Set(prev);
      next.delete(oldName);
      next.add(trimmed);
      return next;
    });
    if (activeFolder === oldName) setActiveFolder(trimmed);
    setRenamingFolder(null);
    fetchMaterials();
  };

  const handleDeleteFolder = async (folderName: string, deleteContents: boolean) => {
    const folderMaterials = materials.filter((m) => m.folder === folderName);

    if (deleteContents && folderMaterials.length > 0) {
      // 폴더 + 재료 함께 삭제
      await fetch("/api/materials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: folderMaterials.map((m) => m.id) }),
      });
    } else if (folderMaterials.length > 0) {
      // 폴더만 삭제 → 재료는 미분류로 이동
      await fetch("/api/materials/batch-folder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldFolder: folderName, newFolder: null }),
      });
    }

    setManualFolders((prev) => {
      const next = new Set(prev);
      next.delete(folderName);
      return next;
    });
    if (activeFolder === folderName) setActiveFolder(null);
    setFolderDeleteConfirm(null);
    fetchMaterials();
  };

  const submitNewFolder = () => {
    const trimmed = newFolderName.trim();
    if (trimmed && !folders.includes(trimmed)) {
      setManualFolders((prev) => new Set(prev).add(trimmed));
      setViewMode("folder");
    }
    setFolderInput(false);
    setNewFolderName("");
  };

  const handleBulkMove = async (folderName: string) => {
    if (selectedIds.size === 0) return;
    setMovingFolder(true);
    try {
      await fetch("/api/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          folder: folderName || null,
        }),
      });
      exitSelectMode();
      fetchMaterials();
    } finally {
      setMovingFolder(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}개의 재료를 삭제할까요?`)) return;

    setDeleting(true);
    try {
      await fetch("/api/materials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      exitSelectMode();
      fetchMaterials();
    } finally {
      setDeleting(false);
    }
  };

  const renderMaterialItem = (material: Material, hideFolder = false) => {
    const mt = material.type as MaterialType;
    const colors = typeColors[mt] || typeColors.supply;
    return (
      <div
        key={material.id}
        onClick={selectMode ? () => toggleSelect(material.id) : undefined}
        className={`flex items-center gap-3 rounded-lg border-l-3 ${colors.accent} p-3 transition-all hover:bg-warm-50 group ${
          selectMode ? "cursor-pointer" : ""
        } ${selectMode && selectedIds.has(material.id) ? "ring-2 ring-accent/40 bg-accent/5" : ""}`}
      >
        {selectMode && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleSelect(material.id); }}
            className="flex-shrink-0"
          >
            {selectedIds.has(material.id) ? (
              <CheckSquare size={20} className="text-accent" />
            ) : (
              <Square size={20} className="text-warm-300" />
            )}
          </button>
        )}
        {material.imageUrl ? (
          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-warm-50 flex items-center justify-center flex-shrink-0">
            <ImageIcon size={18} className="text-warm-200" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-warm-800 text-sm truncate">{material.name}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${colors.badge}`}>
              {typeLabel[mt] || mt}
            </span>
            {!hideFolder && material.folder && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-warm-100 text-warm-500 flex-shrink-0">
                {material.folder}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0 mt-0.5">
            {material.brand && <span className="text-xs text-warm-400">{material.brand}</span>}
            {material.color && <span className="text-xs text-warm-400">{material.color}</span>}
            {material.weight && <span className="text-xs text-warm-400">{material.weight}</span>}
            {material.quantity && <span className="text-xs font-medium text-warm-600">{material.quantity}</span>}
          </div>
          {material.notes && (
            <p className="text-xs text-warm-300 mt-0.5 truncate leading-relaxed">{material.notes}</p>
          )}
        </div>
        {!selectMode && (
          <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => openEdit(material)} className="p-2 text-warm-300 hover:text-warm-600 rounded-lg hover:bg-warm-50 transition-all">
              <Pencil size={13} />
            </button>
            <button onClick={() => handleDelete(material.id)} className="p-2 text-warm-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-warm-300">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 뷰 모드 토글 + 액션 버튼 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* 뷰 모드 토글 */}
          <div className="flex bg-warm-100 rounded-lg p-0.5">
            <button
              onClick={() => switchViewMode("type")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "type"
                  ? "bg-white text-warm-800 shadow-sm"
                  : "text-warm-400 hover:text-warm-600"
              }`}
            >
              <Layers size={12} />
              타입별
            </button>
            <button
              onClick={() => switchViewMode("folder")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "folder"
                  ? "bg-white text-warm-800 shadow-sm"
                  : "text-warm-400 hover:text-warm-600"
              }`}
            >
              <FolderOpen size={12} />
              폴더별
            </button>
          </div>

          {/* 모드별 메인 필터 탭 */}
          {viewMode === "type" ? (
            <div className="flex gap-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === "all"
                    ? "bg-warm-800 text-white"
                    : "text-warm-500 hover:bg-warm-100"
                }`}
              >
                전체 {materials.length}
              </button>
              <button
                onClick={() => setFilter("yarn")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === "yarn"
                    ? "bg-accent text-white"
                    : "text-warm-500 hover:bg-warm-100"
                }`}
              >
                실 {yarnCount}
              </button>
              <button
                onClick={() => setFilter("needle")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === "needle"
                    ? "bg-sky-main text-white"
                    : "text-warm-500 hover:bg-warm-100"
                }`}
              >
                바늘 {needleCount}
              </button>
              <button
                onClick={() => setFilter("supply")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === "supply"
                    ? "bg-warm-600 text-white"
                    : "text-warm-500 hover:bg-warm-100"
                }`}
              >
                부자재 {supplyCount}
              </button>
            </div>
          ) : (
            <div className="flex gap-1 flex-wrap items-center">
              <button
                onClick={() => setActiveFolder(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeFolder === null
                    ? "bg-warm-800 text-white"
                    : "text-warm-500 hover:bg-warm-100"
                }`}
              >
                전체 {materials.length}
              </button>
              {folders.map((f) => {
                const count = materials.filter((m) => m.folder === f).length;
                return (
                  <button
                    key={f}
                    onClick={() => setActiveFolder(activeFolder === f ? null : f)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeFolder === f
                        ? "bg-warm-800 text-white"
                        : "text-warm-500 hover:bg-warm-100"
                    }`}
                  >
                    {f} {count > 0 && count}
                    {activeFolder === f && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderDeleteConfirm(f);
                        }}
                        className="ml-0.5 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <X size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => setActiveFolder(activeFolder === "" ? null : "")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeFolder === ""
                    ? "bg-warm-800 text-white"
                    : "text-warm-400 hover:bg-warm-100"
                }`}
              >
                미분류 {materials.filter((m) => !m.folder).length}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!selectMode ? (
            <>
              {materials.length > 0 && (
                <button
                  onClick={() => setSelectMode(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-warm-500 hover:bg-warm-100 rounded-xl transition-colors text-sm font-medium"
                >
                  <CheckSquare size={14} />
                  선택
                </button>
              )}
              <div className="relative" ref={addMenuRef}>
                <button
                  onClick={() => setAddMenuOpen(!addMenuOpen)}
                  className="w-9 h-9 flex items-center justify-center bg-warm-800 text-white rounded-full hover:bg-warm-700 transition-colors"
                >
                  <Plus size={18} />
                </button>
                {addMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-warm-100 py-1 z-20 min-w-[140px]">
                    <button
                      onClick={() => {
                        setAddMenuOpen(false);
                        openCreate("yarn");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                    >
                      <Package size={14} className="text-warm-400" />
                      새 재료
                    </button>
                    <button
                      onClick={() => {
                        setAddMenuOpen(false);
                        setFolderInput(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                    >
                      <FolderPlus size={14} className="text-warm-400" />
                      새 폴더
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={exitSelectMode}
              className="flex items-center gap-1.5 px-4 py-2 text-warm-500 hover:bg-warm-100 rounded-xl transition-colors text-sm font-medium"
            >
              <X size={14} />
              취소
            </button>
          )}
        </div>
      </div>

      {/* (폴더별 모드의 탭은 위에 통합됨) */}

      {/* 폴더 이름 입력 */}
      {folderInput && (
        <div className="flex items-center gap-2">
          <FolderPlus size={15} className="text-warm-400" />
          <input
            ref={folderInputRef}
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                folderSubmittedRef.current = true;
                submitNewFolder();
              }
              if (e.key === "Escape") {
                folderSubmittedRef.current = true;
                setFolderInput(false);
                setNewFolderName("");
              }
            }}
            onBlur={() => {
              if (!folderSubmittedRef.current) submitNewFolder();
              folderSubmittedRef.current = false;
            }}
            placeholder="폴더 이름 입력"
            className="flex-1 max-w-xs px-3 py-2 bg-white border border-warm-200 rounded-xl text-sm placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
          />
          <button
            onMouseDown={() => { folderSubmittedRef.current = true; }}
            onClick={submitNewFolder}
            className="px-3 py-2 bg-warm-800 text-white rounded-xl text-sm font-medium hover:bg-warm-700 transition-colors"
          >
            저장
          </button>
          <button
            onMouseDown={() => { folderSubmittedRef.current = true; }}
            onClick={() => { setFolderInput(false); setNewFolderName(""); }}
            className="p-2 text-warm-400 hover:text-warm-600 hover:bg-warm-100 rounded-xl transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 선택 모드 액션 바 */}
      {selectMode && (
        <div className="flex items-center justify-between bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-sm text-warm-600 hover:text-warm-800 transition-colors"
            >
              {filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id)) ? (
                <CheckSquare size={16} className="text-accent" />
              ) : selectedIds.size > 0 ? (
                <Minus size={16} className="text-warm-400" />
              ) : (
                <Square size={16} className="text-warm-400" />
              )}
              전체 선택
            </button>
            <span className="text-xs text-warm-400">
              {selectedIds.size}개 선택됨
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* 폴더 이동 */}
            <FolderMoveDropdown
              folders={folders}
              disabled={selectedIds.size === 0 || movingFolder}
              onMove={handleBulkMove}
            />
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0 || deleting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <Trash2 size={13} />
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>
      )}

      {/* 재료 목록 */}
      {viewMode === "type" ? (
        /* 타입별 뷰: 기존 플랫 리스트 */
        filtered.length === 0 ? (
          <div className="text-center py-16 text-warm-300 bg-warm-50 rounded-2xl border border-dashed border-warm-200">
            <p className="text-sm mb-1">등록된 재료가 없어요</p>
            <p className="text-xs">보유한 실이나 바늘, 부자재를 등록해보세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((material) => renderMaterialItem(material))}
          </div>
        )
      ) : activeFolder !== null ? (
        /* 폴더별 뷰 - 특정 폴더 선택: 플랫 리스트 */
        filtered.length === 0 ? (
          <div className="text-center py-16 text-warm-300 bg-warm-50 rounded-2xl border border-dashed border-warm-200">
            <p className="text-sm mb-1">비어있는 폴더예요</p>
            <p className="text-xs">재료를 등록하거나 다른 폴더에서 이동해보세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((material) => renderMaterialItem(material, true))}
          </div>
        )
      ) : (
        /* 폴더별 뷰 - 전체: 폴더 섹션으로 그룹핑 */
        groupedByFolder.length === 0 ? (
          <div className="text-center py-16 text-warm-300 bg-warm-50 rounded-2xl border border-dashed border-warm-200">
            <p className="text-sm mb-1">등록된 재료가 없어요</p>
            <p className="text-xs">보유한 실이나 바늘, 부자재를 등록해보세요</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByFolder.map((group) => (
              <div key={group.folder || "__uncategorized__"} className="group/folder">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <FolderOpen size={14} className="text-warm-400 flex-shrink-0" />
                  {group.folder && renamingFolder === group.folder ? (
                    <>
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); handleRenameFolder(group.folder, renameValue); }
                          if (e.key === "Escape") setRenamingFolder(null);
                        }}
                        className="px-2 py-0.5 rounded-lg text-sm font-semibold border border-accent/40 bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 w-32"
                      />
                      <button
                        onClick={() => handleRenameFolder(group.folder, renameValue)}
                        className="px-2.5 py-1 bg-warm-800 text-white rounded-lg text-[11px] hover:bg-warm-700 transition-colors flex-shrink-0"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setRenamingFolder(null)}
                        className="px-2 py-1 text-warm-400 hover:text-warm-600 rounded-lg text-[11px] hover:bg-warm-100 transition-colors flex-shrink-0"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      {group.folder ? (
                        <button
                          onClick={() => {
                            setRenameValue(group.folder);
                            setRenamingFolder(group.folder);
                          }}
                          className="text-sm font-semibold text-warm-700 hover:text-accent transition-colors cursor-text"
                        >
                          {group.folder}
                        </button>
                      ) : (
                        <h3 className="text-sm font-semibold text-warm-400">미분류</h3>
                      )}
                      <span className="text-[11px] text-warm-400">{group.items.length}</span>
                      <div className="flex-1" />
                      {group.folder && (
                        <button
                          onClick={() => setFolderDeleteConfirm(group.folder)}
                          className="p-1 text-warm-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all flex-shrink-0 opacity-0 group-hover/folder:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </>
                  )}
                </div>
                {group.items.length > 0 ? (
                  <div className="space-y-2">
                    {group.items.map((material) => renderMaterialItem(material, true))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-warm-300 bg-warm-50/50 rounded-xl border border-dashed border-warm-200">
                    <p className="text-xs">비어있는 폴더예요</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* 폴더 삭제 확인 팝업 */}
      {folderDeleteConfirm !== null && (() => {
        const count = materials.filter((m) => m.folder === folderDeleteConfirm).length;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setFolderDeleteConfirm(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={16} className="text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-warm-800">폴더 삭제</h3>
              </div>
              <p className="text-sm text-warm-500 mt-3 mb-5 leading-relaxed">
                &ldquo;{folderDeleteConfirm}&rdquo; 폴더를 삭제할까요?
                {count > 0 && (
                  <span className="block mt-1 text-warm-400">
                    안에 재료가 <span className="font-semibold text-warm-600">{count}개</span> 있어요.
                  </span>
                )}
              </p>
              <div className="flex flex-col gap-2">
                {count > 0 ? (
                  <>
                    <button
                      onClick={() => handleDeleteFolder(folderDeleteConfirm, false)}
                      className="w-full py-2.5 rounded-xl text-sm font-medium bg-warm-100 text-warm-700 hover:bg-warm-200 transition-colors"
                    >
                      폴더만 삭제 <span className="text-warm-400 font-normal">(재료는 미분류로 이동)</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folderDeleteConfirm, true)}
                      className="w-full py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      폴더와 재료 모두 삭제
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDeleteFolder(folderDeleteConfirm, false)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                )}
                <button
                  onClick={() => setFolderDeleteConfirm(null)}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-warm-400 hover:bg-warm-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 추가/수정 폼 모달 */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-warm-800">
                {editingId ? "재료 수정" : "재료 등록"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-warm-300 hover:text-warm-600 p-1 rounded-lg hover:bg-warm-50 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 타입 선택 */}
              <div className="flex gap-2">
                {(["yarn", "supply", "needle"] as MaterialType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      form.type === t
                        ? typeColors[t].active
                        : "bg-warm-50 text-warm-500 hover:bg-warm-100"
                    }`}
                  >
                    {typeLabel[t]}
                  </button>
                ))}
              </div>

              {/* 사진 업로드 */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {form.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={form.imageUrl}
                      alt="미리보기"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
                      >
                        <Camera size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: "" })}
                        className="p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-8 border-2 border-dashed border-warm-200 rounded-xl text-warm-300 hover:border-warm-300 hover:text-warm-400 transition-all flex flex-col items-center gap-2"
                  >
                    {uploading ? (
                      <span className="text-sm">업로드 중...</span>
                    ) : (
                      <>
                        <ImageIcon size={20} />
                        <span className="text-xs">사진 추가</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                placeholder={form.type === "needle" ? "이름 (예: 대바늘) *" : "이름 *"}
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                  placeholder="브랜드"
                />
                <input
                  type="text"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  className="px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                  placeholder={form.type === "needle" ? "수량 (예: 2개)" : "수량 (예: 3볼)"}
                />
              </div>

              {form.type === "yarn" && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                    placeholder="색상"
                  />
                  <input
                    type="text"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    className="px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                    placeholder="굵기 (예: DK)"
                  />
                </div>
              )}

              {form.type === "needle" && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                    placeholder="종류 (대바늘/코바늘/...)"
                  />
                  <input
                    type="text"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    className="px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                    placeholder="호수 (예: 6mm)"
                  />
                </div>
              )}

              {/* 폴더 선택 */}
              <div>
                <label className="text-[11px] text-warm-400 block mb-1.5">폴더</label>
                <FolderSelector
                  value={form.folder}
                  folders={folders}
                  onChange={(v) => setForm({ ...form, folder: v })}
                />
              </div>

              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all resize-none"
                rows={2}
                placeholder="메모"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 text-warm-500 hover:bg-warm-50 rounded-xl transition-all"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-warm-800 text-white rounded-xl hover:bg-warm-700 transition-colors"
              >
                {editingId ? "수정" : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
