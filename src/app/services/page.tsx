"use client"; // Needed because we're using state in a Client Component

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

function MapPinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M3 17h1a2 2 0 0 0 4 0h7a2 2 0 0 0 4 0h1v-4l-3-4h-4V7H3v10Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  );
}

function ChevronIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M12 9v4M12 17h.01M10.3 3.86 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.86a2 2 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BinPriceCard({ size, price, note }: { size: string; price: string; note: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{size}</p>
      <p className="text-2xl sm:text-3xl font-extrabold text-[#BF0A30] mt-1">
        {price}
        <span className="text-sm font-medium text-gray-500">/mo</span>
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{note}</p>
    </div>
  );
}

const residentialAreas = [
  {
    title: "Glorieta, Santa Fe County",
    pickup: "Trash weekly, recycling bi-weekly — pickup day is Friday",
    bins: [
      { size: "64 Gallon Trash Bin", price: "$45", note: "plus tax, due the 1st" },
      { size: "96 Gallon Trash Bin", price: "$65", note: "plus tax, due the 1st" },
    ],
  },
  {
    title: "Santa Fe County (surrounding areas)",
    pickup: "Trash weekly, recycling bi-weekly — pickup day varies by address",
    bins: [
      { size: "64 Gallon Trash Bin", price: "$35", note: "plus tax, due the 1st" },
      { size: "96 Gallon Trash Bin", price: "$40", note: "plus tax, due the 1st" },
    ],
  },
];

const dumpsters = [
  {
    title: "14 Yard Dumpster",
    image: "/images/roll-off dumpster II.jpg",
    alt: "Roll-Off Dumpster 14 yard",
    price: "$290",
    period: "7 days",
    extension: "$30 per day, plus tax",
    disposalFee:
      "$62 per ton, plus 4% card fee. We do not charge tax — the landfill charges tax (not included in rental price, charged separately).",
    pickupReturn:
      "Within the rental period, customers may request a pick-up & return to the original location for $120 plus tax if located in Santa Fe. If located 30 minutes outside Santa Fe, pick-up & return is $220 plus tax. Prices can vary by location.",
    travelFee:
      "If the delivery location is 30 or more minutes from Santa Fe, the travel fee is $220 plus tax. Price will vary depending on location if one hour or more away.",
  },
  {
    title: "20 Yard Dumpster",
    image: "/images/roll-off dumpster III.jpeg",
    alt: "Roll-Off Dumpster 20 yard",
    price: "$320",
    period: "7 days",
    extension: "$30 per day, plus tax",
    disposalFee:
      "$62 per ton, plus 4% card fee. We do not charge tax — the landfill charges tax (not included in rental price, charged separately).",
    pickupReturn:
      "Within the rental period, customers may request a pick-up & return to the original location for $120 plus tax if located in Santa Fe. If located 30 minutes outside Santa Fe, pick-up & return is $220 plus tax. Prices can vary by location.",
    travelFee:
      "If the delivery location is 30 or more minutes from Santa Fe, the travel fee is $220 plus tax. Price will vary depending on location if one hour or more away.",
  },
];

const dimensions = [
  { size: "14-Yard Dumpster", width: "7.5 ft", length: "14 ft", height: "4 ft" },
  { size: "20-Yard Dumpster", width: "7.5 ft", length: "14 ft", height: "5.5 ft (5 ft 6 in)" },
];

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<"residential" | "commercial">(
    "residential"
  );

  return (
    <section className="min-h-screen p-4 sm:p-6 md:p-8 max-w-7xl mx-auto flex-col bg-white">
      <div className="w-full bg-[#BF0A30] py-6 sm:py-8 px-4 mb-6 text-center rounded text-white">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Our Services</h1>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-6 sm:mb-8 gap-2 bg-gray-100 p-1.5 rounded-full max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("residential")}
          className={`flex-1 px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors ${
            activeTab === "residential"
              ? "bg-[#BF0A30] text-white shadow"
              : "text-gray-600 hover:text-[#BF0A30]"
          }`}
        >
          Weekly Trash Service
        </button>
        <button
          onClick={() => setActiveTab("commercial")}
          className={`flex-1 px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors ${
            activeTab === "commercial"
              ? "bg-[#BF0A30] text-white shadow"
              : "text-gray-600 hover:text-[#BF0A30]"
          }`}
        >
          Dumpsters
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "residential" && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-4">Services Offerings</h2>
          <ul className="list-disc list-inside mb-6 text-sm sm:text-base text-gray-700 space-y-2">
            <li>We offer trash and recycling bins for residential homes. We service areas of Santa Fe county such as La Cienga, Galisteo, Agua Fria, Lamy, and Glorieta. We do NOT service the city of Santa Fe at this time.
            </li>
            <li>
              Our residential trash service is a bundle of one trash bin and one recycling bin. Customers can choose from two trash bin sizes and will receive one 45-gallon recycling bin.
            </li>
            <li>
              Customers are able to get multiple bins as well but the cost is per bundle.
            </li>
          </ul>

          <h3 className="text-lg sm:text-xl font-semibold mb-4">Service Breakdown:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {residentialAreas.map((area) => (
              <div key={area.title} className="rounded-xl border border-gray-200 bg-gray-50 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <MapPinIcon className="w-4 h-4 text-[#BF0A30]" />
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">{area.title}</h4>
                </div>
                <p className="flex items-start gap-1.5 text-xs text-gray-500 mb-4">
                  <CalendarIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{area.pickup}</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {area.bins.map((bin) => (
                    <BinPriceCard key={bin.size} size={bin.size} price={bin.price} note={bin.note} />
                  ))}
                </div>
                <p className="flex items-center gap-1.5 text-xs text-gray-600 mt-4">
                  <CheckIcon className="w-3.5 h-3.5 text-green-700 shrink-0" />
                  Includes one 45-gallon recycling bin
                </p>
              </div>
            ))}
          </div>

          <p className="text-sm sm:text-base text-gray-700">
            Delivery fees may vary by location. Contact us for exact quotes in your service area. For more information please fill out an inquiry form.
            <Link
              href="/contact"
              className="inline-block bg-red-700 hover:bg-red-800 text-white font-semibold px-3 py-2 rounded shadow mt-2 sm:mt-0 sm:ml-2"
            >
              Contact Us
            </Link>
          </p>
        </div>
      )}

      {activeTab === "commercial" && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-red-800 mb-2">Dumpster Services</h2>
            <p className="mb-4 text-sm sm:text-base text-gray-700">
              From large construction jobs to weekend home cleanups — we are here for contractors, businesses, and homeowners with bigger disposal needs and flexible rental options.
            </p>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold mb-4">Service Breakdown:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4 sm:gap-6 mb-6">
            {dumpsters.map((d) => (
              <div
                key={d.title}
                className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                <Image
                  src={d.image}
                  alt={d.alt}
                  width={800}
                  height={600}
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TruckIcon className="w-5 h-5 text-[#BF0A30]" />
                    <h4 className="text-lg font-bold text-gray-900">{d.title}</h4>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#BF0A30]">
                    {d.price}
                    <span className="text-sm font-medium text-gray-500"> plus tax / {d.period}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700 mt-2">
                    Extension: <span className="font-medium">{d.extension}</span>
                  </p>

                  <details className="group mt-4 pt-3 border-t border-gray-200">
                    <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm text-[#BF0A30]">
                      Full pricing details
                      <ChevronIcon className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-3 space-y-3 text-xs sm:text-sm text-gray-700">
                      <p>
                        <span className="font-semibold text-gray-900">Disposal Fee: </span>
                        {d.disposalFee}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">Pick-up &amp; Return: </span>
                        {d.pickupReturn}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">Travel Fee: </span>
                        {d.travelFee}
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-4">Dumpster Dimensions:</h3>
          <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
            <table className="min-w-full text-gray-700 text-xs sm:text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">Dumpster Size</th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">Width</th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">Length</th>
                  <th className="px-3 sm:px-4 py-2 text-left font-semibold">Height</th>
                </tr>
              </thead>
              <tbody>
                {dimensions.map((row, i) => (
                  <tr key={row.size} className={i % 2 === 1 ? "bg-gray-50" : undefined}>
                    <td className="px-3 sm:px-4 py-2 font-medium">{row.size}</td>
                    <td className="px-3 sm:px-4 py-2">{row.width}</td>
                    <td className="px-3 sm:px-4 py-2">{row.length}</td>
                    <td className="px-3 sm:px-4 py-2">{row.height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-[#BF0A30]/30 bg-red-40 p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-between">
            <p className="text-sm sm:text-base text-gray-800 font-bold">
              Interested in a continuous haul for a work site? Hauls start at $150+. Fill out an interest form and we&apos;ll follow up with more information.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded shadow shrink-0 text-center"
            >
              Contact Us
            </Link>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold mb-4">Additional Notes and Guidelines:</h3>
          <div className="rounded-lg border border-amber-300 bg-amber-40 p-4 sm:p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertIcon className="w-5 h-5 text-amber-700 shrink-0" />
              <p className="font-semibold text-amber-900 text-sm sm:text-base">Please read before renting</p>
            </div>
            <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 space-y-2">
              <li>
                It is dangerous, irresponsible, and against the law to transport any overloaded dumpsters. We enforce a strict overload fee starting at $150.00 for any dumpster that is not &quot;water level&quot; or below the top rail. No exceptions! If any prohibited items are found, an $80.00 fine will be charged.
              </li>
              <li>
                Extra Charges:
                <ul className="list-[square] pl-6 mt-2 space-y-1">
                  <li>Television/Computers $15.00 per unit.</li>
                  <li>Appliances with or without refrigerant $15.00 per unit</li>
                  <li>These items will have to be set aside and not placed inside the dumpster.</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
