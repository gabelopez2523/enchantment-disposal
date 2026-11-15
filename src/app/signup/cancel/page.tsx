import Link from "next/link";

export default function SignupCancelPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="w-full bg-[#BF0A30] py-6 sm:py-8 px-4 mb-6 text-center rounded text-white">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Checkout Canceled</h1>
      </div>

      <section className="pt-6 sm:pt-8 px-4 sm:px-8 pb-10 max-w-xl mx-auto text-center space-y-4">
        <p className="text-gray-700">
          No charge was made and no signup was completed. You can start over whenever you&apos;re
          ready.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="inline-block bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-6 py-3 rounded shadow transition-opacity"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-block border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded shadow transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
