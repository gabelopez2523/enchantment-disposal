import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/business-logo.png"
                alt="Enchantment Disposal Logo"
                width={150}
                height={150}
                className="rounded"
              />
            </Link>
            <p className="text-sm text-gray-400">
              Reliable waste management and dumpster rental services for Santa Fe County since 2022.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#BF0A30] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-[#BF0A30] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#BF0A30] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#BF0A30] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-[#BF0A30] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Our Services</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Weekly Trash Service</li>
              <li>Dumpster Rentals</li>
              <li>14 Yard Dumpsters</li>
              <li>20 Yard Dumpsters</li>
              <li>Junk Removal</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <span className="font-semibold text-white">Phone:</span>
                <br />
                <a href="tel:5057953211" className="hover:text-[#BF0A30] transition-colors">
                  (505) 795-3211
                </a>
              </li>
              <li>
                <span className="font-semibold text-white">Email:</span>
                <br />
                <a href="mailto:info@enchantmentdisposal.com" className="hover:text-[#BF0A30] transition-colors break-words">
                  info@enchantmentdisposal.com
                </a>
              </li>
              <li>
                <span className="font-semibold text-white">Hours:</span>
                <br />
                Mon-Fri: 8:00am - 5:00pm
                <br />
                Sat: 8:00am - 12:00pm
                <br />
                Sun: Closed
              </li>
            </ul>
          </div>
        </div>

        {/* Licenses */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="text-xs sm:text-sm text-gray-400 text-center md:text-left">
            <p className="mb-2">
              <span className="font-semibold text-white">Licensed & Certified:</span> NMED License #0226840 | County Commercial Solid Waste Hauler License #9316 | City of Santa Fe License #233924
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
            © {new Date().getFullYear()} Enchantment Disposal. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-[#BF0A30] transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-[#BF0A30] transition-colors">Terms & Conditions</Link>
          </div>
          <p className="text-xs text-gray-400">
            Serving Santa Fe County, NM
          </p>
        </div>
      </div>
    </footer>
  );
}