import Image from "next/image";
import Link from "next/link";

function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 shrink-0"
            >
              <Image
                src="/images/logo.png"
                alt="Zaisha's Fabrics"
                width={220}
                height={220}
                className="h-20 sm:h-16 lg:h-20 w-auto object-contain"
                priority
              />
            </Link>

            <p className="mt-4 text-sm leading-7 text-neutral-600 max-w-md">
              Premium Pakistani fabrics crafted with elegance, tradition,
              and modern style. Discover timeless collections designed for
              every season.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mb-4">
              Shop
            </h4>

            <ul className="space-y-3 text-sm text-neutral-600">
              <li>
                <Link href="/new-arrivals" className="hover:text-black transition-colors">
                  New Arrivals
                </Link>
              </li>

              <li>
                <Link href="/collections" className="hover:text-black transition-colors">
                  Collections
                </Link>
              </li>

              <li>
                <Link href="/sale" className="hover:text-black transition-colors">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mb-4">
              Support
            </h4>

            <ul className="space-y-3 text-sm text-neutral-600">
              <li>
                <Link href="/about" className="hover:text-black transition-colors">
                  About Us
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-black transition-colors">
                  Contact Us
                </Link>
              </li>

              <li>
                <Link href="/track-order" className="hover:text-black transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-200 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 text-center md:text-left">
            © 2026 Zari & Taanka. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs text-neutral-500">
            <Link href="/privacy-policy" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>

            <Link href="/terms-and-conditions" className="hover:text-black transition-colors">
              Terms & Conditions
            </Link>

            <Link href="/shipping-policy" className="hover:text-black transition-colors">
              Shipping Policy
            </Link>

            <Link href="/return-refund-policy" className="hover:text-black transition-colors">
              Return & Refund Policy
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;