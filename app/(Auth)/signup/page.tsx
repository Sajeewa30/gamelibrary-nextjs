'use client';

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
      <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-12">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-400/70">
            Join in
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white/90">
            Create an account
          </h1>
          <p className="mt-2 text-white/60">
            Save progress and unlock your personal game tracker.
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
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-white/70">
              Confirm password
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
              />
            </label>

            {error && <p className="text-sm text-red-300">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:translate-y-[-1px] hover:shadow-xl hover:shadow-emerald-900/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-semibold text-emerald-200 underline-offset-4 transition hover:text-emerald-100 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
