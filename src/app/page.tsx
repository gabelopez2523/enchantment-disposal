import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="min-h-[70vh] grid grid-cols-1 md:grid-cols-2 bg-white pb-10">
        {/* LEFT: Text block */}
        <div className="flex flex-col items-center justify-center text-center px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold mb-6 whitespace-nowrap text-[#BF0A30]">
              Welcome to Enchantment Disposal
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Reliable dumpster rentals and professional trash disposal for residential and commercial projects.
            </p>
            <div className="text-center">
              <h2 className="text-2xl font-bold mt-6 mb-2">Trash is our Business</h2>
              <p className="text-lg text-gray-700 mb-8">
                Recycling and waste services made simple for a more sustainable household, we deliver reliable
                environmental services you need for a cleaner, healthier home.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="bg-red-700 hover:bg-dark-red-800 text-white font-semibold px-6 py-3 rounded shadow"
              >
                Contact Us
              </Link>
              <Link
                href="/services"
                className="bg-white border border-red-700 text-red-700 hover:bg-green-50 font-semibold px-6 py-3 rounded shadow"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
        {/* RIGHT: Image */}
        <div
          className="min-h-[40vh] md:min-h-full bg-cover bg-center rounded-lg"
          style={{ backgroundImage: "url('/images/background.png')" }}
          aria-label="Waste management trucks"
        />
      </section>

      {/* Our Guarantee Section */}
      <section className="bg-white pb-4 px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-8 text-red-700">Our Guarantee</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow">
              <h3 className="text-xl font-semibold mb-2">Customer Focused</h3>
              <p className="text-gray-700">
                We place our customers at the center of what we do and aspire to delight them every day.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow">
              <h3 className="text-xl font-semibold mb-2">Integrity</h3>
              <p className="text-gray-700">
                We are committed to maintaining accountability, integrity, trustworthiness, ethical standards,
                and compliance in all aspects of our actions.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow">
              <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
              <p className="text-gray-700">
                Our commitment to sustainability drives our daily actions, from assisting customers in
                achieving their sustainability objectives to providing services and solutions that contribute
                to a more sustainable world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <section className="bg-white py-10 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-8 text-red-700">What Our Customers Are Saying</h2>
          <div className="elfsight-app-06d29834-5d32-496d-91c1-403b5bcb4175"></div> {/* Replace with your actual Elfsight app ID */}
        </div>
        <script src={process.env.GOOGLE_REVIEWS} defer></script>
      </section>
    </>
  );
}