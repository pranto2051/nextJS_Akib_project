import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/layout/Providers";

const sora = Sora({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sora",
});

const manrope = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "KeekSurge — Software, Hardware & Mobile Solutions",
  description: "Hostel management platforms, enterprise software and custom business systems built in Dhaka since 2019.",
  authors: [{ name: "KeekSurge" }],
  openGraph: {
    type: "website",
    title: "KeekSurge — Software, Hardware & Mobile Solutions",
    description: "Hostel management platforms, enterprise software and custom business systems built in Dhaka since 2019.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const THEME_INIT = `(function(){try{var s=localStorage.getItem("hm-theme");var light=s?s==="light":!window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("light",light);document.documentElement.style.colorScheme=light?"light":"dark";}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${manrope.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
