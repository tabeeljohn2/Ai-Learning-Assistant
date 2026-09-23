// lib/hooks/useModules.ts
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  objectives: string[];
}

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      const q = query(collection(db, "modules"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      setModules(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Module)));
      setLoading(false);
    }
    fetchModules();
  }, []);

  return { modules, loading };
}