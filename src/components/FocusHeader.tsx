"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, X, FolderPlus, Scissors, FolderOpen } from "lucide-react";
import Dropdown from "./Dropdown";

interface FocusHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  folders: string[];
  activeFolder: string | null;
  onFolderChange: (folder: string | null) => void;
  onAddProject: () => void;
  onAddFolder: (name: string) => void;
  onRenameFolder: (oldName: string, newName: string) => void;
  onDeleteFolder: (folder: string) => void;
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
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
}: FocusHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [folderInput, setFolderInput] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (folderInput) {
      folderInputRef.current?.focus();
    }
  }, [folderInput]);

  useEffect(() => {
    if (renamingFolder !== null) {
      renameInputRef.current?.focus();
    }
  }, [renamingFolder]);

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    onSearchChange("");
  };

  const submitFolder = () => {
    const name = folderName.trim();
    if (name) {
      onAddFolder(name);
      setFolderName("");
    }
    setFolderInput(false);
  };

  return (
    <div className="space-y-2">
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
          <span key={f} className="relative group/folder inline-flex items-center">
            {renamingFolder === f ? (
              <span className="inline-flex items-center gap-1">
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onRenameFolder(f, renameValue);
                      setRenamingFolder(null);
                    }
                    if (e.key === "Escape") setRenamingFolder(null);
                  }}
                  className="px-2.5 py-1 rounded-lg text-sm font-medium border border-accent/40 bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 w-28"
                />
                <button
                  onClick={() => {
                    onRenameFolder(f, renameValue);
                    setRenamingFolder(null);
                  }}
                  className="px-2.5 py-1 bg-warm-800 text-white rounded-lg text-xs hover:bg-warm-700 transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={() => setRenamingFolder(null)}
                  className="px-2 py-1 text-warm-400 hover:text-warm-600 rounded-lg text-xs hover:bg-warm-100 transition-colors"
                >
                  취소
                </button>
              </span>
            ) : (
              <button
                onClick={() => onFolderChange(activeFolder === f ? null : f)}
                onDoubleClick={() => {
                  setRenameValue(f);
                  setRenamingFolder(f);
                }}
                className={`px-3.5 py-1.5 rounded-full text-sm transition-all inline-flex items-center gap-1 ${
                  activeFolder === f
                    ? "bg-warm-800 text-white pr-2.5"
                    : "text-warm-500 hover:bg-warm-100"
                }`}
              >
                {f}
                {activeFolder === f && (
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(f);
                    }}
                    className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <X size={10} />
                  </span>
                )}
              </button>
            )}
          </span>
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

        <div className="flex-1" />

        {/* 정렬 · 검색 · 추가 버튼 그룹 */}
        <div className="flex items-center gap-1.5">
          {/* 정렬 드롭다운 */}
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              searchOpen ? "max-w-0 opacity-0 mr-0" : "max-w-[140px] opacity-100"
            }`}
          >
            <Dropdown
              value={sortBy}
              onChange={onSortChange}
              options={[
                { value: "recent", label: "최신순" },
                { value: "name", label: "이름순" },
                { value: "progress", label: "진행률순" },
                { value: "difficulty", label: "난이도순" },
              ]}
            />
          </div>

          {/* 검색 영역 */}
          <div
            className={`relative flex items-center overflow-hidden transition-all duration-200 ease-in-out ${
              searchOpen ? "w-48" : "w-9 h-9"
            }`}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeSearch();
              }}
              placeholder="검색..."
              tabIndex={searchOpen ? 0 : -1}
              className={`w-48 h-9 pl-9 pr-8 border rounded-xl text-sm placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all duration-200 ${
                searchOpen
                  ? "bg-white border-warm-200 opacity-100"
                  : "bg-transparent border-transparent opacity-0"
              }`}
            />
            {searchOpen ? (
              <button
                onClick={closeSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-300 hover:text-warm-500"
              >
                <X size={14} />
              </button>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="absolute inset-0 rounded-full hover:bg-warm-100 transition-colors flex items-center justify-center text-warm-400 hover:text-warm-600"
              >
                <Search size={15} />
              </button>
            )}
            {searchOpen && (
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-warm-300"
              />
            )}
          </div>

          {/* + 버튼 (메뉴) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex items-center justify-center bg-warm-800 text-white rounded-full hover:bg-warm-700 transition-colors"
            >
              <Plus size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-warm-100 py-1 z-20 min-w-[140px]">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onAddProject();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                >
                  <Scissors size={14} className="text-warm-400" />
                  새 프로젝트
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
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
        </div>
      </div>

      {/* 폴더 이름 입력 */}
      {folderInput && (
        <div className="flex items-center gap-2">
          <input
            ref={folderInputRef}
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); submitFolder(); }
              if (e.key === "Escape") { setFolderInput(false); setFolderName(""); }
            }}
            onBlur={submitFolder}
            placeholder="폴더 이름 입력"
            className="flex-1 max-w-xs px-3 py-2 bg-white border border-warm-200 rounded-xl text-sm placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
          />
        </div>
      )}
    </div>
  );
}
