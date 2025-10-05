import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="min-h-screen md:min-h-[70vh] grid grid-cols-1 md:grid-cols-2 bg-white pb-10">
        {/* LEFT: Text block */}
        <div className="flex flex-col items-center justify-center text-center px-6 py-8 md:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-[#BF0A30]">
              Welcome to Enchantment Disposal
            </h1>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
              Reliable dumpster rentals and professional trash disposal for residential and commercial projects.
            </p>
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold mt-4 sm:mt-6 mb-2">Trash is our Business</h2>
              <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
                Recycling and waste services made simple for a more sustainable household, we deliver reliable
                environmental services you need for a cleaner, healthier home.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/contact"
                className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded shadow w-full sm:w-auto text-center"
              >
                Contact Us
              </Link>
              <Link
                href="/services"
                className="bg-white border border-red-700 text-red-700 hover:bg-red-50 font-semibold px-6 py-3 rounded shadow w-full sm:w-auto text-center"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
        {/* RIGHT: Image */}
        <div
          className="min-h-[50vh] md:min-h-full bg-cover bg-center rounded-lg order-first md:order-last"
          style={{ backgroundImage: "url('/images/background.jpg')" }}
          aria-label="Waste management trucks"
        />
      </section>

      {/* Our Guarantee Section */}
      <section className="bg-white pb-4 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-red-700">Our Guarantee</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Customer Focused</h3>
              <p className="text-sm sm:text-base text-gray-700">
                We place our customers at the center of what we do and aspire to delight them every day.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Integrity</h3>
              <p className="text-sm sm:text-base text-gray-700">
                We are committed to maintaining accountability, integrity, trustworthiness, ethical standards,
                and compliance in all aspects of our actions.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Sustainability</h3>
              <p className="text-sm sm:text-base text-gray-700">
                Our commitment to sustainability drives our daily actions, from assisting customers in
                achieving their sustainability objectives to providing services and solutions that contribute
                to a more sustainable world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <section className="bg-white py-8 sm:py-10 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 text-red-700">What Our Customers Are Saying</h2>
          <div className="elfsight-app-06d29834-5d32-496d-91c1-403b5bcb4175"></div>
        </div>
        <script src={process.env.GOOGLE_REVIEWS} defer></script>
      </section>
    </>
  );
}