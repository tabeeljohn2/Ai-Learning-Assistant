// app/api/tutor/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function POST(req: NextRequest) {
  try {
    // 1. Verify the caller's identity
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const { message, moduleId } = await req.json();
    if (!message || !moduleId) {
      return NextResponse.json({ error: "Missing message or moduleId" }, { status: 400 });
    }

    // 2. Fetch module info from Firestore
    const moduleSnap = await adminDb.collection("modules").doc(moduleId).get();
    if (!moduleSnap.exists) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }
    const moduleData = moduleSnap.data()!;

    // 3. Build a scoped system prompt
    const systemPrompt = `You are the Internee.pk Tutor for the module "${moduleData.title}".
Description: ${moduleData.description}
Learning objectives: ${moduleData.objectives.join(", ")}

STRICT RULE: You must NEVER answer, explain, or provide any factual information
about topics outside this module's scope — not even briefly, not even as a
courtesy before redirecting. If the learner asks something unrelated to this
module (general knowledge, other subjects, personal questions, etc.), your
ENTIRE response must be a brief, friendly redirect — nothing else. For example:
"That's outside what we're covering in this module! Let's get back to [topic] —
[a relevant follow-up question]."

Do not include any part of an actual answer to the off-topic question, even one sentence.

For on-topic questions, keep answers clear, encouraging, and beginner-friendly.`;

    // 4. Call the AI for the tutor reply
    const completion = await openai.chat.completions.create({
      model: "gemini-3.5-flash-lite",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.4,
    });

    const reply = completion.choices[0].message.content;

    // 5. Extract weak-area signal (best-effort — won't break the route if this fails)
    try {
      const extraction = await openai.chat.completions.create({
  model: "gemini-3.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Analyze the learner's message and the tutor's reply. If the learner
showed confusion or a mistake about a specific concept, respond ONLY with JSON:
{"topic": "short topic name", "confidenceDelta": -10}
If they showed understanding, respond ONLY with:
{"topic": "short topic name", "confidenceDelta": 5}
If nothing conclusive, respond ONLY with:
{"topic": null, "confidenceDelta": 0}
No other text.`,
          },
          { role: "user", content: `Learner: ${message}\nTutor: ${reply}` },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(extraction.choices[0].message.content ?? "{}");

      if (parsed.topic) {
        const { updateWeakArea } = await import("@/lib/services/progress");
        const topicId = parsed.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await updateWeakArea({
          uid,
          moduleId,
          topicId,
          topic: parsed.topic,
          confidenceDelta: parsed.confidenceDelta ?? 0,
        });
      }
    } catch (extractionError) {
      console.error("Weak-area extraction failed (non-blocking):", extractionError);
    }

    // 6. Return the tutor's reply to the client
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Tutor route error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}