'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearAuthTokenCache } from "@/lib/fetchWithAuth";
import { clearGameDetailCache } from "@/lib/gameDetailCache";
import { invalidateListCache } from "@/lib/listCache";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

// Everything cached in the tab belongs to the signed-in user. Drop it whenever
// the user signs out or a different account signs in, otherwise the next user
// sees the previous user's games (and requests go out with the old token).
const clearUserCaches = () => {
  clearAuthTokenCache();
  invalidateListCache("games:");
  clearGameDetailCache();
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // `auth` is only null during server rendering, where effects never run.
    if (!auth) return;

    // undefined = no auth state seen yet in this tab.
    let lastUid: string | null | undefined;
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      const uid = currentUser?.uid ?? null;
      if (lastUid !== undefined && lastUid !== uid) {
        clearUserCaches();
      }
      lastUid = uid;
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
