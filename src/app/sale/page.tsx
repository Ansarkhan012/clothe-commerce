import { ProductCard } from "@/src/components/common/ProductCard";
import { createClient } from "@/src/lib/supabase/Client";
import { Product } from "@/src/types/supabase";

export default async function SalePage() {
  const supabase = await createClient();
  
  // Get products with low stock as "Sale" items
  const { data: saleItems } = await supabase
    .from('products')
    .select('*')
    .lt('stock', 10)
    .order('stock', { ascending: true });

  return (
    <div>
      <section className="bg-error py-16 px-4 text-center text-white">
        <span className="tracking-[0.3em] uppercase text-sm font-medium opacity-90">Limited Time</span>
        <h1 className="font-display text-5xl sm:text-6xl font-bold mt-4">End of Season Sale</h1>
        <p className="mt-4 text-white/90 text-lg">Up to 50% off on selected items. While stocks last!</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {saleItems && saleItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saleItems.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted text-lg">No sale items available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}