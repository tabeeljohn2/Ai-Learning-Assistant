// app/modules/[moduleId]/page.tsx
"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useWeakAreas } from "@/lib/hooks/useWeakAreas";
import { useModuleProgress } from "@/lib/hooks/useModuleProgress";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ModuleChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  const { weakAreas, refresh } = useWeakAreas(user);
  const { progress, refresh: refreshProgress } = useModuleProgress(user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function markProgress(status: "in_progress" | "completed") {
    if (!user) return;
    const idToken = await user.getIdToken();
    await fetch("/api/module-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ moduleId, status }),
    });
    refreshProgress();
  }

  async function handleSend() {
    if (!user || !input.trim()) return;
    const userMessage = input.trim();
    const isFirstMessage = messages.length === 0;

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setSending(true);

    if (isFirstMessage) {
      markProgress("in_progress");
    }

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ message: userMessage, moduleId }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? data.error ?? "Something went wrong." },
      ]);
      refresh();
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error reaching tutor." }]);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="p-6 text-chalk">Loading...</p>;
  if (!user) return null;

  const moduleWeakAreas = weakAreas.filter((a) => a.moduleId === moduleId);
  const currentStatus = progress[moduleId]?.status ?? "not_started";

  return (
    <div className="min-h-screen bg-chalkboard flex flex-col">
      <header className="border-b border-chalk/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-chalk/60 hover:text-chalk transition">
          ← Back to modules
        </Link>
        {currentStatus === "completed" ? (
          <span className="text-xs text-gold font-medium">✓ Completed</span>
        ) : (
          <button
            onClick={() => markProgress("completed")}
            className="text-xs bg-gold text-ink px-3 py-1.5 rounded-sm hover:bg-goldDark transition"
          >
            Mark module complete
          </button>
        )}
      </header>

      <div className="flex-1 max-w-2xl w-full mx-auto p-6 flex flex-col overflow-hidden">
        {moduleWeakAreas.length > 0 && (
          <div className="mb-4 text-sm bg-clayTint border-l-4 border-clay rounded-sm p-3 text-ink">
            <span className="font-medium">Still reviewing:</span>{" "}
            {moduleWeakAreas.map((a) => a.topic).join(", ")}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          {messages.length === 0 && (
            <p className="font-hand text-xl text-chalk/50 -rotate-1">
              Ask your tutor anything to get started...
            </p>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div
                key={i}
                className="ml-auto max-w-[80%] bg-ink text-chalk rounded-sm p-4 whitespace-pre-wrap"
              >
                {m.content}
              </div>
            ) : (
              <div
                key={i}
                className="mr-auto max-w-[80%] bg-paper text-ink border-l-4 border-gold rounded-sm p-4 whitespace-pre-wrap"
              >
                {m.content}
              </div>
            )
          )}
          {sending && (
            <div className="text-chalk/40 text-sm font-hand text-lg">Tutor is thinking...</div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <textarea
            className="flex-1 bg-paper text-ink rounded-sm p-3 outline-none focus:ring-2 focus:ring-gold resize-none"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your question..."
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="bg-gold text-ink font-medium px-5 rounded-sm hover:bg-goldDark transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}