'use client';

import { useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

const KEEPALIVE_INTERVAL_MS = 5 * 60 * 1000;

const pingBackend = async () => {
  try {
    await fetch(`${API_BASE_URL}/health`, { method: "GET" });
  } catch {
    // Ignore keepalive failures.
  }
};

const KeepAlive = () => {
  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, KEEPALIVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
};

export default KeepAlive;
