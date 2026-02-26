"use client";

import { Project } from "@prisma/client";
import { YarnInfo, NeedleInfo, Attachment, StitchCounter } from "@/types/project";
import { Paperclip, MessageSquare } from "lucide-react";

interface ActiveProjectCardProps {
  project: Project;
  onClick: () => void;
}

function ProgressRing({
  progress,
  size = 52,
}: {
  progress: number;
  size?: number;
}) {
  const strokeWidth = 4;
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
        className="text-warm-200"
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
        className="text-rose-main transition-all duration-300"
      />
    </svg>
  );
}

const difficultyLabel = ["", "입문", "초급", "중급", "고급", "마스터"];

export default function ActiveProjectCard({
  project,
  onClick,
}: ActiveProjectCardProps) {
  const yarns = (project.yarns as unknown as YarnInfo[]) || [];
  const needles = (project.needles as unknown as NeedleInfo[]) || [];
  const attachments = (project.attachments as unknown as Attachment[]) || [];
  const counters = (project.counters as unknown as StitchCounter[]) || [];

  return (
    <div
      className="tape bg-postit-blue border border-blue-200 rounded-sm p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* 상단: 제목 + 진행률 */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {project.folder && (
            <span className="text-[10px] text-warm-400 block mb-0.5">
              {project.folder}
            </span>
          )}
          <h3 className="text-lg font-bold text-warm-800 truncate">
            {project.title}
          </h3>
          {project.memo && (
            <p className="text-sm text-warm-500 mt-1 line-clamp-2">
              {project.memo}
            </p>
          )}
        </div>

        <div className="relative flex-shrink-0">
          <ProgressRing progress={project.progress} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-warm-700">
            {project.progress}%
          </span>
        </div>
      </div>

      {/* 뱃지들 */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {yarns.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            {yarns[0].name}
            {yarns.length > 1 && ` +${yarns.length - 1}`}
          </span>
        )}
        {needles.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            {needles[0].type} {needles[0].size}
            {needles.length > 1 && ` +${needles.length - 1}`}
          </span>
        )}
        {project.difficulty > 1 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            {difficultyLabel[project.difficulty]}
          </span>
        )}
        {counters.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
            <MessageSquare size={10} />
            카운터 {counters.length}
          </span>
        )}
        {attachments.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
            <Paperclip size={10} />
            {attachments.length}
          </span>
        )}
      </div>
    </div>
  );
}
