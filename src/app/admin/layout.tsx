import type { Metadata } from "next";
import { AdminShell } from "@/src/components/admin/AdminShell";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s | QurZaib Fabrics Admin" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
