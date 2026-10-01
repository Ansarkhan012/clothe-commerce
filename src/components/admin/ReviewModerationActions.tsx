"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReviewStatus } from "@/src/lib/validations/review";

const actions: { status: ReviewStatus; label: string; className: string; showWhen: ReviewStatus[] }[] = [
  { status: "approved", label: "Approve", className: "bg-emerald-700 text-white", showWhen: ["pending", "rejected", "hidden"] },
  { status: "rejected", label: "Reject", className: "border border-red-300 text-red-700", showWhen: ["pending"] },
  { status: "hidden", label: "Hide", className: "border border-amber-300 text-amber-800", showWhen: ["approved"] },
];

export function ReviewModerationActions({ id, status }: { id: string; status: ReviewStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function moderate(next: ReviewStatus) {
    setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Unable to update review");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update review");
    } finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Unable to delete review");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete review");
      setConfirming(false);
    } finally { setBusy(false); }
  }

  return <div className="flex flex-wrap items-center gap-2">
    {actions.filter((action) => action.showWhen.includes(status)).map((action) =>
      <button key={action.status} type="button" disabled={busy} onClick={() => void moderate(action.status)} className={`min-h-9 rounded px-3 text-xs font-medium disabled:opacity-50 ${action.className}`}>{action.label}</button>)}
    <span className="mx-1 h-5 w-px bg-[#D8DADF]" aria-hidden="true" />
    {confirming
      ? <span role="group" aria-label="Confirm permanent deletion" className="flex flex-wrap items-center gap-2 rounded border border-red-300 bg-red-50 px-2 py-1">
        <span className="text-xs font-medium text-red-800">Permanently delete this review and its photos? This cannot be undone.</span>
        <button type="button" disabled={busy} onClick={() => void remove()} className="min-h-9 rounded bg-red-700 px-3 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Deleting…" : "Delete permanently"}</button>
        <button type="button" disabled={busy} onClick={() => setConfirming(false)} autoFocus className="min-h-9 rounded border border-[#D8DADF] bg-white px-3 text-xs font-medium disabled:opacity-50">Keep review</button>
      </span>
      : <button type="button" disabled={busy} onClick={() => setConfirming(true)} className="min-h-9 rounded border border-red-700 px-3 text-xs font-semibold text-red-700 disabled:opacity-50">Delete</button>}
    {error && <p role="alert" className="w-full text-xs text-red-700">{error}</p>}
  </div>;
}
