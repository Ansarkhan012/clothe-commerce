"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/src/components/contact/SocialIcons";
import { WHATSAPP_CONTACT_URL } from "@/src/lib/contact";

export default function FloatingWhatsAppButton() {
  const [cookiePreferencesOpen, setCookiePreferencesOpen] = useState(false);

  useEffect(() => {
    const handleCookieVisibility = (event: Event) => {
      const detail = (event as CustomEvent<{ open: boolean }>).detail;
      setCookiePreferencesOpen(Boolean(detail?.open));
    };

    window.addEventListener("qurzaib-cookie-visibility", handleCookieVisibility);
    return () =>
      window.removeEventListener("qurzaib-cookie-visibility", handleCookieVisibility);
  }, []);

  if (cookiePreferencesOpen) return null;

  return (
    <a
      href={WHATSAPP_CONTACT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with QurZaib Fabrics on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 z-[80] grid size-14 place-items-center rounded-full border border-white/30 bg-[#25D366] text-white shadow-[0_12px_35px_rgba(18,140,76,0.32)] transition hover:-translate-y-0.5 hover:bg-[#1ebe5d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold sm:right-6 sm:size-12"
    >
      <WhatsAppIcon aria-hidden="true" className="size-7 sm:size-6" />
    </a>
  );
}
