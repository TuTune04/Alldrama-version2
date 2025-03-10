import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { ClientProviders } from "@/app/providers/ClientProviders";
import Navbar from '@/components/navbar';
import { Footer } from '@/components/footer';
import Script from "next/script"; // Import Script từ Next.js
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AllDrama Movies",
  description: "Watch the latest drama films",
  icons: {
    icon: "/favicon.png",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-9G6QTCYQ3B" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9G6QTCYQ3B');
          `}
        </Script>

        {/* Chèn script popunder đầu tiên ngay trước thẻ đóng </head> */}
        {/* <script
          type="text/javascript"
          src="//punctuationbandycontradict.com/5b/37/32/5b37326563517fd77befc14a649b3002.js"
          async
        ></script> */}

      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ClientProviders>
            <Navbar />
              {children}
            <Footer />
          </ClientProviders>
        </ThemeProvider>
        {/* Social Banner Adsterra */}
        {/* <script 
          type="text/javascript" 
          src="//punctuationbandycontradict.com/41/2c/78/412c7823fde1808f4dead1cfc800a971.js"
          async
        ></script> */}
      </body>
    </html>
  );
}
