'use client';

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!auth) {
        throw new Error("Firebase auth not initialized");
      }
      await signInWithEmailAndPassword(auth, email, password);
      const next = searchParams.get("next");
      router.push(next || "/");
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
      <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-12">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-sky-400/70">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white/90">
            Sign in
          </h1>
          <p className="mt-2 text-white/60">
            Continue tracking your games and progress.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
              />
            </label>

            {error && <p className="text-sm text-red-300">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-indigo-900/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/60">
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-sky-200 underline-offset-4 transition hover:text-sky-100 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
