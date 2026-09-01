import { Banknote, PackageCheck, RotateCcw, ShieldCheck } from "lucide-react";

const items = [
  { icon: PackageCheck, title: "Premium Quality", detail: "Curated Fabrics" },
  { icon: Banknote, title: "Cash on Delivery", detail: "All Over Pakistan" },
  { icon: RotateCcw, title: "Easy Returns", detail: "Policy Terms Apply" },
  { icon: ShieldCheck, title: "Secure Shopping", detail: "Protected Checkout" },
];

export function TrustStrip() {
  return <section aria-label="Shopping benefits" className="border-y border-brand-gold/25 bg-brand-green-dark text-white">
    <div className="mx-auto grid max-w-[1440px] grid-cols-2 px-4 sm:px-8 lg:grid-cols-4 lg:px-12">
      {items.map(({ icon: Icon, title, detail }) => <div key={title} className="flex items-center gap-3 border-white/10 px-2 py-5 sm:px-5 lg:border-r last:border-r-0">
        <Icon className="shrink-0 text-brand-gold" size={24} strokeWidth={1.4} aria-hidden="true" />
        <span><strong className="block text-xs font-semibold">{title}</strong><span className="mt-0.5 block text-[10px] text-white/65">{detail}</span></span>
      </div>)}
    </div>
  </section>;
}
