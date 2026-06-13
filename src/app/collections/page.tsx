import { ProductCard } from "@/src/components/common/ProductCard";
import { createClient } from "@/src/lib/supabase/Client";
import { Product } from "@/src/types/supabase";

export default async function CollectionsPage() {
  const supabase = await createClient();
  
  const { data: collections } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <span className="text-accent font-medium tracking-wider uppercase text-sm">Our Range</span>
        <h1 className="font-display text-4xl font-bold text-primary mt-2">All Collections</h1>
        <div className="w-16 h-0.5 bg-accent mx-auto mt-4" />
      </div>

      {collections && collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted text-lg">No collections available yet.</p>
        </div>
      )}
    </div>
  );
}