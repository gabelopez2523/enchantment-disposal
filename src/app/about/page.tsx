import Image from "next/image";

export default function AboutPage() {
  return (
    <section className="min-h-screen p-4 sm:p-6 md:p-8 max-w-7xl mx-auto flex-col bg-white">
      <div className="w-full bg-[#BF0A30] py-6 sm:py-8 px-4 mb-6 text-center rounded text-white">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">About Enchantment Disposal</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-6 sm:mb-8">
        <div className="lg:w-2/3">
          <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-2">Who We Are</h2>
          <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
            Enchantment Disposal has proudly served Santa Fe County with reliable dumpster rental and waste disposal services since 2022. We are committed to helping homeowners and businesses keep their properties clean, safe, and compliant with local regulations. 
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-2">Our Mission</h2>
          <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
            We strive to provide affordable, timely, and trustworthy disposal solutions while delivering exceptional customer service.
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-2">Our Story</h2>
          <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
            We are a proud, family-owned and operated business, founded by a Santa Fe native who was born and raised in the heart of the Land of Enchantment. 
            Our deep roots in Santa Fe inspire everything we do — from our commitment to exceptional service to our dedication to supporting our local community. 
            With a genuine love for our home and its people, we strive to provide reliable, trustworthy, and personalized service that reflects the warmth and tradition of our city. 
            Enchantment Disposal began with a single truck and a mission to improve local sanitation. Today, we serve residential and commercial customers across northern NM, offering a range of dumpster sizes to meet every need.
          </p>
        </div>

        <div className="lg:w-1/3 flex justify-center lg:justify-start">
          <Image
            src="/images/about-page.jpg"
            alt="Enchantment Disposal Team"
            width={800}
            height={600}
            className="w-full max-w-sm h-auto rounded-lg shadow-lg object-cover"
          />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-2">Licenses & Certifications</h2>
      <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 space-y-1">
        <li>NMED License #0226840</li>
        <li>County Commercial Solid Waste Hauler License #9316</li>
        <li>City of Santa Fe License #233924</li>
      </ul>
    </section>
  );
}