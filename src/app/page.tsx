import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroSection from "@/src/components/home/HeroSection";
import { TrustStrip } from "@/src/components/home/TrustStrip";
import { CategorySection, type CategoryItem } from "@/src/components/home/CategorySection";
import { ProductCard } from "@/src/components/common/ProductCard";
import { createClient } from "@/src/lib/supabase/server";
import type { Product } from "@/src/types/supabase";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(12);
  const products = (data ?? []) as Product[];
  const categories = [...new Map(products.filter((product) => product.category).map((product) => [
    product.category,
    { name: product.category, image: product.images?.[0] } satisfies CategoryItem,
  ])).values()];
  const arrivals = products.slice(0, 8);
  const sale = products.filter((product) => product.sale_price !== null).slice(0, 4);

  return <div className="bg-brand-cream">
    <HeroSection />
    <TrustStrip />
    <CategorySection categories={categories} />

    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-9 flex items-end justify-between border-b border-border pb-4">
          <div><p className="text-[10px] font-semibold tracking-[0.28em] text-accent">THE LATEST EDIT</p><h2 className="mt-2 font-display text-3xl text-brand-green-dark sm:text-4xl">New Arrivals</h2></div>
          <Link href="/new-arrivals" className="hidden items-center gap-2 text-xs font-semibold tracking-wide text-brand-green-dark hover:text-accent sm:flex">View all <ArrowRight size={15} /></Link>
        </div>
        {arrivals.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-6 lg:grid-cols-4">{arrivals.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="border border-border bg-brand-cream px-5 py-16 text-center text-sm text-muted">Our new collection is being prepared. Please check back soon.</div>}
      </div>
    </section>

    {sale.length > 0 && <section className="brand-pattern bg-brand-green-dark py-16 text-white sm:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-9 flex items-end justify-between border-b border-white/15 pb-4"><div><p className="text-[10px] font-semibold tracking-[0.28em] text-brand-gold">SELECTED SAVINGS</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">The Sale Edit</h2></div><Link href="/sale" className="flex items-center gap-2 text-xs text-brand-gold">Shop sale <ArrowRight size={15} /></Link></div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-6 lg:grid-cols-4">{sale.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
    </section>}

    <section className="mx-auto grid max-w-[1440px] gap-8 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-12">
      <div className="brand-pattern min-h-80 bg-brand-green-dark p-8 text-white sm:p-12"><p className="text-[10px] tracking-[0.28em] text-brand-gold">OUR PHILOSOPHY</p><h2 className="mt-4 max-w-md font-display text-4xl leading-tight">Elegance Woven With Faith</h2><p className="mt-5 max-w-lg text-sm leading-7 text-white/70">QurZaib Fabrics brings together modest elegance, considered detail, and the rich expression of Pakistani textiles.</p><Link href="/about" className="mt-8 inline-flex items-center gap-2 border-b border-brand-gold pb-1 text-xs text-brand-gold">Discover our story <ArrowRight size={14} /></Link></div>
      <div className="flex min-h-80 flex-col justify-center border border-border bg-white p-8 sm:p-12"><p className="text-[10px] tracking-[0.28em] text-accent">DELIVERED WITH CARE</p><h2 className="mt-4 font-display text-4xl text-brand-green-dark">Fabric worth waiting for.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-muted">Explore unstitched and embroidered collections selected for everyday refinement and special occasions.</p><Link href="/collections" className="mt-8 inline-flex w-fit bg-brand-green-dark px-6 py-3 text-xs font-semibold tracking-wide text-white hover:bg-brand-green">Explore Collections</Link></div>
    </section>
  </div>;
}
