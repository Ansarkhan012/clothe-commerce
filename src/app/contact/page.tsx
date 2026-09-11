"use client";

import { useState } from "react";
import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { businessConfig } from "@/src/config/business";
import { FacebookIcon, InstagramIcon } from "@/src/components/contact/SocialIcons";
import {
  BUSINESS_EMAIL,
  BUSINESS_PHONE,
  BUSINESS_PHONE_TEL,
  BUSINESS_LANDLINE,
  BUSINESS_LANDLINE_TEL,
  WHATSAPP_CONTACT_URL,
  WHATSAPP_DISPLAY,
  FACEBOOK_URL,
  INSTAGRAM_URL,
} from "@/src/lib/contact";

const emptyForm = { name: "", email: "", phone: "", subject: "", message: "" };

const contactMethods = [
  { label: "Email", value: BUSINESS_EMAIL, href: `mailto:${BUSINESS_EMAIL}`, ariaLabel: `Email QurZaib Fabrics at ${BUSINESS_EMAIL}`, icon: Mail, external: false },
  { label: "Phone", value: BUSINESS_PHONE, href: BUSINESS_PHONE_TEL, ariaLabel: `Call QurZaib Fabrics at ${BUSINESS_PHONE}`, icon: Phone, external: false },
  { label: "Landline", value: BUSINESS_LANDLINE, href: BUSINESS_LANDLINE_TEL, ariaLabel: `Call QurZaib Fabrics landline at ${BUSINESS_LANDLINE}`, icon: Phone, external: false },
  { label: "WhatsApp", value: WHATSAPP_DISPLAY, href: WHATSAPP_CONTACT_URL, ariaLabel: `Message QurZaib Fabrics on WhatsApp at ${WHATSAPP_DISPLAY}`, icon: MessageCircle, external: true },
] as const;

export default function ContactPage() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = (await response.json()) as { message: string };
      setStatus(result.message);
      if (response.ok) setForm(emptyForm);
    } catch {
      setStatus("Unable to submit your request right now. Please contact us directly.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[.2em] text-brand-gold-dark">Customer care</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Contact QurZaib Fabrics</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">We are here to help with products, orders, delivery, and fabric guidance. Choose the channel that works best for you.</p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="border border-border bg-brand-cream p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold-dark">Speak with our team</p>
          <h2 className="mt-2 font-display text-3xl">Contact Us</h2>
          <p className="mt-3 text-sm leading-6 text-muted">For the quickest product assistance, send us a WhatsApp message. You can also call or email our customer care team.</p>
          <ul className="mt-7 space-y-3">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <li key={method.label}>
                  <a href={method.href} aria-label={method.ariaLabel} target={method.external ? "_blank" : undefined} rel={method.external ? "noopener noreferrer" : undefined} className="group flex items-center gap-4 border border-border bg-white p-4 transition hover:border-brand-gold focus-visible:border-brand-gold">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-green text-white transition group-hover:bg-brand-green-dark"><Icon aria-hidden="true" size={18} /></span>
                    <span className="min-w-0"><span className="block text-xs uppercase tracking-[0.14em] text-muted">{method.label}</span><span className="mt-1 block break-all text-sm font-semibold text-brand-green-dark">{method.value}</span></span>
                  </a>
                </li>
              );
            })}
          </ul>
          {businessConfig.businessAddress && <div className="mt-6 border-t border-border pt-5 text-sm"><p className="text-xs uppercase tracking-[0.14em] text-muted">Address</p><p className="mt-1 leading-6">{businessConfig.businessAddress}</p></div>}
          <div className="mt-7 border-t border-border pt-6">
            <h3 className="font-display text-xl text-brand-green-dark">Follow QurZaib Fabrics</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Follow QurZaib Fabrics on Facebook" className="flex min-h-12 items-center justify-center gap-2 border border-border bg-white px-3 text-sm font-semibold text-brand-green-dark transition hover:border-brand-gold focus-visible:border-brand-gold">
                <FacebookIcon aria-hidden="true" className="size-[18px]" /> Facebook
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Follow QurZaib Fabrics on Instagram" className="flex min-h-12 items-center justify-center gap-2 border border-border bg-white px-3 text-sm font-semibold text-brand-green-dark transition hover:border-brand-gold focus-visible:border-brand-gold">
                <InstagramIcon aria-hidden="true" className="size-[18px]" /> Instagram
              </a>
            </div>
          </div>
        </aside>

        <form onSubmit={submit} className="grid gap-5 border border-border bg-surface p-6 shadow-sm sm:grid-cols-2 sm:p-8">
          <div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold-dark">Send an enquiry</p><h2 className="mt-2 font-display text-3xl">How can we help?</h2></div>
          {([ ["name", "Name", "text"], ["email", "Email", "email"], ["phone", "Phone (optional)", "tel"], ["subject", "Subject", "text"] ] as const).map(([name, label, type]) => (
            <div key={name}><label htmlFor={name} className="mb-2 block text-sm font-medium">{label}</label><input id={name} type={type} required={name !== "phone"} value={form[name]} maxLength={name === "subject" ? 120 : 254} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="w-full border border-border bg-bg px-4 py-3 outline-none transition focus:border-brand-gold" /></div>
          ))}
          <div className="sm:col-span-2"><label htmlFor="message" className="mb-2 block text-sm font-medium">Message</label><textarea id="message" required minLength={10} maxLength={3000} rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="w-full border border-border bg-bg px-4 py-3 outline-none transition focus:border-brand-gold" /></div>
          <button disabled={busy} className="flex items-center justify-center gap-2 bg-brand-green px-5 py-3 text-white transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"><Send aria-hidden="true" size={17} />{busy ? "Submitting…" : "Submit Request"}</button>
          {status && <p aria-live="polite" className="text-sm sm:col-span-2">{status}</p>}
        </form>
      </div>
    </main>
  );
}
