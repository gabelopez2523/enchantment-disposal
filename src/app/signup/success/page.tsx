import Link from "next/link";
import { getReservationBySessionId } from "@/lib/db/reservations";

export default async function SignupSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const reservation = session_id ? await getReservationBySessionId(session_id) : null;

  // The Stripe webhook that flips this reservation to pending_verification
  // can land a moment after the customer's browser redirect, so "pending_payment"
  // (or a missing reservation) is a normal, transient state here — not an error.
  // Every signup now needs admin approval before "active" (and before the
  // held authorization is actually charged), regardless of address.
  const status = reservation?.status ?? "pending_payment";

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full bg-[#BF0A30] py-6 sm:py-8 px-4 mb-6 text-center rounded text-white">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Thank You!</h1>
      </div>

      <section className="pt-6 sm:pt-8 px-4 sm:px-8 pb-10 max-w-xl mx-auto text-center space-y-4">
        {status === "pending_payment" && (
          <p className="text-gray-700">
            Your card has been authorized and we&apos;re finalizing your signup now. You&apos;ll
            get a confirmation email shortly — if you don&apos;t see one within a day, please
            contact us.
          </p>
        )}

        {status === "pending_verification" && reservation && (
          <p className="text-gray-700">
            We&apos;ve placed a hold on your card for the signup fee at{" "}
            <span className="font-semibold">{reservation.addressFormatted ?? reservation.addressRaw}</span>{" "}
            — it won&apos;t be charged until we confirm your signup, usually within a business
            day. We&apos;ll follow up by email or phone, then reach out separately to set up
            your recurring monthly billing.
          </p>
        )}

        {status === "active" && reservation && (
          <p className="text-gray-700">
            You&apos;re all set! Your signup at{" "}
            <span className="font-semibold">{reservation.addressFormatted ?? reservation.addressRaw}</span>{" "}
            is confirmed, your card has been charged for the signup fee, and your spot is
            reserved. We&apos;ll be in touch separately to set up your recurring monthly
            billing.
          </p>
        )}

        <Link
          href="/"
          className="inline-block bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-6 py-3 rounded shadow transition-opacity"
        >
          Back to Home
        </Link>
      </section>
    </div>
  );
}
