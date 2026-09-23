// app/api/test-weak-area/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { updateWeakArea } from "@/lib/services/progress";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.replace("Bearer ", "");
  const decoded = await adminAuth.verifyIdToken(idToken);

  const result = await updateWeakArea({
    uid: decoded.uid,
    moduleId: "react-hooks",
    topicId: "useeffect-cleanup",
    topic: "useEffect cleanup",
    confidenceDelta: -10,
  });

  return NextResponse.json({ newScore: result });
}