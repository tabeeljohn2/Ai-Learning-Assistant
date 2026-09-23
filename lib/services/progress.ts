// lib/services/progress.ts
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface WeakAreaUpdate {
  uid: string;
  moduleId: string;
  topicId: string;
  topic: string;
  confidenceDelta: number;
}

export async function updateWeakArea({
  uid,
  moduleId,
  topicId,
  topic,
  confidenceDelta,
}: WeakAreaUpdate) {
  const ref = adminDb
    .collection("users").doc(uid)
    .collection("weakAreas").doc(topicId);

  const snap = await ref.get();
  const current = snap.exists ? snap.data()!.confidenceScore : 50;
  const nextScore = Math.max(0, Math.min(100, current + confidenceDelta));

  await ref.set(
    {
      topic,
      moduleId,
      confidenceScore: nextScore,
      lastReviewedAt: FieldValue.serverTimestamp(),
      reviewCount: FieldValue.increment(1),
    },
    { merge: true }
  );

  return nextScore;
}

export async function getWeakAreas(uid: string, moduleId?: string) {
  const query = adminDb
    .collection("users").doc(uid).collection("weakAreas")
    .orderBy("confidenceScore", "asc");

  const snap = await query.get();
  const areas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return moduleId ? areas.filter((a: any) => a.moduleId === moduleId) : areas;
}

// ---- Module progress ----

export type ModuleStatus = "not_started" | "in_progress" | "completed";

interface ModuleProgressUpdate {
  uid: string;
  moduleId: string;
  status: ModuleStatus;
}

export async function updateModuleProgress({ uid, moduleId, status }: ModuleProgressUpdate) {
  const ref = adminDb.collection("users").doc(uid).collection("modules").doc(moduleId);
  const snap = await ref.get();

  const updates: Record<string, unknown> = { status, attempts: FieldValue.increment(1) };

  if (status === "in_progress" && (!snap.exists || !snap.data()?.startedAt)) {
    updates.startedAt = FieldValue.serverTimestamp();
  }
  if (status === "completed") {
    updates.completedAt = FieldValue.serverTimestamp();
  }

  await ref.set(updates, { merge: true });

  const updated = await ref.get();
  return updated.data();
}

export async function getModuleProgress(uid: string) {
  const snap = await adminDb.collection("users").doc(uid).collection("modules").get();
  const progress: Record<string, any> = {};
  snap.docs.forEach((d) => {
    progress[d.id] = d.data();
  });
  return progress;
}