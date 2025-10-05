"use client"; // Needed because we're using state in a Client Component

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";


export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<"residential" | "commercial">(
    "residential"
  );

  return (
    <section className="min-h-screen p-8 max-w-10xl mx-auto flex-col bg-white">
     <div className="w-full bg-[#BF0A30] py-8 px-4 mb-6 text-center rounded text-white">
        <h1 className="text-4xl font-bold text-white">Our Services</h1>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center mb-8 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("residential")}
          className={`px-6 py-2 text-lg font-semibold ${
            activeTab === "residential"
              ? "border-b-4 text-[#BF0A30] border-[#BF0A30]"
              : "text-gray-600 hover:text-[#BF0A30]"
          }`}
        >
          Weekly Trash Service
        </button>
        <button
          onClick={() => setActiveTab("commercial")}
          className={`px-6 py-2 text-lg font-semibold ${
            activeTab === "commercial"
              ? "border-b-4 text-[#BF0A30] border-[#BF0A30]"
              : "text-gray-600 hover:text-[#BF0A30]"
          }`}
        >
          Dumpsters
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "residential" && (
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">Services Offerings</h2>
          <ul className="list-disc list-inside mb-6 text-gray-700">
            <li>We offer trash and recycling bins for residential homes. We service areas of Santa Fe county such as La Cienga, Galisteo, Agua Fria, Lamy, and Glorieta. We do NOT service the city of Santa Fe at this time.
            </li>
            <li>
              Our residential trash service is a bundle of one trash bin and one recycling bin. Customers can choose from two different sizes for both trash and recycling bins.
            </li>
            <li>
              Customers are able to get multiple bins as well but the cost is per bundle.
            </li>
          </ul>
          <h3 className="text-xl font-semibold mb-4">Service Breakdown:</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-300 text-gray-700 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Bin Size & Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Monthly Payment</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Pick up</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Recycling bin size</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Glorieta, in Santa Fe County</td>
                  <td className="border border-gray-300 px-4 py-2">64 Gallon Trash Bin</td>
                  <td className="border border-gray-300 px-4 py-2">$45, plus tax. Due the 1st of each month.</td>
                  <td className="border border-gray-300 px-4 py-2">Trash pick-up is weekly. Recycling is bi-weekly. Schedule pick up day is Friday.</td>
                  <td className="border border-gray-300 px-4 py-2">Customers receive a 45-gallon recycling bin.</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Glorieta, in Santa Fe County</td>
                  <td className="border border-gray-300 px-4 py-2">96 Gallon Trash Bin</td>
                  <td className="border border-gray-300 px-4 py-2">$65, plus tax. Due the 1st of each month.</td>
                  <td className="border border-gray-300 px-4 py-2">Trash pick-up is weekly. Recycling is bi-weekly. Schedule pick up day is Friday.</td>
                  <td className="border border-gray-300 px-4 py-2">Customers receive a 45-gallon recycling bin.</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Santa Fe County</td>
                  <td className="border border-gray-300 px-4 py-2">64 Gallon Trash Bin</td>
                  <td className="border border-gray-300 px-4 py-2">$35, plus tax. Due the 1st of each month.</td>
                  <td className="border border-gray-300 px-4 py-2">Trash pick-up is weekly. Recycling is bi-weekly. Schedule pick up day varies on address.</td>
                  <td className="border border-gray-300 px-4 py-2">Customers receive a 45-gallon recycling bin.</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Santa Fe County</td>
                  <td className="border border-gray-300 px-4 py-2">96 Gallon Trash Bin</td>
                  <td className="border border-gray-300 px-4 py-2">$40, plus tax. Due the 1st of each month.</td>
                  <td className="border border-gray-300 px-4 py-2">Trash pick-up is weekly. Recycling is bi-weekly. Schedule pick up day varies on address.</td>
                  <td className="border border-gray-300 px-4 py-2">Customers receive a 45-gallon recycling bin.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700">
            Delivery fees may vary by location. Contact us for exact quotes in your service area. For more information please fill out an inquiry form. 
      
            <Link
            href="/contact"
            className="bg-red-700 hover:bg-dark-red-800 text-white font-semibold px-2 py-2 rounded shadow ml-2"
           >
            Contact Us
          </Link>
          </p>
 
        </div>
      )}

      {activeTab === "commercial" && (
        <div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap- mb-6">
           
{/* <div className="flex flex-col md:flex-row justify-center items-center gap-0 mb-6"> */}
<div className="container md:flex md:flex-col lg:flex-row gap-2 items-start">
  <div className="flex-1 md:mt-4 mt-0 md:mr-2">
    <h2 className="text-2xl font-bold text-red-800 mb-2">Dumpster Services</h2>
    <p className="mb-2 text-gray-700">
      From large construction jobs to weekend home cleanups — we are here for contractors, businesses, and homeowners with bigger disposal needs and flexible rental options.
    </p>
  </div>
</div>
          </div>
          <h3 className="text-xl font-semibold mb-4">Service Breakdown:</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-300 text-gray-700 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Product & Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Rental Period</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Disposal Fee</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Extension for 7 days</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Pick-up & Return</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Travel Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">20 Yard Dumpster</td>
                  <td className="border border-gray-300 px-4 py-2">7 days</td>
                  <td className="border border-gray-300 px-4 py-2">$320 plus tax</td>
                  <td className="border border-gray-300 px-4 py-2">$62 per ton, plus 4% card fee. We do not charge tax, the landfill charges tax (Not included in rental price. Charged separately).</td>
                  <td className="border border-gray-300 px-4 py-2">$30 per day, plus tax</td>
                  <td className="border border-gray-300 px-4 py-2">Within rental period, customer is allowed to request a pick-up & return to original location for $120 plus tax. If located in Santa Fe. If located 30 minutes out of Santa Fe, pick-up & return is $220 plus tax. Price could vary on location.</td>
                  <td className="border border-gray-300 px-4 py-2">If location of delivery is 30 or more minutes away from Santa Fe travel fee is $220 plus tax. Price will vary depending on location if it’s one hour or more away.</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">14 Yard Dumpster</td>
                  <td className="border border-gray-300 px-4 py-2">7 days</td>
                  <td className="border border-gray-300 px-4 py-2">$290 plus tax</td>
                  <td className="border border-gray-300 px-4 py-2">$62 per ton, plus 4% card fee. We do not charge tax, the landfill charges tax. (Not included in rental price. Charged separately).</td>
                  <td className="border border-gray-300 px-4 py-2">$30 per day, plus tax</td>
                  <td className="border border-gray-300 px-4 py-2">Within rental period, customer is allowed to request a pick-up & return to original location for $120 plus tax. If located in Santa Fe. If located 30 minutes out of Santa Fe, pick-up & return is $220 plus tax. Price could vary on location.</td>
                  <td className="border border-gray-300 px-4 py-2">If location of delivery is 30 or more minutes away from Santa Fe travel fee is $220 plus tax. Price will vary depending on location if it’s one hour or more away.</td>
                </tr>
              </tbody>
            </table>
            <div className="flex flex-col md:flex-row justify-center gap-6 mt-6">
              <div className="flex flex-col items-center w-full md:w-1/2">
                <Image
                  src="/images/roll-off dumpster II.png"
                  alt="Roll-Off Dumpster 14 ft"
                  width={800}
                  height={600}
                  className="w-full h-80 rounded shadow object-cover"

                />
                <p className="text-sm text-gray-600 italic mt-2 text-center">14 ft Dumpster</p>
              </div>
              <div className="flex flex-col items-center w-full md:w-1/2">
                <Image
                  src="/images/roll-off dumpster III.jpeg"
                  alt="Roll-Off Dumpster 20 ft"
                  width={800}
                  height={600}
                  className="w-full h-80 rounded shadow object-cover"

                />
                <p className="text-sm text-gray-600 italic mt-2 text-center">20 ft Dumpster</p>
              </div>
            </div>
            <p className="mb-4 text-gray-700 font-bold">
              <br></br>If customers are interested in a continuous haul for a work site, hauls start at $150+. Please fill out an interest form if you are interested in this service, and we will contact you to get more information.
               <br></br>
               <br></br>
            <Link
            href="/contact"
            className="bg-red-700 hover:bg-dark-red-800 text-white font-semibold px-2 py-2 rounded shadow"
            >
              Contact Us
            </Link>
            </p>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Additional Notes and Guidelines:</h3>
          <ul className="list-disc list-inside mb-6 text-gray-700">
            <li>
              It is dangerous, irresponsible, and against the law to transport any overloaded dumpsters. We enforce a strict overload fee starting at $150.00 for any dumpster that is not “water level” or below the top rail. No exceptions! If any prohibited items are found, an $80.00 fine will be charged.
            </li>
            <li>
              Extra Charges: 
              <ul className="list-[square] pl-6 mt-2">
                <li>Television/Computers $15.00 per unit.</li>
                <li>Appliances with or without refrigerant $15.00 per unit</li>
                <li>These items will have to be put to the side and not inside the dumpster.</li>
              </ul>
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}