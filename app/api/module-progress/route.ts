// app/api/module-progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getModuleProgress, updateModuleProgress, ModuleStatus } from "@/lib/services/progress";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);

    const progress = await getModuleProgress(decoded.uid);
    return NextResponse.json({ progress });
  } catch (err) {
    console.error("Module progress GET error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);

    const { moduleId, status } = await req.json();
    if (!moduleId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await updateModuleProgress({
      uid: decoded.uid,
      moduleId,
      status: status as ModuleStatus,
    });

    return NextResponse.json({ progress: result });
  } catch (err) {
    console.error("Module progress POST error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}