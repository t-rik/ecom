import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PixelScripts from "@/components/PixelScripts";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Pratiko Maroc | متجر المنتجات العصرية المبتكرة - الدفع عند الاستلام",
  description:
    "أفضل المنتجات المبتكرة للسيارة والمنزل بالمغرب مع ميزة التوصيل السريع والدفع نقداً عند الاستلام بعد المعاينة.",
  metadataBase: new URL("https://pratiko-maroc.com"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    siteName: "Pratiko Maroc",
    locale: "ar_MA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} scroll-smooth`}>
      <head>
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans bg-slate-50 text-gray-900 antialiased min-h-screen flex flex-col selection:bg-green-100 selection:text-green-800">
        <PixelScripts />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
