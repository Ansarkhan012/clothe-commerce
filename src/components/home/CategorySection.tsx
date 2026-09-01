import Image from "next/image";
import Link from "next/link";

export interface CategoryItem { name: string; image?: string }

export function CategorySection({ categories }: { categories: CategoryItem[] }) {
  if (!categories.length) return null;
  return <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12">
    <div className="mb-9 text-center"><p className="text-[10px] font-semibold tracking-[0.28em] text-accent">CURATED FOR YOU</p><h2 className="mt-2 font-display text-3xl text-brand-green-dark sm:text-4xl">Shop by Category</h2></div>
    <div className="flex snap-x gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
      {categories.slice(0, 6).map((category) => <Link key={category.name} href={`/collections?category=${encodeURIComponent(category.name)}`} className="group min-w-28 snap-start text-center">
        <span className="relative mx-auto block aspect-square w-24 overflow-hidden rounded-full border border-brand-gold/35 bg-brand-cream-dark sm:w-full sm:max-w-36">
          {category.image ? <Image src={category.image} alt={`${category.name} fabrics`} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="144px" /> : <span className="brand-pattern absolute inset-0 bg-brand-green" />}
        </span>
        <span className="mt-3 block text-xs font-semibold tracking-wide text-brand-green-dark group-hover:text-accent">{category.name}</span>
      </Link>)}
    </div>
  </section>;
}
