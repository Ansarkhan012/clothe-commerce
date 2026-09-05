"use client";

export default function AdminError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <div className="mx-auto max-w-xl rounded-lg border border-[#E5E7EB] bg-white p-8 text-center"><h2 className="text-xl font-semibold">Admin data is unavailable</h2><p className="mt-2 text-sm text-[#6B7280]">Check the database connection and required migrations, then try again.</p><button type="button" onClick={unstable_retry} className="mt-5 rounded-md bg-[#1A1A1A] px-5 py-2.5 text-sm font-medium text-white">Try again</button></div>;
}
