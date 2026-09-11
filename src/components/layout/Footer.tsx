import Image from "next/image";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import CookiePreferencesLink from "@/src/components/common/CookiePreferencesLink";
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

const groups = [
  {
    title: "Shop",
    links: [
      ["New Arrivals", "/new-arrivals"],
      ["Collections", "/collections"],
      ["Sale", "/sale"],
    ],
  },
  {
    title: "Customer Care",
    links: [
      ["Help Center", "/help-center"],
      ["Support", "/support"],
      ["Track Order", "/track-order"],
      ["Shipping Policy", "/shipping-policy"],
      ["Return / Exchange", "/return-exchange-policy"],
      ["Refund Policy", "/refund-policy"],
      ["Cancellation Policy", "/cancellation-policy"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy-policy"],
      ["Terms", "/terms-and-conditions"],
      ["Cookies", "/cookies-policy"],
      ["Disclaimer", "/disclaimer"],
      ["Accessibility", "/accessibility"],
    ],
  },
  {
    title: "Security & Governance",
    links: [
      ["Security Policy", "/security-policy"],
      ["Responsible Disclosure", "/responsible-disclosure"],
      ["Data Processing", "/data-processing-agreement"],
      ["Acceptable Use", "/acceptable-use-policy"],
      ["Community Guidelines", "/community-guidelines"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-brand-green-dark text-white">
      <div className="brand-pattern mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_2fr] lg:px-12">
        <div>
          <Link
            href="/"
            className="inline-flex max-w-full rounded-md border border-brand-gold/25 bg-brand-cream p-3 shadow-sm"
          >
            <Image
              src="/images/qurzaib-logo-display.png"
              alt="QurZaib Fabrics"
              width={500}
              height={312}
              sizes="(max-width: 640px) 180px, 210px"
              className="h-auto w-[180px] max-w-full object-contain sm:w-[210px]"
            />
          </Link>
          <p className="mt-6 font-display text-xl text-brand-gold">
            Elegance Woven With Faith
          </p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
            Thoughtfully curated Pakistani fabrics for timeless wardrobes and
            meaningful occasions.
          </p>
          <div className="mt-7">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">
              Follow Us
            </h2>
            <div className="mt-3 flex gap-3">
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Follow QurZaib Fabrics on Facebook" className="grid size-11 place-items-center rounded-full border border-white/20 text-white/75 transition hover:border-brand-gold hover:bg-white/10 hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold">
                <FacebookIcon aria-hidden="true" className="size-[18px]" />
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Follow QurZaib Fabrics on Instagram" className="grid size-11 place-items-center rounded-full border border-white/20 text-white/75 transition hover:border-brand-gold hover:bg-white/10 hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold">
                <InstagramIcon aria-hidden="true" className="size-[18px]" />
              </a>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3 xl:grid-cols-5">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">
                {group.title}
              </h2>
              <ul className="space-y-3 text-sm text-white/70">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="transition hover:text-white focus-visible:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-1">
            <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">
              Contact Us
            </h2>
            <ul className="space-y-4 text-sm text-white/70">
              <li>
                <a
                  href={`mailto:${BUSINESS_EMAIL}`}
                  className="flex items-start gap-2.5 transition hover:text-white focus-visible:text-white"
                  aria-label={`Email QurZaib Fabrics at ${BUSINESS_EMAIL}`}
                >
                  <Mail aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
                  <span className="break-all">{BUSINESS_EMAIL}</span>
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS_PHONE_TEL}
                  className="flex items-center gap-2.5 transition hover:text-white focus-visible:text-white"
                  aria-label={`Call QurZaib Fabrics at ${BUSINESS_PHONE}`}
                >
                  <Phone aria-hidden="true" className="shrink-0" size={16} />
                  <span><span className="block text-[10px] uppercase tracking-wider text-white/45">Mobile</span>{BUSINESS_PHONE}</span>
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS_LANDLINE_TEL}
                  className="flex items-center gap-2.5 transition hover:text-white focus-visible:text-white"
                  aria-label={`Call QurZaib Fabrics landline at ${BUSINESS_LANDLINE}`}
                >
                  <Phone aria-hidden="true" className="shrink-0" size={16} />
                  <span><span className="block text-[10px] uppercase tracking-wider text-white/45">Landline</span>{BUSINESS_LANDLINE}</span>
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_CONTACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition hover:text-white focus-visible:text-white"
                  aria-label={`Message QurZaib Fabrics on WhatsApp at ${WHATSAPP_DISPLAY}`}
                >
                  <MessageCircle aria-hidden="true" className="shrink-0" size={16} />
                  <span>WhatsApp Us</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 border-t border-white/10 px-5 py-5 text-center text-xs text-white/55 sm:flex-row sm:gap-5">
        <span>© 2026 QurZaib Fabrics. All rights reserved.</span>
        <CookiePreferencesLink />
      </div>
    </footer>
  );
}
