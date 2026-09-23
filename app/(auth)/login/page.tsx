// app/(auth)/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase-client";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signup" || modeParam === "login") {
      setMode(modeParam);
    }
  }, [searchParams]);

  async function ensureUserDoc(uid: string, userEmail: string | null) {
    await setDoc(
      doc(db, "users", uid),
      {
        email: userEmail,
        role: "intern",
        track: "Unassigned",
        lastActiveAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          role: "intern",
          track: "Unassigned",
          createdAt: serverTimestamp(),
          lastActiveAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureUserDoc(cred.user.uid, cred.user.email);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-chalkboard flex flex-col items-center justify-center px-4 py-12">
      <p className="font-hand text-3xl text-chalk/80 mb-6 -rotate-1">
        Internee.pk Tutor
      </p>

      <div className="relative w-full max-w-3xl min-h-[480px] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Hero / switch-side panel */}
        <div
          key={`hero-${mode}`}
          className="hidden md:flex md:w-1/2 flex-col items-center justify-center gap-4 p-10 text-center bg-gradient-to-br from-chalkboardLight to-chalkboard text-chalk animate-slide-fade order-2 md:order-none"
          style={{ order: mode === "login" ? 2 : 0 }}
        >
          {mode === "login" ? (
            <>
              <h2 className="font-display text-2xl font-semibold">New here?</h2>
              <p className="text-chalk/70 max-w-xs">
                Create an account and your tutor starts learning what you
                struggle with from day one.
              </p>
              <button
                onClick={() => setMode("signup")}
                className="border border-chalk/40 text-chalk px-6 py-2.5 rounded-sm hover:bg-chalk/10 transition text-sm font-medium tracking-wide"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl font-semibold">Welcome back</h2>
              <p className="text-chalk/70 max-w-xs">
                Log in to pick up where you left off and review what needs it.
              </p>
              <button
                onClick={() => setMode("login")}
                className="border border-chalk/40 text-chalk px-6 py-2.5 rounded-sm hover:bg-chalk/10 transition text-sm font-medium tracking-wide"
              >
                Log In
              </button>
            </>
          )}
        </div>

        {/* Form panel */}
        <div
          key={`form-${mode}`}
          className="w-full md:w-1/2 bg-paper p-8 sm:p-10 flex flex-col items-center justify-center gap-5 animate-slide-fade"
        >
          <h1 className="font-display text-4xl font-semibold text-ink text-center w-full">
            {mode === "login" ? "Log in" : "Sign up"}
          </h1>

          <div className="w-full">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              aria-label="Continue with Google"
              className="w-full flex items-center justify-center gap-3 border border-ink/20 rounded-sm py-3 px-4 hover:border-gold hover:bg-gold/5 transition text-sm font-medium text-ink"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-3 w-full my-3">
            <hr className="flex-1 border-ink/15" />
            <p className="text-xs text-ink/40 whitespace-nowrap">Or use your email address</p>
            <hr className="flex-1 border-ink/15" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-medium text-ink/60 uppercase tracking-wide">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-ink/20 bg-transparent p-3 rounded-sm text-ink placeholder:text-ink/30 focus:border-gold outline-none transition"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-medium text-ink/60 uppercase tracking-wide">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-ink/20 bg-transparent p-3 rounded-sm text-ink placeholder:text-ink/30 focus:border-gold outline-none transition"
                required
              />
            </div>

            {error && <p className="text-clay text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-ink text-chalk font-medium py-3 rounded-sm hover:bg-ink/90 transition tracking-wide"
            >
              {mode === "login" ? "Log In" : "Sign Up"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="md:hidden text-sm text-dustBlue hover:text-ink transition underline underline-offset-2"
          >
            {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}