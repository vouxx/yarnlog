"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Material } from "@prisma/client";
import { Plus, X, Pencil, Trash2, Camera, Image as ImageIcon } from "lucide-react";

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
};

const typeLabel: Record<MaterialType, string> = {
  yarn: "실",
  supply: "부자재",
  needle: "바늘",
};

const typeColors: Record<MaterialType, { bg: string; badge: string; border: string; active: string }> = {
  yarn: {
    bg: "bg-postit-pink",
    badge: "bg-rose-main/10 text-rose-main",
    border: "border-rose-200",
    active: "bg-rose-main text-white",
  },
  supply: {
    bg: "bg-postit-blue",
    badge: "bg-sky-main/10 text-sky-main",
    border: "border-blue-200",
    active: "bg-sky-main text-white",
  },
  needle: {
    bg: "bg-postit-yellow",
    badge: "bg-amber-500/10 text-amber-600",
    border: "border-amber-200",
    active: "bg-amber-500 text-white",
  },
};

export default function MaterialStash() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | MaterialType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialFormData>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMaterials = useCallback(async () => {
    const res = await fetch("/api/materials");
    const data = await res.json();
    setMaterials(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const filtered =
    filter === "all"
      ? materials
      : materials.filter((m) => m.type === filter);

  const yarnCount = materials.filter((m) => m.type === "yarn").length;
  const supplyCount = materials.filter((m) => m.type === "supply").length;
  const needleCount = materials.filter((m) => m.type === "needle").length;

  const openCreate = (type: MaterialType = "yarn") => {
    setEditingId(null);
    setForm({ ...emptyForm, type });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-warm-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 탭 + 추가 버튼 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-warm-700 text-white"
                : "bg-warm-50/90 text-warm-500 hover:bg-warm-200/60"
            }`}
          >
            전체 {materials.length}
          </button>
          <button
            onClick={() => setFilter("yarn")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === "yarn"
                ? "bg-rose-main text-white"
                : "bg-warm-50/90 text-warm-500 hover:bg-warm-200/60"
            }`}
          >
            실 {yarnCount}
          </button>
          <button
            onClick={() => setFilter("needle")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === "needle"
                ? "bg-amber-500 text-white"
                : "bg-warm-50/90 text-warm-500 hover:bg-warm-200/60"
            }`}
          >
            바늘 {needleCount}
          </button>
          <button
            onClick={() => setFilter("supply")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === "supply"
                ? "bg-sky-main text-white"
                : "bg-warm-50/90 text-warm-500 hover:bg-warm-200/60"
            }`}
          >
            부자재 {supplyCount}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openCreate("yarn")}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-main text-white rounded-lg hover:bg-rose-main/80 transition-colors text-sm"
          >
            <Plus size={14} />실
          </button>
          <button
            onClick={() => openCreate("needle")}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
          >
            <Plus size={14} />바늘
          </button>
          <button
            onClick={() => openCreate("supply")}
            className="flex items-center gap-1 px-3 py-1.5 bg-sky-main text-white rounded-lg hover:bg-sky-main/80 transition-colors text-sm"
          >
            <Plus size={14} />부자재
          </button>
        </div>
      </div>

      {/* 재료 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-warm-400 bg-warm-50/50 rounded-lg">
          <p className="text-sm mb-1">등록된 재료가 없어요</p>
          <p className="text-xs">보유한 실이나 바늘, 부자재를 등록해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((material) => {
            const mt = material.type as MaterialType;
            const colors = typeColors[mt] || typeColors.supply;
            return (
              <div
                key={material.id}
                className={`rounded-lg shadow-sm border transition-shadow hover:shadow-md overflow-hidden ${colors.bg} ${colors.border}`}
              >
                {/* 이미지 */}
                {material.imageUrl && (
                  <div className="w-full h-32 overflow-hidden">
                    <img
                      src={material.imageUrl}
                      alt={material.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${colors.badge}`}
                        >
                          {typeLabel[mt] || mt}
                        </span>
                        {material.brand && (
                          <span className="text-xs text-warm-400">
                            {material.brand}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-warm-800 truncate">
                        {material.name}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {material.color && (
                          <span className="text-xs text-warm-500">
                            {material.color}
                          </span>
                        )}
                        {material.weight && (
                          <span className="text-xs text-warm-500">
                            {mt === "needle" ? `${material.weight}` : material.weight}
                          </span>
                        )}
                        {material.quantity && (
                          <span className="text-xs font-medium text-warm-600">
                            {material.quantity}
                          </span>
                        )}
                      </div>
                      {material.notes && (
                        <p className="text-xs text-warm-400 mt-1 line-clamp-2">
                          {material.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() => openEdit(material)}
                        className="p-1.5 text-warm-400 hover:text-warm-600 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="p-1.5 text-warm-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 추가/수정 폼 모달 */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-warm-800">
                {editingId ? "재료 수정" : "재료 등록"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-warm-400 hover:text-warm-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {/* 타입 선택 */}
              <div className="flex gap-2">
                {(["yarn", "supply", "needle"] as MaterialType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.type === t
                        ? typeColors[t].active
                        : "bg-warm-100 text-warm-500"
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
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={form.imageUrl}
                      alt="미리보기"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <Camera size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: "" })}
                        className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
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
                    className="w-full py-6 border-2 border-dashed border-warm-200 rounded-lg text-warm-400 hover:border-warm-300 hover:text-warm-500 transition-colors flex flex-col items-center gap-1.5"
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
                className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                placeholder={form.type === "needle" ? "이름 (예: 대바늘) *" : "이름 *"}
                autoFocus
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                  placeholder="브랜드"
                />
                <input
                  type="text"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  className="px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                  placeholder={form.type === "needle" ? "수량 (예: 2개)" : "수량 (예: 3볼)"}
                />
              </div>

              {/* 실: 색상 + 굵기 */}
              {form.type === "yarn" && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                    placeholder="색상"
                  />
                  <input
                    type="text"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    className="px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                    placeholder="굵기 (예: DK)"
                  />
                </div>
              )}

              {/* 바늘: 종류 + 호수 */}
              {form.type === "needle" && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                    placeholder="종류 (대바늘/코바늘/...)"
                  />
                  <input
                    type="text"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    className="px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
                    placeholder="호수 (예: 6mm)"
                  />
                </div>
              )}

              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30 resize-none"
                rows={2}
                placeholder="메모"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-warm-500 hover:bg-warm-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-warm-700 text-white rounded-lg hover:bg-warm-800 transition-colors"
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
