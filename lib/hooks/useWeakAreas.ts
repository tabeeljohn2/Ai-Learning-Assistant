// lib/hooks/useWeakAreas.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "firebase/auth";

export interface WeakArea {
  id: string;
  topic: string;
  moduleId: string;
  confidenceScore: number;
  reviewCount: number;
}

export function useWeakAreas(user: User | null) {
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const idToken = await user.getIdToken();
    const res = await fetch("/api/weak-areas", {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json();
    setWeakAreas(data.areas ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { weakAreas, loading, refresh };
}