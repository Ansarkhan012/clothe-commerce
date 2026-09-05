import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/src/components/common/ProductCard";
import { ProductGallery } from "@/src/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/src/components/product/ProductPurchasePanel";
import { getProduct, getRelatedProducts } from "@/src/lib/catalog";
import { productHref } from "@/src/lib/product-commerce";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found" };
  const title=product.seo_title??product.title;
  const description=product.seo_description??product.short_description??product.description??undefined;
  const canonical=productHref(product);
  return { title, description, alternates:{canonical}, openGraph:{title,description,type:"website",url:canonical,images:product.images?.[0]?[{url:product.images[0],alt:product.title}]:[]}, twitter:{card:"summary_large_image",title,description,images:product.images?.[0]?[product.images[0]]:[]} };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const related = await getRelatedProducts(product.category_id, product.id);

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
        <div className="mb-8 flex items-end justify-between border-b border-border pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-brand-gold-dark">Complete the edit</p><h2 className="mt-2 font-display text-3xl text-brand-green-dark sm:text-4xl">You May Also Like</h2></div>{product.category_id&&<Link href={`/collections?category=${encodeURIComponent(product.category_id)}`} className="hidden text-xs font-semibold text-brand-green sm:block">View category</Link>}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-6 lg:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
      </div>
    </section>}
  </main>;
}
