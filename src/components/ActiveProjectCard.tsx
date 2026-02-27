"use client";

import { Project } from "@prisma/client";
import { YarnInfo, NeedleInfo, Attachment, StitchCounter } from "@/types/project";
import { Paperclip, Hash, Trash2 } from "lucide-react";

interface ActiveProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

function ProgressRing({
  progress,
  size = 48,
}: {
  progress: number;
  size?: number;
}) {
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-warm-100"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-accent transition-all duration-500"
      />
    </svg>
  );
}

const difficultyLabel = ["", "입문", "초급", "중급", "고급", "마스터"];

export default function ActiveProjectCard({
  project,
  onClick,
  onDelete,
}: ActiveProjectCardProps) {
  const yarns = (project.yarns as unknown as YarnInfo[]) || [];
  const needles = (project.needles as unknown as NeedleInfo[]) || [];
  const attachments = (project.attachments as unknown as Attachment[]) || [];
  const counters = (project.counters as unknown as StitchCounter[]) || [];

  return (
    <div
      className="bg-white border border-warm-100 rounded-2xl p-5 hover:shadow-sm transition-all cursor-pointer group relative"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {project.folder && (
            <span className="text-[11px] text-warm-400 font-medium tracking-wide uppercase">
              {project.folder}
            </span>
          )}
          <h3 className="text-base font-semibold text-warm-800 truncate mt-0.5 group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          {project.memo && (
            <p className="text-sm text-warm-400 mt-1.5 line-clamp-2 leading-relaxed">
              {project.memo}
            </p>
          )}
        </div>

        <div className="relative flex-shrink-0">
          <ProgressRing progress={project.progress} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-warm-600">
            {project.progress}%
          </span>
        </div>
      </div>

      <div className="flex items-end mt-4">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {yarns.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-light text-rose-main">
              {yarns[0].name}
              {yarns.length > 1 && ` +${yarns.length - 1}`}
            </span>
          )}
          {needles.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-sky-light text-sky-main">
              {needles[0].type} {needles[0].size}
              {needles.length > 1 && ` +${needles.length - 1}`}
            </span>
          )}
          {project.difficulty > 1 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-accent-light text-accent">
              {difficultyLabel[project.difficulty]}
            </span>
          )}
          {counters.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-warm-100 text-warm-500 flex items-center gap-1">
              <Hash size={10} />
              {counters.length}
            </span>
          )}
          {attachments.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-warm-100 text-warm-500 flex items-center gap-1">
              <Paperclip size={10} />
              {attachments.length}
            </span>
          )}
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
            className="p-1.5 text-warm-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
