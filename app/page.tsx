// app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

const MODULES = [
  { id: "react-hooks", title: "React Hooks Fundamentals" },
  { id: "css-fundamentals", title: "CSS Fundamentals" },
  { id: "javascript-basics", title: "JavaScript Basics" },
];

const TESTIMONIALS = [
  { quote: "I finally understood useEffect cleanup after one real conversation about it.", name: "Ayesha, Frontend Intern" },
  { quote: "It noticed I kept messing up flexbox before I'd noticed the pattern myself.", name: "Bilal, Web Intern" },
  { quote: "Feels like having a mentor on call, not just a chatbot answering once.", name: "Hina, JS Intern" },
];

const STEPS = [
  {
    number: "1",
    title: "Ask, anytime",
    description: "Chat with a tutor scoped to your current module — no wading through docs to find the one thing you're stuck on.",
  },
  {
    number: "2",
    title: "It remembers what trips you up",
    description: "Every conversation is quietly analyzed. Struggle with the same concept twice, and the assistant notices.",
  },
  {
    number: "3",
    title: "Review what actually needs it",
    description: "Your dashboard surfaces exactly the topics you're shakiest on — not a generic checklist everyone gets.",
  },
];

export default function LandingPage() {
  const [selectedModule, setSelectedModule] = useState(MODULES[0].id);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  function prevTestimonial() {
    setActiveTestimonial((i) => (i === 0 ? TESTIMONIALS.length - 1 : i - 1));
  }
  function nextTestimonial() {
    setActiveTestimonial((i) => (i === TESTIMONIALS.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="bg-chalkboard">
      {/* ---------- HERO ---------- */}
      <div className="relative overflow-hidden bg-linear-to-br from-chalkboardLight to-chalkboard">
        {/* decorative glow blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-dustBlue/10 blur-3xl" />

        {/* nav */}
                <nav className="relative flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
          <span className="font-hand text-2xl text-gold -rotate-1">Internee.pk Tutor</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login?mode=login"
              className="text-sm text-chalk/70 hover:text-chalk transition px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/login?mode=signup"
              className="text-sm bg-gold text-ink font-medium px-5 py-2 rounded-full hover:bg-goldDark transition"
            >
              Get started
            </Link>
          </div>
        </nav>

        {/* hero content */}
        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-dustBlue text-sm mb-4">A personalized learning assistant</p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-chalk leading-tight">
              Learn to code with a tutor that remembers you
            </h1>
            <p className="text-chalk/60 text-lg mt-6 max-w-md">
              Ask questions scoped to what you're actually learning. It tracks
              where you're struggling, so review time goes toward what
              matters — not everything.
            </p>

            {/* module picker row */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 max-w-lg">
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="flex-1 bg-paper text-ink rounded-sm px-4 py-3 outline-none focus:ring-2 focus:ring-gold"
              >
                {MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
                            <Link
                href="/login?mode=signup"
                className="bg-gold text-ink font-medium px-6 py-3 rounded-sm hover:bg-goldDark transition text-center"
              >
                Start learning
              </Link>
            </div>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-chalk border border-chalk/30 hover:border-chalk/70 hover:bg-chalk/5 px-5 py-2.5 rounded-sm transition"
            >
              <span>See how it works</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>

            {/* testimonial carousel */}
            <div className="mt-12 max-w-md">
              {/* quote block */}
              <div className="min-h-20">
                <p className="text-chalk/80 italic">"{TESTIMONIALS[activeTestimonial].quote}"</p>
                <p className="text-chalk/40 text-sm mt-2">{TESTIMONIALS[activeTestimonial].name}</p>
              </div>
              {/* controls: prev | dots | next — laid out so dots sit visually centred */}
              <div className="flex items-center gap-4 mt-5">
                <button
                  onClick={prevTestimonial}
                  aria-label="Previous testimonial"
                  className="w-11 h-11 rounded-full border border-chalk/20 text-chalk/60 hover:border-gold hover:text-gold transition flex items-center justify-center text-lg leading-none shrink-0"
                >
                  ‹
                </button>
                {/* dots centred between the two arrows */}
                <div className="flex-1 flex items-center justify-center gap-2">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      aria-label={`Go to testimonial ${i + 1}`}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === activeTestimonial ? "bg-gold scale-125" : "bg-chalk/20 hover:bg-chalk/40"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextTestimonial}
                  aria-label="Next testimonial"
                  className="w-11 h-11 rounded-full border border-chalk/20 text-chalk/60 hover:border-gold hover:text-gold transition flex items-center justify-center text-lg leading-none shrink-0"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* chat mockup illustration */}
          <div className="hidden md:flex justify-center">
            <div className="bg-paper rounded-lg shadow-2xl w-80 p-4 rotate-2">
              <div className="flex gap-1.5 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-clay/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-gold/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-dustBlue/60" />
              </div>
              <div className="space-y-2">
                <div className="ml-auto max-w-[75%] bg-ink text-chalk text-xs rounded-sm p-2">
                  Why does useEffect need cleanup?
                </div>
                <div className="max-w-[80%] bg-paperDark border-l-2 border-gold text-ink text-xs rounded-sm p-2">
                  Great question — it prevents memory leaks when...
                </div>
                <div className="ml-auto max-w-[60%] bg-ink text-chalk text-xs rounded-sm p-2">
                  Oh that makes sense now
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* wave divider */}
        <svg
          className="absolute bottom-0 left-0 w-full text-chalkboard"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,60 C240,110 480,10 720,40 C960,70 1200,20 1440,50 L1440,100 L0,100 Z"
          />
        </svg>
      </div>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-chalk mb-12 text-center">
            How it works
          </h2>
          <div className="space-y-10">
            {STEPS.map((step) => (
              <div key={step.number} className="flex gap-5">
                <span className="font-mono text-gold text-xl shrink-0 w-8">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-chalk">{step.title}</h3>
                  <p className="text-chalk/60 mt-1 max-w-md">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- MODULE PREVIEW ---------- */}
      <section className="px-6 py-20 border-t border-chalk/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-semibold text-chalk mb-8 text-center">
            Start with a module
          </h2>
          <div className="space-y-3">
            {[
              { icon: "{ }", title: "React Hooks Fundamentals", description: "useState, useEffect, and building your own hooks." },
              { icon: "#", title: "CSS Fundamentals", description: "Flexbox, grid, and responsive layouts that actually work." },
              { icon: "()", title: "JavaScript Basics", description: "Variables, functions, and array methods you'll use daily." },
            ].map((mod) => (
              <div
                key={mod.title}
                role="button"
                tabIndex={0}
                aria-label={`Start ${mod.title}`}
                onClick={() => { window.location.href = "/login?mode=signup"; }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") window.location.href = "/login?mode=signup"; }}
                className="flex items-center gap-4 bg-paper rounded-sm p-5 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all group"
              >
                <span className="font-mono text-gold text-lg shrink-0">{mod.icon}</span>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-ink">{mod.title}</h3>
                  <p className="text-sm text-ink/60 mt-0.5">{mod.description}</p>
                </div>
                {/* chevron — affordance signal */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-ink/30 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-chalk/10 text-center">
        <p className="text-chalk/40 text-sm">Built for Internee.pk interns.</p>
      </footer>
    </div>
  );
}