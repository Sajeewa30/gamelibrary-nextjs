"use client";

import { useEffect, useRef } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/components/authProvider";

const BASE_INTERVAL_MS = 5 * 60 * 1000;
const MAX_INTERVAL_MS = 30 * 60 * 1000;
const MAX_CONSECUTIVE_FAILURES = 6;
const PING_TIMEOUT_MS = 8_000;

/**
 * Pings the backend /health endpoint only while:
 *   - a user is signed in, AND
 *   - the tab is visible.
 *
 * Backs off exponentially on failure and stops entirely after
 * MAX_CONSECUTIVE_FAILURES so a crashed backend isn't hammered by every
 * open tab — which on a free plan just makes the crash loop worse.
 */
const KeepAlive = () => {
  const { user } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failuresRef = useRef(0);
  const disabledRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleNext = (delay: number) => {
      clearTimer();
      timerRef.current = setTimeout(run, delay);
    };

    const run = async () => {
      if (disabledRef.current) return;
      if (document.visibilityState !== "visible") {
        scheduleNext(BASE_INTERVAL_MS);
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
      try {
        const res = await fetch(`${API_BASE_URL}/health`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });
        if (res.ok) {
          failuresRef.current = 0;
          scheduleNext(BASE_INTERVAL_MS);
        } else {
          throw new Error(`Health ${res.status}`);
        }
      } catch {
        failuresRef.current += 1;
        if (failuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
          disabledRef.current = true;
          return;
        }
        const backoff = Math.min(
          BASE_INTERVAL_MS * 2 ** (failuresRef.current - 1),
          MAX_INTERVAL_MS
        );
        scheduleNext(backoff);
      } finally {
        clearTimeout(timeout);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !disabledRef.current) {
        scheduleNext(0);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    scheduleNext(0);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimer();
    };
  }, [user]);

  return null;
};

export default KeepAlive;
