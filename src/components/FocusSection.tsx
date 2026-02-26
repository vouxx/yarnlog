"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FocusSectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  accentColor?: string;
}

export default function FocusSection({
  title,
  count,
  children,
  defaultCollapsed = false,
  accentColor = "bg-warm-200 text-warm-700",
}: FocusSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-3 group"
      >
        <h2
          className={`masking-tape font-bold text-sm px-2 py-1 rounded-sm ${accentColor}`}
        >
          {title}
        </h2>
        <span className="text-xs text-warm-400">{count}</span>
        <span className="text-warm-400 group-hover:text-warm-600 transition-colors">
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </span>
      </button>

      {!collapsed && children}
    </section>
  );
}
