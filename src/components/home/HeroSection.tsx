"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FABRIC_TAGS = ["Linen", "Cotton", "Wool", "Silk"];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-between bg-black text-white overflow-hidden font-sans">

      {/* Background image + overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/home/hero-model.png"
          alt="Zari Collection"
          fill
          className="object-cover object-center opacity-50"
          priority
        />
        </div>

      {/* Hero content */}
      <div className="relative z-10 flex-grow flex items-center px-6 sm:px-12 lg:px-20 pt-24 pb-12">
        <div className="max-w-xl space-y-6">

          {/* Season label */}
          <p className="text-[10px] tracking-[0.22em] text-neutral-500 uppercase">
            New Collection — 2025
          </p>

          {/* Title — serif, lightweight, lowercase feel */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-5xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-white leading-[1.08]"
          >
            Dressed<br />for stillness.
          </motion.h1>

          {/* Subtitle — short, calm */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm text-neutral-400 font-light leading-relaxed max-w-sm"
          >
            Minimal cuts. Natural fabrics. Clothes made to wear slowly.
          </motion.p>

          {/* CTAs */}
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
              Shop now
            </Link>
            <Link
              href="/lookbook"
              className="text-[10px] tracking-[0.14em] uppercase text-white border-b border-neutral-700 pb-0.5 hover:text-white hover:border-white transition-colors duration-200"
            >
              View lookbook
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Bottom bar — fabrics + collections link */}
      <div className="relative z-10 border-t border-white/[0.06] px-6 sm:px-12 lg:px-20 py-5 flex items-center justify-between">
        <div className="flex gap-8">
          {FABRIC_TAGS.map((tag) => (
            <span key={tag} className="text-[10px] tracking-[0.18em] text-neutral-100 uppercase">
              {tag}
            </span>
          ))}
        </div>
        <Link
          href="/collections"
          className="text-[10px] tracking-[0.14em] uppercase text-neutral-100 border border-white/10 hover:border-white/30 px-5 py-2.5 transition-colors duration-200"
        >
          Collections
        </Link>
      </div>

    </section>
  );
}