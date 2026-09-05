import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";
import { StorefrontChrome } from "../components/layout/StorefrontChrome";

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
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased">
        <Providers>
          <StorefrontChrome>{children}</StorefrontChrome>
        </Providers>
      </body>
    </html>
  );
}
