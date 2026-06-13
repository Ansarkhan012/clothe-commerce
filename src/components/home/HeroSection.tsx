"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[var(--color-bg)]">
      {/* Background Image - Right Side */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[60%] xl:w-[55%]">
        <Image
          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&auto=format&fit=crop"
          alt="Pakistani Fashion Models"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {/* Gradient overlay for text readability on mobile */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent lg:via-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/40 to-transparent lg:hidden" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-12 left-12 w-32 h-32 border border-[var(--color-accent)]/10 rounded-full hidden lg:block" />
      <div className="absolute bottom-20 right-[40%] w-20 h-20 border border-[var(--color-accent)]/10 rounded-full hidden lg:block" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a96e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content - Left Side */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl lg:max-w-lg xl:max-w-xl">
          
          {/* Top Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-8 bg-[var(--color-accent)]" />
            <span 
              className="text-[10px] tracking-[0.4em] uppercase font-medium"
              style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}
            >
              Handcrafted with Tradition
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-[var(--color-primary)] leading-[0.95] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Become
            <br />
            Style Icon
            <br />
            <span style={{ color: "var(--color-accent)" }}>with Zari</span>
          </motion.h1>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-16 h-0.5 bg-[var(--color-accent)] mb-6 origin-left"
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-sm md:text-base text-[var(--color-muted)] max-w-md mb-8 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Elevate your wardrobe with trendy and elegant styles from Zari & Taanka. 
            Shop our bestsellers and enjoy authentic Pakistani craftsmanship.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/new-arrivals"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-primary)] text-white text-xs tracking-[0.2em] uppercase font-medium hover:bg-[var(--color-accent)] transition-all duration-300"
            >
              Shop Now
              <svg 
                className="w-4 h-4 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--color-border)] text-[var(--color-primary)] text-xs tracking-[0.2em] uppercase font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all duration-300"
            >
              All Collections
            </Link>
          </motion.div>

          {/* Stats / Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex items-center gap-8 mt-12 pt-8 border-t border-[var(--color-border)]"
          >
            <div>
              <p className="text-2xl font-display font-bold text-[var(--color-primary)]">500+</p>
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider mt-1">Designs</p>
            </div>
            <div className="w-px h-10 bg-[var(--color-border)]" />
            <div>
              <p className="text-2xl font-display font-bold text-[var(--color-primary)]">15K+</p>
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider mt-1">Happy Customers</p>
            </div>
            <div className="w-px h-10 bg-[var(--color-border)]" />
            <div>
              <p className="text-2xl font-display font-bold text-[var(--color-primary)]">4.9</p>
              <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider mt-1">Rating</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side floating card - like the image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="hidden xl:block absolute right-12 top-1/2 -translate-y-1/2 max-w-xs"
      >
        <div className="bg-white/90 backdrop-blur-sm p-6 border border-[var(--color-border)] shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)]">
              New Collection
            </span>
          </div>
          <h3 className="font-display text-xl font-semibold text-[var(--color-primary)] mb-2">
            Elevate Your Wardrobe
          </h3>
          <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-4">
            Shop our bestsellers and enjoy 15% off your entire order — limited time offer.
          </p>
          <Link
            href="/sale"
            className="inline-flex items-center gap-2 text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] font-medium transition-colors"
          >
            Shop Now 
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-muted)]">Scroll</span>
        <div className="w-px h-8 bg-[var(--color-accent)]/40 relative overflow-hidden">
          <motion.div
            animate={{ y: [0, 32] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-full h-1/2 bg-[var(--color-accent)]"
          />
        </div>
      </motion.div>
    </section>
  );
}