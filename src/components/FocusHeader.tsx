"use client";

import { Search, Plus } from "lucide-react";

interface FocusHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  folders: string[];
  activeFolder: string | null;
  onFolderChange: (folder: string | null) => void;
  onAddProject: () => void;
}

export default function FocusHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  folders,
  activeFolder,
  onFolderChange,
  onAddProject,
}: FocusHeaderProps) {
  return (
    <div className="space-y-3">
      {/* 상단: 검색 + 정렬 + 추가 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="검색..."
            className="w-full pl-9 pr-3 py-2 bg-warm-50/90 backdrop-blur-sm border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30 focus:border-rose-main"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 bg-warm-50/90 backdrop-blur-sm border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-main/30"
        >
          <option value="recent">최신순</option>
          <option value="name">이름순</option>
          <option value="progress">진행률순</option>
          <option value="difficulty">난이도순</option>
        </select>

        <button
          onClick={onAddProject}
          className="flex items-center gap-1.5 px-4 py-2 bg-warm-700 text-white rounded-lg hover:bg-warm-800 transition-colors font-medium text-sm shadow-md"
        >
          <Plus size={16} />
          새 프로젝트
        </button>
      </div>

      {/* 폴더 필터 */}
      {folders.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onFolderChange(null)}
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
                onFolderChange(activeFolder === f ? null : f)
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
              onFolderChange(activeFolder === "" ? null : "")
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
    </div>
  );
}
