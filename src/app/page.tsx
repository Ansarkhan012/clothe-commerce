import HeroSection from "../components/home/HeroSection";
import { ProductCard } from "../components/common/ProductCard";
import Link from "next/link";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { createClient } from "../lib/supabase/Client";
import { Product } from "../types/supabase";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above Rs. 5,000" },
  { icon: Shield, title: "Authentic Products", desc: "100% genuine Pakistani fabric" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated customer service" },
];

const categories = [
  { title: "Lawn Collection", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop", count: "120+ Designs" },
  { title: "Chiffon & Silk", image: "https://images.unsplash.com/photo-1583391733952-2350a25e9e5f?w=600&auto=format&fit=crop", count: "80+ Designs" },
  { title: "Embroidered", image: "https://images.unsplash.com/photo-1610030469978-6bb4e1940fb0?w=600&auto=format&fit=crop", count: "60+ Designs" },
];

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch real products from Supabase
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  return (
    <div>
      <HeroSection />

      {/* Features Bar */}
      <section className="bg-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3 text-white">
                <feature.icon className="text-accent shrink-0" size={24} />
                <div>
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                  <p className="text-white/60 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-accent font-medium tracking-wider uppercase text-sm">Browse By</span>
          <h2 className="font-display text-4xl font-bold text-primary mt-2">Our Collections</h2>
          <div className="w-16 h-0.5 bg-accent mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href="/collections"
              className="group relative h-80 overflow-hidden rounded-sm"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${cat.image}')` }}
              />
              <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/50 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h3 className="font-display text-2xl font-bold">{cat.title}</h3>
                <p className="text-white/80 text-sm mt-2">{cat.count}</p>
                <span className="mt-4 text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products - REAL DATA */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-accent font-medium tracking-wider uppercase text-sm">Handpicked</span>
              <h2 className="font-display text-4xl font-bold text-primary mt-2">Featured Products</h2>
              <div className="w-16 h-0.5 bg-accent mt-4" />
            </div>
            <Link
              href="/new-arrivals"
              className="hidden sm:flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
            >
              View All <ArrowRight size={18} />
            </Link>
          </div>

          {featuredProducts && featuredProducts.length > 0 ? (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
    {featuredProducts.map((product: Product) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
) : (
  <div className="text-center py-16">
    <p className="text-muted text-lg">No products available yet. Check back soon!</p>
  </div>
)}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/new-arrivals"
              className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
            >
              View All <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pakistani Craftsmanship Banner */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-primary/70" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <span className="text-accent font-medium tracking-[0.3em] uppercase text-sm">Our Heritage</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mt-4 mb-6">
            Crafted in Karachi, <span className="text-accent italic">Worn Worldwide</span>
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Every piece tells a story of Pakistani craftsmanship. From the bustling markets of Karachi 
            to your wardrobe, we bring you the finest fabrics and intricate embroidery that celebrate 
            our rich cultural heritage.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 border-2 border-accent text-accent hover:bg-accent hover:text-white px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300"
          >
            Our Story
          </Link>
        </div>
      </section>
    </div>
  );
}