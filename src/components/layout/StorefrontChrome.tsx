"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import Footer from "./Footer";
import Newsletter from "../common/Newsletter";
import CookiePreferences from "../common/CookiePreferences";
import FloatingWhatsAppButton from "../contact/FloatingWhatsAppButton";

export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin-login" || pathname.startsWith("/admin/") || pathname === "/admin";

  if (isAdmin) return children;
  return <><Navbar />{children}<Newsletter /><Footer /><FloatingWhatsAppButton /><CookiePreferences /></>;
}
