import { ProductCard } from "@/src/components/common/ProductCard";
import { NewArrivalHero } from "@/src/components/new-arrivals/NewArrivalHero";
import { FilterBar } from "@/src/components/new-arrivals/FilterBar";
import { createClient } from "@/src/lib/supabase/Client";
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FilterBar />
        
        {newProducts && newProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-8">
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