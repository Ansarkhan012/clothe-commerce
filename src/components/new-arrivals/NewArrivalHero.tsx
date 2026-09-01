import Image from "next/image";

export function NewArrivalHero() {
  return (
    <section className="relative h-[46vh] min-h-[380px] sm:h-[56vh] flex items-center justify-center overflow-hidden bg-brand-green-dark">
      
      {/* 1. BACKGROUND IMAGE */}
      <Image
        src="/images/banner/new-arrivals.png"
        alt="QurZaib Fabrics new arrivals"
        fill
        priority
        className="object-cover object-center"
      />

     
      <div className="absolute inset-0 bg-brand-green-dark/60" />

      {/* 3. CONTENT AREA */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <span className="text-brand-gold text-xs font-medium tracking-[0.3em] uppercase block mb-3">
          Just Landed
        </span>
        
        <h1 className="font-display text-5xl sm:text-6xl font-normal text-white mb-6">
          New Arrivals
        </h1>
        
        <p className="text-neutral-200 max-w-xl mx-auto text-sm sm:text-base tracking-wide font-light leading-relaxed">
          Discover the latest QurZaib Fabrics collection, thoughtfully selected for timeless Pakistani style.
        </p>
      </div>

    </section>
  );
}
