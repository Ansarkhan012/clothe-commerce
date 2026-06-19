"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const FABRIC_TAGS = ["Linen", "Cotton", "Wool", "Silk"];

export default function HeroSection() {
  return (
    <section className="relative min-h-96   flex flex-col justify-between bg-black text-white overflow-hidden font-sans">
      
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/images/home/hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex-grow flex items-center px-6 sm:px-12 lg:px-20 pt-24 pb-12">
        <div className="max-w-xl space-y-6">
          
          {/* Season Label */}
          <p className="text-[10px] tracking-[0.22em] text-neutral-400 uppercase">
            New Collection — 2025
          </p>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-5xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-white leading-[1.08]"
          >
            Dressed
            <br />
            in Someting
            <br />
            Real.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm text-neutral-300 font-light leading-relaxed max-w-sm"
          >
            Minimal cuts. Natural fabrics. Clothes made to wear slowly.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex items-center gap-6 pt-2"
          >
            <Link
              href="/new-arrivals"
              className="px-7 py-3 bg-white text-black text-[10px] tracking-[0.16em] uppercase font-medium hover:bg-neutral-100 transition-colors duration-200"
            >
              Shop Now
            </Link>

            <Link
              href="/lookbook"
              className="text-[10px] tracking-[0.14em] uppercase border-b border-neutral-500 pb-0.5 hover:border-white transition-colors duration-200"
            >
              View Lookbook
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/10 px-6 sm:px-12 lg:px-20 py-5 flex items-center justify-between">
        <div className="flex gap-8">
          {FABRIC_TAGS.map((tag) => (
            <span
              key={tag}
              className="text-[10px] tracking-[0.18em] text-neutral-200 uppercase"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href="/collections"
          className="text-[10px] tracking-[0.14em] uppercase text-neutral-100 border border-white/20 hover:border-white/50 px-5 py-2.5 transition-colors duration-200"
        >
          Collections
        </Link>
      </div>
    </section>
  );
}