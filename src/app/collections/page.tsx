import Link from "next/link";
import { CatalogFilters } from "@/src/components/catalog/CatalogFilters";
import { ProductCard } from "@/src/components/common/ProductCard";
import { getCatalogCategories, getCatalogPage } from "@/src/lib/catalog";

const pageSize = 24;

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const value = (key: string) => typeof raw[key] === "string" ? raw[key] as string : "";
  const page = Math.max(1, Number(value("page")) || 1);
  const minValue = Number(value("min"));
  const maxValue = Number(value("max"));
  const filters = {
    q: value("q").trim(), category: value("category"), productType: value("type"), size: value("size"), availability: value("availability"),
    sale: value("sale") === "true", min: Number.isFinite(minValue) && minValue > 0 ? minValue : null,
    max: Number.isFinite(maxValue) && maxValue > 0 ? maxValue : null, sort: value("sort"), page, pageSize,
  };
  const [{ products, total }, categories] = await Promise.all([getCatalogPage(filters), getCatalogCategories()]);
  const params = new URLSearchParams(Object.entries(raw).flatMap(([key, item]) => typeof item === "string" ? [[key, item]] : []));
  const href = (target: number) => { params.set("page", String(target)); return `/collections?${params}`; };

  return <main className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12">
    <nav className="text-xs text-muted"><Link href="/">Home</Link> / Collections</nav>
    <div className="mt-5"><p className="text-xs uppercase tracking-[.2em] text-brand-gold-dark">Our range</p><h1 className="font-display text-5xl">All Collections</h1><p className="mt-2 text-sm text-muted">{total} products</p></div>
    <CatalogFilters categories={categories} values={{ q: filters.q, category: filters.category, productType: filters.productType, size: filters.size, availability: filters.availability, sale: filters.sale, min: value("min"), max: value("max"), sort: filters.sort }}/>
    {products.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-6 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="py-20 text-center text-muted">No products match these filters.</div>}
    <div className="mt-12 flex justify-center gap-3">{page > 1 && <Link href={href(page - 1)} className="border border-brand-green px-5 py-2 text-brand-green">Previous</Link>}{page * pageSize < total && <Link href={href(page + 1)} className="bg-brand-green px-5 py-2 text-white">Next</Link>}</div>
  </main>;
}
