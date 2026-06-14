import HeroSection from "../components/home/HeroSection";
import { ProductCard } from "../components/common/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "../lib/supabase/Client";
import { Product } from "../types/supabase";

const features = [
  { title: "Free Shipping", desc: "On orders above Rs. 5,000 across Pakistan" },
  { title: "Authentic Fabrics", desc: "100% genuine premium raw material" },
  { title: "7-Day Exchange", desc: "Hassle-free size & article switches" },
  { title: "Bespoke Support", desc: "24/7 dedicated customer care helpline" },
];

const categories = [
  { title: "Lawn Collection", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop", count: "120+ Designs" },
  { title: "Chiffon & Silk", image: "https://images.unsplash.com/photo-1583391733952-2350a25e9e5f?w=600&auto=format&fit=crop", count: "80+ Designs" },
  { title: "Embroidered", image: "https://images.unsplash.com/photo-1610030469978-6bb4e1940fb0?w=600&auto=format&fit=crop", count: "60+ Designs" },
];

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch products from Supabase directly on the server
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  return (
    <div className="bg-white text-black antialiased selection:bg-amber-100">
      
      {/* 1. HERO SECTION BANNER */}
      <HeroSection />

      {/* 2. MINIMALIST FEATURES BAR (KHAADI EDITORIAL STYLE) */}
      <section className="bg-neutral-50 py-6 border-y border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 divide-x-0 md:divide-x divide-gray-200">
            {features.map((feature, idx) => (
              <div key={feature.title} className={`text-center ${idx > 0 ? 'md:pl-4' : ''}`}>
                <h4 className="text-xs tracking-widest font-medium uppercase text-amber-800">{feature.title}</h4>
                <p className="text-[11px] text-gray-500 font-light mt-0.5">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CLEAN COLLECTIONS CATEGORIES GRID */}
      <section className="py-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-14">
          <span className="text-[10px] tracking-[0.3em] font-semibold text-amber-700 uppercase">Curated Seasonal Lines</span>
          <h2 className="text-2xl sm:text-3xl font-light tracking-widest text-gray-950 uppercase mt-2">Shop Our Collections</h2>
          <div className="w-12 h-[1px] bg-amber-600/60 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link key={cat.title} href="/collections" className="group flex flex-col bg-white">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="pt-4 text-center">
                <h3 className="text-sm font-light tracking-widest text-gray-900 uppercase group-hover:text-amber-800 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-gray-400 font-light tracking-wide mt-1">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS GRID */}
      <section className="py-20 bg-neutral-50/50 border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[10px] tracking-[0.3em] font-semibold text-amber-700 uppercase">The Latest Edit</span>
              <h2 className="text-2xl sm:text-3xl font-light tracking-widest text-gray-950 uppercase mt-1">Featured Pieces</h2>
            </div>
            <Link
              href="/new-arrivals"
              className="hidden sm:inline-flex items-center gap-2 text-xs tracking-widest uppercase font-medium text-gray-900 hover:text-amber-800 transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
              {featuredProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-gray-100">
              <p className="text-xs tracking-wider text-gray-400 uppercase">New curation arriving shortly. Check back soon!</p>
            </div>
          )}

          <div className="mt-12 text-center sm:hidden">
            <Link
              href="/new-arrivals"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-medium border border-black px-6 py-3 text-black hover:bg-black hover:text-white transition-all"
            >
              View All Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* 5. HERITAGE GOLD-EMBEDDED CRAFTSMANSHIP BANNER */}
      <section className="relative py-28 overflow-hidden bg-neutral-950">
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&auto=format&fit=crop"
            alt="Fabric heritage background"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="text-amber-500 font-medium tracking-[0.4em] uppercase text-[10px]">Our Heritage</span>
          <h2 className="text-3xl sm:text-5xl font-extralight tracking-wide text-white uppercase mt-4 mb-6 leading-tight">
            Crafted in Karachi, <span className="text-amber-500 font-serif italic">Worn Worldwide</span>
          </h2>
          <p className="text-gray-400 text-sm font-light leading-relaxed max-w-2xl mx-auto mb-10 tracking-wide">
            Every thread woven speaks volumes of our signature artisans. From the traditional heartbeat 
            of Karachi's textile landscape directly to your wardrobe, we engineer premium lawn 
            and rich intricate threadwork that keeps contemporary roots alive.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center border border-amber-600/60 text-amber-400 hover:bg-amber-600 hover:text-black px-8 py-3.5 text-xs tracking-widest uppercase font-medium transition-all duration-500"
          >
            Explore Our Story
          </Link>
        </div>
      </section>

    </div>
  );
}