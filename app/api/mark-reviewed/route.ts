// app/api/mark-reviewed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { updateWeakArea } from "@/lib/services/progress";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);

    const { topicId, moduleId, topic } = await req.json();
    if (!topicId || !moduleId || !topic) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newScore = await updateWeakArea({
      uid: decoded.uid,
      moduleId,
      topicId,
      topic,
      confidenceDelta: 15, // recovers meaningfully but doesn't jump to 100 instantly
    });

    return NextResponse.json({ newScore });
  } catch (err) {
    console.error("Mark reviewed error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}