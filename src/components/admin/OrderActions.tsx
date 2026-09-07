"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const deletableStatuses = new Set(["cancelled", "delivered"]);

export function OrderActions({ id, reference, status, onDeleted }: { id: string; reference: string; status: string; onDeleted: (id: string) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const requestInFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canDelete = deletableStatuses.has(status);

  function open() {
    setError("");
    dialogRef.current?.showModal();
    requestAnimationFrame(() => cancelRef.current?.focus());
  }

  function close() {
    if (!busy) dialogRef.current?.close();
  }

  async function remove() {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Unable to delete order");
      dialogRef.current?.close();
      onDeleted(id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete order");
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  return <div className="inline-flex items-center gap-3">
    <Link href={`/admin/orders/${id}`} className="font-medium text-[#7A5B22]">Manage</Link>
    {canDelete && <button type="button" onClick={open} className="font-medium text-red-700 hover:text-red-800">Delete</button>}
    {canDelete && <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); close(); }} aria-labelledby={`delete-order-${id}`} className="m-auto w-[min(92vw,30rem)] rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-2xl backdrop:bg-black/50">
      <div className="p-6">
        <h2 id={`delete-order-${id}`} className="text-xl font-semibold">Delete this order?</h2>
        <p className="mt-2 text-sm text-[#6B7280]">This permanently removes completed order {reference} and its history. Inventory will not be changed.</p>
        {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={close} disabled={busy} className="min-h-10 rounded border px-4 disabled:opacity-50">Cancel</button>
          <button type="button" onClick={() => void remove()} disabled={busy} className="min-h-10 rounded bg-red-700 px-4 font-medium text-white disabled:opacity-50">{busy ? "Deleting…" : "Delete permanently"}</button>
        </div>
      </div>
    </dialog>}
  </div>;
}
