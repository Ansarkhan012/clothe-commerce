import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/src/components/common/ProductCard";
import { ProductGallery } from "@/src/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/src/components/product/ProductPurchasePanel";
import { createClient } from "@/src/lib/supabase/server";
import type { Product } from "@/src/types/supabase";

const productFields = "id,title,description,price,sale_price,category,featured,images,sizes,stock,created_at";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("title,description,images").eq("id", id).maybeSingle();
  if (!product) return { title: "Product Not Found" };
  return { title: product.title, description: product.description || `Shop ${product.title} from QurZaib Fabrics.`, openGraph: { title: `${product.title} | QurZaib Fabrics`, images: product.images?.[0] ? [product.images[0]] : [] } };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(productFields).eq("id", id).maybeSingle();
  if (!data) notFound();
  const product = data as Product;
  const { data: relatedData } = await supabase.from("products").select(productFields)
    .eq("category", product.category).neq("id", product.id).order("created_at", { ascending: false }).limit(4);
  const related = (relatedData ?? []) as Product[];

  return <main className="bg-brand-cream text-brand-charcoal">
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 lg:px-12">
      <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[.14em] text-muted"><Link href="/">Home</Link><span aria-hidden="true"> / </span><Link href="/collections">Collections</Link><span aria-hidden="true"> / </span><span className="text-brand-green-dark">{product.title}</span></nav>
      <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,.9fr)] lg:gap-12 xl:gap-16">
        <ProductGallery images={product.images ?? []} title={product.title} />
        <ProductPurchasePanel product={product} />
      </div>
    </div>

    {related.length > 0 && <section className="mt-14 border-t border-border bg-white py-14 sm:py-18">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="mb-8 flex items-end justify-between border-b border-border pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-brand-gold-dark">Complete the edit</p><h2 className="mt-2 font-display text-3xl text-brand-green-dark sm:text-4xl">You May Also Like</h2></div><Link href={`/collections?category=${encodeURIComponent(product.category)}`} className="hidden text-xs font-semibold text-brand-green sm:block">View category</Link></div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-6 lg:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
      </div>
    </section>}
  </main>;
}
