import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSettings } from "@/lib/api";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Financial Tips & Govt Schemes India | Personal Finance",
  description: "Expert financial tips, government schemes, banking guides, and more.",
  keywords: "personal finance, government schemes, banking, loans, insurance, crypto, stock market, financial tips",
  authors: [{ name: "Financial Expert" }],
  openGraph: {
    title: "Financial Tips & Govt Schemes India",
    description: "Learn personal finance, government schemes, and banking in Hindi.",
    type: "website",
    locale: "hi_IN",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings().catch(() => ({}));
  const headerAd = settings?.ads_header || '';
  const footerAd = settings?.ads_footer || '';
  const adsenseVerification = settings?.adsense_verification || '';

  return (
    <html
      lang="hi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        {/* ✅ CSS को Preload करें और Render-blocking हटाएं (Media Print Hack) */}
        <link
          rel="preload"
          href="/_next/static/css/0gsb-ts32pm1j.css"
          as="style"
          fetchPriority="high"
        />
        <link
          rel="stylesheet"
          href="/_next/static/css/0gsb-ts32pm1j.css"
          media="print"
          onLoad="this.media='all'"
        />
        
        {/* ✅ AdSense – सबसे बाद में Load */}
        {adsenseVerification && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseVerification}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {headerAd && (
          <div 
            className="container mx-auto p-2 text-center"
            dangerouslySetInnerHTML={{ __html: headerAd }} 
          />
        )}
        <main className="flex-grow">{children}</main>
        {footerAd && (
          <div 
            className="container mx-auto p-2 text-center border-t"
            dangerouslySetInnerHTML={{ __html: footerAd }} 
          />
        )}
      </body>
    </html>
  );
}