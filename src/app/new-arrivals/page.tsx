import { ProductCard } from "@/src/components/common/ProductCard";
import { connection } from "next/server";
import { NewArrivalHero } from "@/src/components/new-arrivals/NewArrivalHero";
import { getLatestProducts } from "@/src/lib/catalog";
import { Product } from "@/src/types/supabase";

export default async function NewArrivalsPage() {
  await connection();
  const newProducts = await getLatestProducts(20);

  return (
    <div>
      <NewArrivalHero />
      
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-14 bg-brand-cream">
        {newProducts && newProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-9 sm:gap-x-6">
            {newProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} isNew />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mt-8">
            <p className="text-muted text-lg">New arrivals coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
