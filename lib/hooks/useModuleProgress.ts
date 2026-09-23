// lib/hooks/useModuleProgress.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "firebase/auth";

export interface ModuleProgressMap {
  [moduleId: string]: {
    status: "not_started" | "in_progress" | "completed";
    startedAt?: any;
    completedAt?: any;
    attempts?: number;
  };
}

export function useModuleProgress(user: User | null) {
  const [progress, setProgress] = useState<ModuleProgressMap>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const idToken = await user.getIdToken();
    const res = await fetch("/api/module-progress", {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json();
    setProgress(data.progress ?? {});
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { progress, loading, refresh };
}