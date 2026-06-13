import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import { Navbar } from "../components/layout/Navbar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zari & Taanka | Premium Pakistani Fashion",
  description: "Authentic Pakistani clothing - Lawn, Chiffon, Silk, and Embroidered Collections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

// Footer Component (same file for simplicity, move to components/layout/Footer.tsx if preferred)
function Footer() {
  return (
    <footer className="bg-primary text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-semibold text-accent">
              Zari & Taanka
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Bringing the finest Pakistani craftsmanship to your wardrobe. 
              Authentic fabrics, timeless designs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Collections</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/new-arrivals" className="hover:text-accent transition-colors">New Arrivals</a></li>
              <li><a href="/collections" className="hover:text-accent transition-colors">Lawn Collection</a></li>
              <li><a href="/collections" className="hover:text-accent transition-colors">Chiffon & Silk</a></li>
              <li><a href="/sale" className="hover:text-accent transition-colors">Sale</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/contact" className="hover:text-accent transition-colors">Contact Us</a></li>
              <li><a href="/about" className="hover:text-accent transition-colors">About Us</a></li>
              <li><span className="hover:text-accent transition-colors cursor-pointer">Shipping Policy</span></li>
              <li><span className="hover:text-accent transition-colors cursor-pointer">Return Policy</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>📍 Karachi, Pakistan</li>
              <li>📞 +92 300 1234567</li>
              <li>✉️ hello@zaritaanka.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/50">
          <p>© 2026 Zari & Taanka. All rights reserved. Crafted with ❤️ in Karachi.</p>
        </div>
      </div>
    </footer>
  );
}