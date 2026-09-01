import { ProductCard } from "@/src/components/common/ProductCard";
import { NewArrivalHero } from "@/src/components/new-arrivals/NewArrivalHero";
import { createClient } from "@/src/lib/supabase/server";
import { Product } from "@/src/types/supabase";

export default async function NewArrivalsPage() {
  const supabase = await createClient();
  
  const { data: newProducts } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div>
      <NewArrivalHero />
      
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-14 bg-brand-cream">
        {newProducts && newProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-9 sm:gap-x-6">
            {newProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
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
