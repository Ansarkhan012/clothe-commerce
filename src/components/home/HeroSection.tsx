import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
 return <section className="relative min-h-[600px] w-full overflow-hidden sm:min-h-[680px] lg:min-h-[660px] lg:h-[calc(100svh-124px)] lg:max-h-[820px]">
  <Image src="/images/home/hero-model1.png" alt="Model wearing an elegant printed Qurzaib Fabrics ensemble" fill priority sizes="100vw" className="object-cover object-[40%_center] sm:object-[56%_center] lg:object-center"/>
  <div className="absolute inset-0 bg-gradient-to-r from-brand-cream via-brand-cream/90 to-brand-cream/15 sm:from-brand-cream/95 sm:via-brand-cream/68 sm:to-transparent lg:from-brand-cream/90 lg:via-brand-cream/45" aria-hidden="true"/>
  <div className="relative z-10 mx-auto flex h-full min-h-[600px] w-full max-w-[1440px] items-center px-5 py-16 sm:min-h-[680px] sm:px-8 lg:min-h-[660px] lg:px-12 lg:py-12">
   <div className="max-w-[620px]">
    <div className="mb-5 flex items-center gap-3"><span className="h-px w-9 bg-brand-gold-dark"/><p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-gold-dark">The New Collection</p></div>
    <h1 className="font-display text-[42px] leading-[1.02] tracking-[-0.035em] text-brand-charcoal sm:text-[56px] lg:text-[clamp(3.5rem,5.5vw,6.5rem)] lg:leading-[0.98]">Fabrics made for<br/><span className="italic text-brand-gold-dark">your finest moments.</span></h1>
    <p className="mt-7 max-w-[350px] text-base leading-7 text-[#514C45] sm:max-w-[560px] sm:text-[19px] sm:leading-8">Thoughtfully selected fabrics, timeless prints and elegant textures for every occasion.</p>
    <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"><Link href="/new-arrivals" className="inline-flex min-h-13 items-center justify-center bg-brand-charcoal px-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-black focus-visible:outline-brand-charcoal">Shop New Arrivals</Link><Link href="/collections" className="inline-flex min-h-13 items-center justify-center border border-brand-charcoal/45 bg-white/20 px-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-charcoal backdrop-blur-[2px] transition hover:border-brand-gold-dark hover:text-brand-gold-dark">Explore Collections</Link></div>
   </div>
  </div>
 </section>
}
