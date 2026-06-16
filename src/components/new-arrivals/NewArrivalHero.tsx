import Image from "next/image";

export function NewArrivalHero() {
  return (
    <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden bg-neutral-900">
      
      {/* 1. BACKGROUND IMAGE */}
      <Image
        src="/images/banner/new-arrivals.png" // अपनी इमेज का सही पाथ (path) यहाँ डालें
        alt="Zaisha Fabrics New Arrivals"
        fill
        priority
        className="object-cover object-center"
      />

     
      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px]" />

      {/* 3. CONTENT AREA */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <span className="text-amber-400 text-xs sm:text-sm font-medium tracking-[0.3em] uppercase block mb-3">
          Just Landed
        </span>
        
        <h1 className="text-4xl sm:text-6xl font-light tracking-wide text-white uppercase font-serif mb-6">
          New Arrivals
        </h1>
        
        <p className="text-neutral-200 max-w-xl mx-auto text-sm sm:text-base tracking-wide font-light leading-relaxed">
          Be the first to shop our latest collection of premium Pakistani fashion. 
          Fresh designs, exclusive fabrics, limited quantities.
        </p>
      </div>

    </section>
  );
}