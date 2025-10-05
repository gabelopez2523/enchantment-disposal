import "./globals.css";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white">
      <body className="min-h-screen flex flex-col bg-white">
        <Header />

        <main className="flex-grow container mx-auto p-4">{children}</main>

        <footer className="bg-gray-200 p-4 text-center text-black">
          &copy; {new Date().getFullYear()} Enchantment Disposal LLC. All rights reserved.
        </footer>
      </body>
    </html>
  );
}