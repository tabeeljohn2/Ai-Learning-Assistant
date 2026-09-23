// app/api/lesson-plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { ai, AI_MODEL } from "@/lib/ai-client";
import { getModuleProgress, getWeakAreas } from "@/lib/services/progress";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const modulesSnap = await adminDb.collection("modules").orderBy("order", "asc").get();
    const modules = modulesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const progress = await getModuleProgress(uid);
    const weakAreas = await getWeakAreas(uid);

    const context = `
Modules (in order): ${modules
      .map((m: any) => `${m.id} ("${m.title}", prerequisites: ${m.prerequisiteModuleIds?.join(", ") || "none"})`)
      .join("; ")}

Learner's progress: ${JSON.stringify(progress)}

Learner's weak areas (lower confidenceScore = more struggle): ${JSON.stringify(
      weakAreas.map((a: any) => ({ topic: a.topic, moduleId: a.moduleId, confidenceScore: a.confidenceScore }))
    )}
`;

    const completion = await ai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a study planner for Internee.pk interns. Given a learner's module
progress and weak areas, write a short, encouraging personalized lesson plan —
3-4 sentences max. Recommend what to do next: which module to continue or start,
and whether to review a specific weak area first. Be specific, referencing actual
module titles and topic names from the data given.`,
        },
        { role: "user", content: context },
      ],
      temperature: 0.5,
    });

    const plan = completion.choices[0].message.content;
    return NextResponse.json({ plan });
  } catch (err) {
    console.error("Lesson plan error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}