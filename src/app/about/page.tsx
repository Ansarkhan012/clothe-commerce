import { Award, Heart, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <span className="text-accent font-medium tracking-wider uppercase text-sm">Our Story</span>
        <h1 className="font-display text-5xl font-bold text-primary mt-2">About Zaisha&apos;s Fabrics</h1>
        <div className="w-16 h-0.5 bg-accent mx-auto mt-4" />
      </div>

      <div className="space-y-12 text-muted leading-relaxed">
        <p className="text-lg text-center max-w-2xl mx-auto">
          Founded in the heart of Karachi, Zari & Taanka celebrates the rich textile heritage 
          of Pakistan. We bring you authentic, high-quality fabrics that blend traditional 
          craftsmanship with modern elegance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            { icon: Award, title: "Quality", desc: "Premium fabrics sourced directly from top mills" },
            { icon: Heart, title: "Craftsmanship", desc: "Intricate embroidery by skilled artisans" },
            { icon: Globe, title: "Heritage", desc: "Celebrating Pakistani culture worldwide" },
          ].map((item) => (
            <div key={item.title} className="text-center p-6 bg-surface border border-border">
              <item.icon className="mx-auto text-accent mb-4" size={32} />
              <h3 className="font-display text-xl font-bold text-primary mb-2">{item.title}</h3>
              <p className="text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}