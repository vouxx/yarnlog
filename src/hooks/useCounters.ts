"use client";

import { useState, useCallback } from "react";
import { StitchCounter } from "@/types/project";

export function useCounters(
  projectId: string,
  initialCounters: StitchCounter[],
  onUpdate?: (project: unknown) => void
) {
  const [counters, setCounters] = useState<StitchCounter[]>(initialCounters);

  const save = useCallback(
    async (updated: StitchCounter[]) => {
      setCounters(updated);
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counters: updated }),
      });
      const data = await res.json();
      onUpdate?.(data);
    },
    [projectId, onUpdate]
  );

  const addCounter = useCallback(
    (name: string) => {
      const finalName = name.trim() || `카운터 ${counters.length + 1}`;
      const updated = [
        ...counters,
        { id: crypto.randomUUID(), name: finalName, value: 0 },
      ];
      save(updated);
    },
    [counters, save]
  );

  const updateCount = useCallback(
    (id: string, delta: number) => {
      const updated = counters.map((c) =>
        c.id === id ? { ...c, value: Math.max(0, c.value + delta) } : c
      );
      save(updated);
    },
    [counters, save]
  );

  const removeCounter = useCallback(
    (id: string) => {
      save(counters.filter((c) => c.id !== id));
    },
    [counters, save]
  );

  return { counters, addCounter, updateCount, removeCounter };
}
