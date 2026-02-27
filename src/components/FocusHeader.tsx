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
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-300"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="프로젝트 검색..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-600 focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <option value="recent">최신순</option>
          <option value="name">이름순</option>
          <option value="progress">진행률순</option>
          <option value="difficulty">난이도순</option>
        </select>

        <button
          onClick={onAddProject}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-warm-800 text-white rounded-xl hover:bg-warm-700 transition-colors font-medium text-sm"
        >
          <Plus size={15} />
          새 프로젝트
        </button>
      </div>

      {folders.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onFolderChange(null)}
            className={`px-3.5 py-1.5 rounded-full text-sm transition-all ${
              activeFolder === null
                ? "bg-warm-800 text-white"
                : "text-warm-500 hover:bg-warm-100"
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
              className={`px-3.5 py-1.5 rounded-full text-sm transition-all ${
                activeFolder === f
                  ? "bg-warm-800 text-white"
                  : "text-warm-500 hover:bg-warm-100"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() =>
              onFolderChange(activeFolder === "" ? null : "")
            }
            className={`px-3.5 py-1.5 rounded-full text-sm transition-all ${
              activeFolder === ""
                ? "bg-warm-800 text-white"
                : "text-warm-400 hover:bg-warm-100"
            }`}
          >
            미분류
          </button>
        </div>
      )}
    </div>
  );
}
