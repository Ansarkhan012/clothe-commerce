import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";
import { Navbar } from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Newsletter from "../components/common/Newsletter";
import CookiePreferences from "../components/common/CookiePreferences";

export const metadata: Metadata = {
  title: { default: "QurZaib Fabrics | Premium Pakistani Fabrics", template: "%s | QurZaib Fabrics" },
  description: "Discover premium unstitched and embroidered fabrics from QurZaib Fabrics.",
  applicationName: "QurZaib Fabrics",
  openGraph: {
    title: "QurZaib Fabrics | Premium Pakistani Fabrics",
    description: "Discover premium unstitched and embroidered fabrics from QurZaib Fabrics.",
    siteName: "QurZaib Fabrics",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "QurZaib Fabrics", description: "Elegance Woven With Faith" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Newsletter />
          <Footer />
          <CookiePreferences />
        </Providers>
      </body>
    </html>
  );
}
