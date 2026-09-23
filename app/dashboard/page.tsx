// app/dashboard/page.tsx
"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useModules } from "@/lib/hooks/useModules";
import { useWeakAreas } from "@/lib/hooks/useWeakAreas";
import { useModuleProgress } from "@/lib/hooks/useModuleProgress";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ModuleCardSkeleton, WeakAreaSkeleton } from "@/components/Skeleton";

const MODULE_ICONS: Record<string, string> = {
  "react-hooks": "{ }",
  "css-fundamentals": "#",
  "javascript-basics": "()",
};

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { modules, loading: modulesLoading } = useModules();
  const { weakAreas, loading: weakAreasLoading, refresh } = useWeakAreas(user);
  const { progress, loading: progressLoading } = useModuleProgress(user);
  const router = useRouter();

  const [plan, setPlan] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading) return <p className="p-6 text-chalk">Loading...</p>;
  if (!user) return null;

  const lowConfidenceAreas = weakAreas.filter((a) => a.confidenceScore < 60);

  const recommendedModuleId = modules.find((mod: any) => {
    const status = progress[mod.id]?.status ?? "not_started";
    if (status === "completed") return false;
    const prereqs: string[] = mod.prerequisiteModuleIds ?? [];
    return prereqs.every((p) => progress[p]?.status === "completed");
  })?.id;

  async function generatePlan() {
    if (!user) return;
    setPlanLoading(true);
    const idToken = await user.getIdToken();
    const res = await fetch("/api/lesson-plan", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const data = await res.json();
    setPlan(data.plan ?? data.error ?? "Couldn't generate a plan right now.");
    setPlanLoading(false);
  }

  return (
    <div className="min-h-screen bg-chalkboard">
      <header className="border-b border-chalk/10 px-6 py-5">
        <p className="font-hand text-2xl text-gold -rotate-1">Internee.pk Tutor</p>
        <p className="text-chalk/60 text-sm mt-1">Signed in as {user.email}</p>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-chalk">
            Pick up where you left off
          </h1>
          <p className="text-chalk/60 mt-1">Choose a module to continue learning.</p>
        </div>

        {/* AI Lesson Plan */}
        <div className="bg-chalkboardLight border border-chalk/10 rounded-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-semibold text-chalk">Your plan</h2>
            <button
              onClick={generatePlan}
              disabled={planLoading}
              className="text-xs bg-gold text-ink px-3 py-1.5 rounded-sm hover:bg-goldDark transition disabled:opacity-50"
            >
              {planLoading ? "Thinking..." : plan ? "Refresh" : "Generate my plan"}
            </button>
          </div>
          {plan ? (
            <p className="text-chalk/70 text-sm leading-relaxed">{plan}</p>
          ) : (
            <p className="text-chalk/40 text-sm">
              Get a personalized recommendation based on your progress and weak areas.
            </p>
          )}
        </div>

        {weakAreasLoading && <WeakAreaSkeleton />}

        {!weakAreasLoading && lowConfidenceAreas.length > 0 && (
          <div className="bg-chalkboardLight border border-chalk/10 rounded-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-chalk">Areas to review</h2>
            </div>
            <ul className="space-y-2">
              {lowConfidenceAreas.map((area) => (
                <li key={area.id} className="flex items-center gap-2 text-sm">
                  <span className="text-chalk flex-1 min-w-0 truncate">{area.topic}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-chalk/50 text-xs">{area.confidenceScore}%</span>
                    <button
                      onClick={async () => {
                        if (!user) return;
                        const idToken = await user.getIdToken();
                        await fetch("/api/mark-reviewed", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${idToken}`,
                          },
                          body: JSON.stringify({
                            topicId: area.id,
                            moduleId: area.moduleId,
                            topic: area.topic,
                          }),
                        });
                        refresh();
                      }}
                      className="text-xs bg-ink text-chalk px-3 py-1.5 rounded-sm hover:bg-ink/90 transition"
                    >
                      Mark reviewed
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          {(modulesLoading || progressLoading) && (
            <>
              <ModuleCardSkeleton />
              <ModuleCardSkeleton />
              <ModuleCardSkeleton />
            </>
          )}
          {modules.map((mod: any) => {
            const status = progress[mod.id]?.status ?? "not_started";
            const isRecommended = mod.id === recommendedModuleId;
            return (
              <Link
                key={mod.id}
                href={`/modules/${mod.id}`}
                className="flex items-start gap-4 bg-paper rounded-sm p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all relative"
              >
                <span className="font-mono text-gold text-lg shrink-0 mt-0.5 w-8 text-center">
                  {MODULE_ICONS[mod.id] ?? "•"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-ink">{mod.title}</h3>
                    {isRecommended && (
                      <span className="text-[10px] tracking-wide bg-gold/20 text-goldDark px-2 py-0.5 rounded-full">
                        Recommended next
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink/60 mt-0.5">{mod.description}</p>
                  <span
                    className={`text-xs mt-2 inline-block ${
                      status === "completed"
                        ? "text-dustBlue"
                        : status === "in_progress"
                        ? "text-gold"
                        : "text-ink/30"
                    }`}
                  >
                    {status === "completed" && "✓ "}
                    {STATUS_LABEL[status]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}