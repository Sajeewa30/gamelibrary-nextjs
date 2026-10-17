"use client";

import { useEffect, useState } from "react";
import { fetchDriveBackupStatus, startDriveBackup, type BackupStatus } from "@/lib/gameApi";

const POLL_MS = 1500;

const formatBytes = (n = 0) => {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`;
};

const formatWhen = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

/** "Back up to Google Drive" button with live progress, shown on the Stats page. */
const DriveBackupCard = () => {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const running = status?.state === "running";

  // Load the last result, then keep polling while a backup is running.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = () => {
      fetchDriveBackupStatus()
        .then((s) => {
          if (cancelled) return;
          setStatus(s);
          setError(null);
          if (s.state === "running") timer = setTimeout(poll, POLL_MS);
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load the backup status.");
        });
    };
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [running]);

  const handleBackup = async () => {
    setStarting(true);
    setError(null);
    try {
      setStatus(await startDriveBackup());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the backup.");
    } finally {
      setStarting(false);
    }
  };

  const percent =
    running && status?.bytesTotal ? Math.min(100, ((status.bytesDone ?? 0) / status.bytesTotal) * 100) : 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Google Drive backup</h2>
          <p className="mt-1 text-sm text-white/60">
            Copies new and changed images, videos and your game data to Google Drive. Drive mirrors the
            library exactly: anything you deleted here is removed from it too.
          </p>
        </div>
        <button
          onClick={handleBackup}
          disabled={running || starting}
          className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-900/40 transition hover:shadow-lg hover:shadow-indigo-900/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? "Backing up..." : starting ? "Starting..." : "Back up to Google Drive"}
        </button>
      </div>

      <div className="mt-4 text-sm" aria-live="polite">
        {running ? (
          <div className="space-y-2">
            <p className="text-white/80">
              {status?.step ?? "Working"}
              {status?.bytesTotal
                ? ` · ${formatBytes(status.bytesDone)} of ${formatBytes(status.bytesTotal)}` +
                  (status.filesTotal ? ` · ${status.filesDone ?? 0}/${status.filesTotal} files` : "")
                : ""}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-xs text-white/50">You can leave this page; the backup keeps running.</p>
          </div>
        ) : status?.state === "success" ? (
          <p className="text-emerald-200">
            Last backup: {formatWhen(status.finishedAt)} · {status.message}
            {status.bytesUploaded ? ` (${formatBytes(status.bytesUploaded)})` : ""}
          </p>
        ) : status?.state === "failed" ? (
          <p role="alert" className="text-red-200">
            Last backup failed{status.finishedAt ? ` (${formatWhen(status.finishedAt)})` : ""}: {status.message}
          </p>
        ) : status?.state === "never" ? (
          <p className="text-white/60">No backup yet. The first one uploads everything, so it takes a while.</p>
        ) : null}
        {error && (
          <p role="alert" className="mt-2 text-red-200">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default DriveBackupCard;
