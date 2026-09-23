// app/api/weak-areas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getWeakAreas } from "@/lib/services/progress";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);

    const moduleId = req.nextUrl.searchParams.get("moduleId") ?? undefined;
    const areas = await getWeakAreas(decoded.uid, moduleId);

    return NextResponse.json({ areas });
  } catch (err) {
    console.error("Weak areas route error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}