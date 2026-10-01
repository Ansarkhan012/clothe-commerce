"use client";
import { useState } from "react";

// Removes Storage files of review photos that no longer belong to any review (discarded
// submissions, deleted products) and abandoned uploads. Never touches photos of existing reviews.
export function ReviewImageCleanup() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/admin/reviews/images/cleanup", { method: "POST" });
      const result = await response.json().catch(() => ({})) as { pruned?: number; removed?: number; failed?: number; message?: string };
      if (!response.ok) throw new Error(result.message || "Cleanup failed");
      setMessage(result.removed || result.pruned ? `Removed ${result.removed ?? 0} orphaned photo file set(s); pruned ${result.pruned ?? 0} abandoned upload(s).${result.failed ? ` ${result.failed} will be retried.` : ""}` : "No orphaned photos found.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Cleanup failed");
    } finally { setBusy(false); }
  }

  return <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
    <button type="button" onClick={() => void run()} disabled={busy} className="min-h-9 rounded border border-[#D8DADF] bg-white px-3 font-medium disabled:opacity-50">{busy ? "Cleaning up…" : "Clean up orphaned review photos"}</button>
    {message && <p role="status" className="text-[#6B7280]">{message}</p>}
  </div>;
}
