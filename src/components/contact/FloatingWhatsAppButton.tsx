"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
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
      aria-label="Contact QurZaib Fabrics on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 z-[80] grid size-14 place-items-center rounded-full border border-white/25 bg-brand-green text-white shadow-[0_12px_35px_rgba(20,72,54,0.3)] transition hover:-translate-y-0.5 hover:bg-brand-green-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold sm:right-6 sm:size-12"
    >
      <MessageCircle aria-hidden="true" size={25} strokeWidth={2} />
    </a>
  );
}
