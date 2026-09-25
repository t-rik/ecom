import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PixelScripts from "@/components/PixelScripts";
import { LanguageProvider } from "@/context/LanguageContext";

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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
        {/* Meta Pixel (Synchronous early head init ensures early events are never lost) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1795033998462593');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className="font-sans bg-slate-50 text-gray-900 antialiased min-h-screen flex flex-col selection:bg-green-100 selection:text-green-800">
        <LanguageProvider>
          <PixelScripts />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
