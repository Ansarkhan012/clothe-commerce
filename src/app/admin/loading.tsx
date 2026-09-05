export default function AdminLoading() {
  return <div className="mx-auto max-w-[1500px] animate-pulse space-y-5" aria-label="Loading admin data"><div className="h-8 w-48 rounded bg-[#E5E7EB]"/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-28 rounded-lg border border-[#E5E7EB] bg-white"/>)}</div><div className="h-80 rounded-lg border border-[#E5E7EB] bg-white"/></div>;
}
