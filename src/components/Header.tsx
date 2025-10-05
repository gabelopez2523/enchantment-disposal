"use client"; // Mark this component as a Client Component!

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white text-black shadow-md border-b-4 border-[#BF0A30]">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/business-logo.png"
            alt="Enchantment Disposal Logo"
            width={170}
            height={170}
            className="rounded transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <nav className="flex gap-8 text-lg">
          {[
            { href: "/", label: "Home" },
            { href: "/services", label: "Services" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
            { href: "/faq", label: "FAQ" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-semibold relative transition-all duration-300 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-[#BF0A30] hover:after:w-full after:transition-all after:duration-300 ${
                pathname === href 
                  ? "text-[#BF0A30] after:w-full" 
                  : "text-gray-700 hover:text-[#BF0A30] after:w-0"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}