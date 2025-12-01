'use client';

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/authProvider";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const redirectTo = `/signin?next=${encodeURIComponent(pathname || "/")}`;
      router.replace(redirectTo);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a0f1f] via-[#0d152d] to-[#0a0f1f] text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white/70 shadow-lg shadow-black/30 backdrop-blur-xl">
          Checking access...
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
