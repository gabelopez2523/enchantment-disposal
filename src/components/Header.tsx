"use client"; // Mark this component as a Client Component!

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">
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
              className={`relative transition-all duration-300 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-[#BF0A30] hover:after:w-full after:transition-all after:duration-300 ${
                pathname === href 
                  ? "text-[#BF0A30] after:w-full" 
                  : "text-gray-700 hover:text-[#BF0A30] after:w-0"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 z-50"
          aria-label="Toggle menu"
        >
          <span className={`block w-7 h-0.5 bg-[#BF0A30] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-7 h-0.5 bg-[#BF0A30] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-7 h-0.5 bg-[#BF0A30] transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <nav className="flex flex-col bg-white border-t border-gray-200">
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
              onClick={() => setIsMenuOpen(false)}
              className={`px-6 py-4 font-semibold transition-colors border-b border-gray-100 ${
                pathname === href 
                  ? "text-[#BF0A30] bg-red-50" 
                  : "text-gray-700 hover:text-[#BF0A30] hover:bg-gray-50"
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