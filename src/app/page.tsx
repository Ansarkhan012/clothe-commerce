import HeroSection from "../components/home/HeroSection";
import { ProductCard } from "../components/common/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Filter, SlidersHorizontal, Tag, Sparkles, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { createClient } from "../lib/supabase/Client";
import { Product } from "../types/supabase";

const features = [
  { title: "Free Shipping", desc: "On orders above Rs. 5,000 across Pakistan", icon: Truck },
  { title: "Authentic Fabrics", desc: "100% genuine premium raw material", icon: Shield },
  { title: "7-Day Exchange", desc: "Hassle-free size & article switches", icon: RotateCcw },
  { title: "Bespoke Support", desc: "24/7 dedicated customer care helpline", icon: Headphones },
];

const categories = [
  { title: "Lawn Collection", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop", count: "120+ Designs" },
  { title: "Chiffon & Silk", image: "https://images.unsplash.com/photo-1583391733952-2350a25e9e5f?w=600&auto=format&fit=crop", count: "80+ Designs" },
  { title: "Embroidered", image: "https://images.unsplash.com/photo-1610030469978-6bb4e1940fb0?w=600&auto=format&fit=crop", count: "60+ Designs" },
];

// Banner data for promotional sections
const banners = [
  {
    id: 1,
    title: "Summer Lawn 2026",
    subtitle: "Fresh Arrivals",
    description: "Discover the latest summer lawn collection with intricate embroidery and vibrant colors.",
    cta: "Shop Now",
    link: "/collections/lawn",
    bgImage: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&auto=format&fit=crop",
    accent: "amber",
  },
  {
    id: 2,
    title: "Festive Edit",
    subtitle: "Eid Special",
    description: "Exclusive festive wear for your celebrations. Limited edition pieces now available.",
    cta: "Explore",
    link: "/collections/festive",
    bgImage: "https://images.unsplash.com/photo-1610030469978-6bb4e1940fb0?w=1920&auto=format&fit=crop",
    accent: "rose",
  },
  {
    id: 3,
    title: "Winter Velvet",
    subtitle: "New Season",
    description: "Luxurious velvet collection to keep you warm and stylish this winter.",
    cta: "View Collection",
    link: "/collections/velvet",
    bgImage: "https://images.unsplash.com/photo-1583391733952-2350a25e9e5f?w=1920&auto=format&fit=crop",
    accent: "slate",
  },
];

interface HomePageProps {
  searchParams?: { 
    category?: string;
    price_min?: string;
    price_max?: string;
    sort?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient();

  // 1. Fetch New Arrivals (latest 8 products)
  const { data: newArrivals } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  // 2. Fetch Sale Products (products with sale_price not null)
  const { data: saleProducts } = await supabase
    .from("products")
    .select("*")
    .not("sale_price", "is", null)
    .limit(8);

  // 3. Fetch All Products with optional filtering
  let allProductsQuery = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply category filter if provided
  if (searchParams?.category) {
    allProductsQuery = allProductsQuery.eq("category", searchParams.category);
  }

  // Apply price range filters
  if (searchParams?.price_min) {
    allProductsQuery = allProductsQuery.gte("price", parseFloat(searchParams.price_min));
  }
  if (searchParams?.price_max) {
    allProductsQuery = allProductsQuery.lte("price", parseFloat(searchParams.price_max));
  }

  // Apply sorting
  if (searchParams?.sort === "price_asc") {
    allProductsQuery = allProductsQuery.order("price", { ascending: true });
  } else if (searchParams?.sort === "price_desc") {
    allProductsQuery = allProductsQuery.order("price", { ascending: false });
  } else if (searchParams?.sort === "name_asc") {
    allProductsQuery = allProductsQuery.order("name", { ascending: true });
  }

  const { data: allProducts } = await allProductsQuery;

  // 4. Fetch Featured Products (for the featured section - can be customized)
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .limit(8);

  // If no featured products, fallback to latest
  const displayFeatured = featuredProducts && featuredProducts.length > 0 
    ? featuredProducts 
    : newArrivals;

  return (
    <div className="bg-white text-black antialiased selection:bg-amber-100">

      {/* 1. HERO SECTION BANNER */}
      <HeroSection />

      {/* 2. MINIMALIST FEATURES BAR */}
      <section className="bg-neutral-50 py-6 border-y border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 divide-x-0 md:divide-x divide-gray-200">
            {features.map((feature, idx) => (
              <div key={feature.title} className={`text-center ${idx > 0 ? 'md:pl-4' : ''}`}>
                <feature.icon className="w-5 h-5 mx-auto mb-2 text-amber-700" strokeWidth={1.5} />
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

      {/* 4. NEW ARRIVALS SECTION */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
              <div>
                <span className="text-[10px] tracking-[0.3em] font-semibold text-amber-700 uppercase">Just Dropped</span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-widest text-gray-950 uppercase mt-1">New Arrivals</h2>
              </div>
            </div>
            <Link
              href="/new-arrivals"
              className="hidden sm:inline-flex items-center gap-2 text-xs tracking-widest uppercase font-medium text-gray-900 hover:text-amber-800 transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {newArrivals && newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
              {newArrivals.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-neutral-50 border border-gray-100">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-gray-300" strokeWidth={1.5} />
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

      {/* 5. PROMOTIONAL BANNERS (3 Banners) */}
      <section className="py-20 bg-neutral-50/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-14">
            <span className="text-[10px] tracking-[0.3em] font-semibold text-amber-700 uppercase">Limited Time</span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-widest text-gray-950 uppercase mt-2">Seasonal Highlights</h2>
            <div className="w-12 h-[1px] bg-amber-600/60 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <Link 
                key={banner.id} 
                href={banner.link}
                className="group relative overflow-hidden bg-neutral-900 aspect-[4/5] lg:aspect-[3/4] block"
              >
                <Image
                  src={banner.bgImage}
                  alt={banner.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-60 group-hover:opacity-50"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                  <span className={`text-[10px] tracking-[0.3em] font-semibold uppercase mb-2 
                    ${banner.accent === 'amber' ? 'text-amber-400' : 
                      banner.accent === 'rose' ? 'text-rose-400' : 'text-slate-300'}`}>
                    {banner.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-light tracking-wide text-white uppercase mb-2">
                    {banner.title}
                  </h3>
                  <p className="text-gray-300 text-xs font-light leading-relaxed mb-4 max-w-xs">
                    {banner.description}
                  </p>
                  <span className={`inline-flex items-center gap-2 text-xs tracking-widest uppercase font-medium 
                    ${banner.accent === 'amber' ? 'text-amber-400' : 
                      banner.accent === 'rose' ? 'text-rose-400' : 'text-white'} 
                    group-hover:gap-3 transition-all`}>
                    {banner.cta} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SALE / CLEARANCE SECTION */}
      <section className="py-20 bg-neutral-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="flex items-end justify-between mb-12 border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
              <div>
                <span className="text-[10px] tracking-[0.3em] font-semibold text-amber-500 uppercase">Up to 50% Off</span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-widest text-white uppercase mt-1">Sale Collection</h2>
              </div>
            </div>
            <Link
              href="/sale"
              className="hidden sm:inline-flex items-center gap-2 text-xs tracking-widest uppercase font-medium text-gray-400 hover:text-amber-400 transition-colors"
            >
              View All Sale <ArrowRight size={14} />
            </Link>
          </div>

          {/* {saleProducts && saleProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
              {saleProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} showSaleBadge />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-gray-800">
              <Tag className="w-8 h-8 mx-auto mb-3 text-gray-600" strokeWidth={1.5} />
              <p className="text-xs tracking-wider text-gray-500 uppercase">No active sale items at the moment. Check back soon!</p>
            </div>
          )} */}

          <div className="mt-12 text-center sm:hidden">
            <Link
              href="/sale"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-medium border border-gray-600 px-6 py-3 text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all"
            >
              View All Sale Items
            </Link>
          </div>
        </div>
      </section>

      {/* 7. ALL PRODUCTS WITH FILTER SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 border-b border-gray-100 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
              <div>
                <span className="text-[10px] tracking-[0.3em] font-semibold text-amber-700 uppercase">Complete Catalog</span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-widest text-gray-950 uppercase mt-1">All Products</h2>
              </div>
            </div>

            {/* Filter Controls - Server-side filtering via URL params */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] tracking-wider text-gray-400 uppercase mr-2 hidden sm:inline">Filter:</span>

              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-neutral-50 rounded-lg p-1 border border-gray-200">
                <Link 
                  href="?" 
                  className={`px-3 py-1.5 text-[11px] tracking-wider uppercase font-medium rounded-md transition-all ${
                    !searchParams?.category ? 'bg-amber-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </Link>
                <Link 
                  href="?category=lawn" 
                  className={`px-3 py-1.5 text-[11px] tracking-wider uppercase font-medium rounded-md transition-all ${
                    searchParams?.category === 'lawn' ? 'bg-amber-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Lawn
                </Link>
                <Link 
                  href="?category=chiffon" 
                  className={`px-3 py-1.5 text-[11px] tracking-wider uppercase font-medium rounded-md transition-all ${
                    searchParams?.category === 'chiffon' ? 'bg-amber-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Chiffon
                </Link>
                <Link 
                  href="?category=embroidered" 
                  className={`px-3 py-1.5 text-[11px] tracking-wider uppercase font-medium rounded-md transition-all ${
                    searchParams?.category === 'embroidered' ? 'bg-amber-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Embroidered
                </Link>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 bg-neutral-50 rounded-lg p-1 border border-gray-200">
                <Link 
                  href={`?${searchParams?.category ? `category=${searchParams.category}&` : ''}sort=newest`}
                  className={`px-3 py-1.5 text-[11px] tracking-wider uppercase font-medium rounded-md transition-all ${
                    !searchParams?.sort || searchParams?.sort === 'newest' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Newest
                </Link>
                <Link 
                  href={`?${searchParams?.category ? `category=${searchParams.category}&` : ''}sort=price_asc`}
                  className={`px-3 py-1.5 text-[11px] tracking-wider uppercase font-medium rounded-md transition-all ${
                    searchParams?.sort === 'price_asc' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Price ↑
                </Link>
                {/* <Link 
                  href={`?${searchParams?.category ? `category=${search.params.category}&` : ''}sort=price_desc`}
                  className={`px-3 py-1.5 text-[11px] tracking-wider uppercase font-medium rounded-md transition-all ${
                    searchParams?.sort === 'price_desc' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Price ↓
                </Link> */}
              </div>
            </div>
          </div>

          {allProducts && allProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
              {allProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-neutral-50 border border-gray-100">
              <Filter className="w-8 h-8 mx-auto mb-3 text-gray-300" strokeWidth={1.5} />
              <p className="text-xs tracking-wider text-gray-400 uppercase">No products found matching your filters.</p>
              <Link 
                href="?" 
                className="inline-flex items-center gap-2 mt-4 text-xs tracking-widest uppercase font-medium text-amber-700 hover:text-amber-900 transition-colors"
              >
                Clear Filters <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Pagination or Load More placeholder */}
          {allProducts && allProducts.length >= 20 && (
            <div className="mt-12 text-center">
              <button className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-medium border border-gray-300 px-8 py-3 text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">
                Load More Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 8. FEATURED PRODUCTS GRID (Original Section - Kept) */}
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

          {displayFeatured && displayFeatured.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
              {displayFeatured.map((product: Product) => (
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

      {/* 9. HERITAGE CRAFTSMANSHIP BANNER (Original - Kept) */}
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