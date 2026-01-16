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
    <div className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-slate-950/90 px-5 py-3 text-sm text-white shadow-2xl shadow-indigo-900/20 backdrop-blur-2xl">
      {loading ? (
        <span className="text-slate-300">Loading...</span>
      ) : user ? (
        <>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-indigo-300/70">
              Signed in
            </span>
            <span className="text-sm font-semibold text-white">
              {user.email}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-full border border-red-400/20 bg-gradient-to-r from-red-500/10 to-pink-500/10 px-4 py-2 font-semibold text-red-200 transition hover:border-red-400/40 hover:from-red-500/20 hover:to-pink-500/20 hover:shadow-lg hover:shadow-red-500/20"
          >
            Sign out
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/signin"
            className="rounded-full border border-indigo-400/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-4 py-2 font-semibold text-indigo-200 transition hover:border-indigo-400/50 hover:from-indigo-500/20 hover:to-purple-500/20 hover:shadow-lg hover:shadow-indigo-500/20"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 font-semibold text-white transition hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/30"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthBar;
