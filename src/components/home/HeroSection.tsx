"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Dummy logos to match the bottom partner bar style (Replace with your own icons or text labels)
const BRAND_PARTNERS = [
  { name: "O'Melveny", className: "tracking-tight font-serif text-gray-400" },
  { name: "BRIDGEWATER", className: "tracking-widest font-sans font-black text-gray-500" },
  { name: "MACFARLANES", className: "tracking-[0.2em] font-serif text-gray-400 text-xs" },
  { name: "K K R", className: "tracking-[0.3em] font-sans font-bold text-gray-400" },
  { name: "A&O SHEARMAN", className: "tracking-widest font-sans font-medium text-gray-300" },
  { name: "Gleiss Lutz", className: "tracking-normal font-serif italic text-gray-400" },
  { name: "CMS", className: "tracking-tighter font-sans font-extrabold text-gray-400 text-sm" },
];

export default function HarveyStyleHero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-between bg-black text-white overflow-hidden font-sans">
      
      

      {/* 2. ABSOLUTE CINEMATIC BACKGROUND WITH INTENSE DARK OVERLAYS */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600&auto=format&fit=crop" 
          alt="Premium Boutique Cinematic Background"
          fill
          className="object-cover object-center opacity-60" // Controls image brightness
          priority
        />
        {/* Dark Radial & Linear Gradients to match the layout exactly */}
        <div className="absolute inset-0 bg-neutral-950/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      </div>

      {/* 3. CENTER HERO MAIN CONTENT */}
      <div className="relative z-10 flex-grow flex items-center max-w-[1440px] mx-auto w-full px-6 sm:px-12 lg:px-16 pt-20 pb-12">
        <div className="max-w-2xl lg:max-w-3xl space-y-6">
          
          {/* Main Title Heading (Harvey Style Big Crisp Typography) */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-serif tracking-tight text-white leading-[1.05]"
          >
            Practice Made <br className="hidden sm:block" /> Perfect
          </motion.h1>

          {/* Subtitle Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-xl text-neutral-300 font-light max-w-xl leading-relaxed tracking-wide"
          >
            Today's top fashion houses and global luxury designers trust Zari to elevate their look and navigate contemporary elegance.
          </motion.p>

          {/* CTA Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-4"
          >
            <Link
              href="/new-arrivals"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-black hover:bg-amber-600 hover:text-black transition-all duration-300 rounded-sm font-medium text-xs tracking-widest uppercase shadow-lg"
            >
              Request a Demo
            </Link>
          </motion.div>
          
        </div>
      </div>

      {/* 4. BOTTOM CREDENTIALS / BRAND PARTNERS BAR */}
      <div className="relative z-10 w-full bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent pt-16 pb-8 border-t border-white/[0.03]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          
          {/* Logo Map Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 opacity-70 hover:opacity-100 transition-opacity duration-300 flex-grow">
            {BRAND_PARTNERS.map((brand, i) => (
              <span 
                key={i} 
                className={`uppercase text-sm select-none ${brand.className}`}
              >
                {brand.name}
              </span>
            ))}
          </div>

          {/* Right Action Trigger Box */}
          <div className="flex-shrink-0">
            <Link 
              href="/collections"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white px-5 py-2.5 rounded-sm text-xs tracking-wider uppercase font-medium bg-neutral-900/40 text-neutral-200 transition-all duration-300"
            >
              Our Customers
            </Link>
          </div>

        </div>
      </div>

    </section>
  );
}