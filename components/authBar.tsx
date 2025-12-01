'use client';

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/authProvider";

const AuthBar = () => {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white shadow-lg shadow-black/30 backdrop-blur-xl">
      {loading ? (
        <span className="text-white/60">Loading...</span>
      ) : user ? (
        <>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-white/50">
              Signed in
            </span>
            <span className="text-sm font-semibold text-white">
              {user.email}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 font-semibold text-white transition hover:border-red-300/60 hover:bg-red-500/20"
          >
            Sign out
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/signin"
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 font-semibold text-white transition hover:border-sky-300/60 hover:bg-sky-500/20"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 font-semibold text-white transition hover:border-emerald-300/60 hover:bg-emerald-500/20"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthBar;
