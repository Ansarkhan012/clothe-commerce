"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function ProductActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dialogRef.current?.open) cancelRef.current?.focus();
  }, [blocked]);

  function close() {
    if (busy) return;
    dialogRef.current?.close();
    setBlocked(false);
    setError(null);
  }

  function open() {
    dialogRef.current?.showModal();
    requestAnimationFrame(() => cancelRef.current?.focus());
  }

  function finish(notice: "deleted" | "archived") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("notice", notice);
    dialogRef.current?.close();
    router.replace(`${pathname}?${params.toString()}`);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({})) as { message?: string; referenced?: boolean };
      if (response.status === 409 && result.referenced) {
        setBlocked(true);
        setError(result.message ?? "This product belongs to order history and cannot be permanently deleted.");
        return;
      }
      if (!response.ok) {
        const fallback = response.status === 401 || response.status === 403
          ? "Your admin session is no longer authorized. Please sign in again."
          : "The product could not be deleted. Please try again.";
        throw new Error(result.message ?? fallback);
      }
      finish("deleted");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete product");
    } finally {
      setBusy(false);
    }
  }

  async function archive() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Unable to archive product");
      finish("archived");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to archive product");
    } finally {
      setBusy(false);
    }
  }

  return <div className="inline-flex items-center gap-3">
    <Link href={`/product/${id}`} className="text-[#6B7280]">View</Link>
    <Link href={`/admin/products/${id}/edit`} className="font-medium text-[#7A5B22]">Edit</Link>
    <button type="button" onClick={open} className="font-medium text-red-700 hover:text-red-800">Delete</button>
    <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); close(); }} aria-labelledby={`delete-title-${id}`} className="m-auto w-[min(92vw,30rem)] rounded-lg border border-[#E5E7EB] bg-white p-0 shadow-2xl backdrop:bg-black/50">
      <div className="p-6">
        <h2 id={`delete-title-${id}`} className="text-xl font-semibold">Delete this product?</h2>
        <p className="mt-2 text-sm text-[#6B7280]">{blocked ? `“${title}” has historical orders and cannot be permanently deleted. Archive it to remove it from the storefront while preserving order history.` : `“${title}” and its product-only details and variants will be permanently deleted.`}</p>
        {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={close} disabled={busy} className="min-h-10 rounded border px-4 disabled:opacity-50">Cancel</button>
          {blocked
            ? <button type="button" onClick={() => void archive()} disabled={busy} className="min-h-10 rounded bg-amber-700 px-4 font-medium text-white disabled:opacity-50">{busy ? "Archiving…" : "Archive / Deactivate"}</button>
            : <button type="button" onClick={() => void remove()} disabled={busy} className="min-h-10 rounded bg-red-700 px-4 font-medium text-white disabled:opacity-50">{busy ? "Deleting…" : "Delete permanently"}</button>}
        </div>
      </div>
    </dialog>
  </div>;
}
