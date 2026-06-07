import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dmsans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CLASSIQ — Authored Womenswear",
  description:
    "CLASSIQ is a modern authored womenswear brand crafting refined pieces in soft neutrals — designed for the woman who dresses with intention.",
  openGraph: {
    title: "CLASSIQ — Authored Womenswear",
    description:
      "Modern authored womenswear in soft neutrals. Refined pieces designed for the woman who dresses with intention.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CLASSIQ — Authored Womenswear",
    description:
      "Modern authored womenswear in soft neutrals. Refined pieces designed for the woman who dresses with intention.",
  },
};

import CartDrawer from "@/components/site/CartDrawer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
