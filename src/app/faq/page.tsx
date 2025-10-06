export default function FAQPage() {
  return (
    <section className="min-h-screen p-8 max-w-10xl mx-auto flex-col bg-white">
     <div className="w-full bg-[#BF0A30] py-8 px-4 mb-6 text-center rounded text-white">
        <h1 className="text-4xl font-bold text-white">Frequently Asked Questions</h1>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-700 mb-2">What items are prohibited from disposal?</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Dirt, Concrete, Asphalt, Rock, Sod, Bricks, Root Balls & Roofing Shingles</li>
            <li>Ammunition, Ash, Fireworks, & Fire Extinguishers</li>
            <li>Fuels/Oils, Gasoline, Diesel, Propane Tanks, or other Hazardous Combustibles</li>
            <li>Liquids, Wet Paint, & Tar</li>
            <li>Non-Household Batteries: Auto, Motorcycle, RV, Boat, etc.</li>
            <li>Deceased Animals, Animal Waste, or Hunting Refuse of any kind</li>
            <li>Tires of ANY size: Trikes to Semi</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-700 mb-2">How long is the standard dumpster rental period?</h2>
          <p className="text-gray-700">
            Our standard rental period is 7 days. Extended rentals are available for an additional fee — contact us for details.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-700 mb-2">What is included in the dumpster rental price?</h2>
          <p className="text-gray-700">
            Pricing includes dumpster drop-off, pickup, and rental period. Trash disposal (disposal of trash at facility) will be incurred separately. Delivery fees vary based on your location.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-700 mb-2">How soon can I schedule a dumpster delivery?</h2>
          <p className="text-gray-700">
            In most cases, we can deliver your dumpster within 24-48 hours. Contact us to confirm availability for your specific area and timeframe.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-700 mb-2">Do I need a permit for my dumpster?</h2>
          <p className="text-gray-700">
            Permits may be required if the dumpster will be placed on a public street. Check with your local municipality or contact us for guidance.
          </p>
        </div>
      </div>
    </section>
  );
}