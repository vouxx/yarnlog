"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  accentColor = "text-warm-600",
}: FocusSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2.5 mb-4 group"
      >
        <h2 className={`text-lg font-semibold tracking-tight ${accentColor}`}>
          {title}
        </h2>
        <span className="text-xs text-warm-300 bg-warm-100 px-2 py-0.5 rounded-full">
          {count}
        </span>
        <span className="text-warm-300 group-hover:text-warm-500 transition-colors">
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {!collapsed && children}
    </section>
  );
}
