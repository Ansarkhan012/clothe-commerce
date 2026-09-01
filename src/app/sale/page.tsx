import { ProductCard } from "@/src/components/common/ProductCard";
import { createClient } from "@/src/lib/supabase/server";
import { Product } from "@/src/types/supabase";

export default async function SalePage() {
  const supabase = await createClient();
  
  const { data: saleItems } = await supabase
    .from('products')
    .select('*')
    .not('sale_price', 'is', null)
    .order('created_at', { ascending: false });

  return (
    <div>
      <section className="brand-pattern bg-brand-green-dark py-20 px-4 text-center text-white">
        <span className="tracking-[0.3em] uppercase text-xs font-medium text-brand-gold">Selected Savings</span>
        <h1 className="font-display text-5xl sm:text-6xl font-normal mt-4">The Sale Edit</h1>
        <p className="mt-4 text-white/75 text-base">Special prices on selected QurZaib Fabrics articles.</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {saleItems && saleItems.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-9 sm:gap-x-6">
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
