import Image from "next/image";
import Link from "next/link";
import CookiePreferencesLink from "@/src/components/common/CookiePreferencesLink";

const groups = [
  { title: "Shop", links: [["New Arrivals", "/new-arrivals"], ["Collections", "/collections"], ["Sale", "/sale"]] },
  { title: "Customer Care", links: [["Help Center", "/help-center"], ["Support", "/support"], ["Track Order", "/track-order"], ["Shipping Policy", "/shipping-policy"], ["Return / Exchange", "/return-exchange-policy"], ["Refund Policy", "/refund-policy"], ["Cancellation Policy", "/cancellation-policy"]] },
  { title: "Legal", links: [["Privacy", "/privacy-policy"], ["Terms", "/terms-and-conditions"], ["Cookies", "/cookies-policy"], ["Disclaimer", "/disclaimer"], ["Accessibility", "/accessibility"]] },
  { title: "Security & Governance", links: [["Security Policy", "/security-policy"], ["Responsible Disclosure", "/responsible-disclosure"], ["Data Processing", "/data-processing-agreement"], ["Acceptable Use", "/acceptable-use-policy"], ["Community Guidelines", "/community-guidelines"]] },
];

export default function Footer() {
  return <footer className="mt-20 bg-brand-green-dark text-white">
    <div className="brand-pattern mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.3fr_2fr] lg:px-12">
      <div>
        <Link href="/" className="inline-flex items-center gap-4">
          <Image src="/images/qurzaib-mark.png" alt="QurZaib Fabrics emblem" width={76} height={76} className="h-16 w-16 object-contain" />
          <span><span className="block font-display text-3xl tracking-[0.12em]">QURZAIB</span><span className="block text-[10px] tracking-[0.42em] text-brand-gold">FABRICS</span></span>
        </Link>
        <p className="mt-5 font-display text-xl text-brand-gold">Elegance Woven With Faith</p>
        <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">Thoughtfully curated Pakistani fabrics for timeless wardrobes and meaningful occasions.</p>
      </div>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {groups.map((group) => <div key={group.title}><h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">{group.title}</h2><ul className="space-y-3 text-sm text-white/70">{group.links.map(([label, href]) => <li key={href}><Link href={href} className="transition hover:text-white">{label}</Link></li>)}</ul></div>)}
      </div>
    </div>
    <div className="flex flex-col items-center justify-center gap-2 border-t border-white/10 px-5 py-5 text-center text-xs text-white/55 sm:flex-row sm:gap-5"><span>© 2026 QurZaib Fabrics. All rights reserved.</span><CookiePreferencesLink /></div>
  </footer>;
}
