import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Enchantment Disposal",
  description: "Dumpster rentals and disposal services in New Mexico.",
  icons: {
    icon: [
      { url: "favicon.ico", type: "image/x-icon" },
    ],
  },
};

//root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white">
      <body className="min-h-screen flex flex-col bg-white">
        <Header />

        <main className="flex-grow">{children}</main>

        <Footer />
        <Analytics />
      </body>
    </html>
  );
}