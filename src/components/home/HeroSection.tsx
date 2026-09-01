import Link from "next/link";

export default function HeroSection() {
  return <section className="relative isolate min-h-[560px] overflow-hidden bg-brand-green-dark text-white sm:min-h-[620px]">
    <video autoPlay muted loop playsInline poster="/images/home/hero-model.png" className="absolute inset-0 h-full w-full object-cover object-center" aria-hidden="true">
      <source src="/images/home/hero.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,42,32,.96)_0%,rgba(8,42,32,.8)_40%,rgba(8,42,32,.16)_100%)]" />
    <div className="brand-pattern relative mx-auto flex min-h-[560px] max-w-[1440px] items-center px-5 py-20 sm:min-h-[620px] sm:px-8 lg:px-12">
      <div className="max-w-2xl">
        <p className="mb-5 text-[11px] font-semibold tracking-[0.32em] text-brand-gold">QURZAIB FABRICS</p>
        <h1 className="font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">Timeless Fabrics,<br /><span className="text-brand-gold">Divine Elegance</span></h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-white/80 sm:text-lg">Premium fabrics crafted for your style and comfort.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/new-arrivals" className="bg-accent px-6 py-3.5 text-[11px] font-bold tracking-[0.14em] text-white transition hover:bg-accent-dark">Shop New Arrivals</Link>
          <Link href="/collections" className="border border-white/40 px-6 py-3.5 text-[11px] font-bold tracking-[0.14em] text-white transition hover:border-brand-gold hover:text-brand-gold">Explore Collections</Link>
        </div>
      </div>
    </div>
  </section>;
}
