"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createManualSignup } from "./actions";
import { serviceAreas } from "@/data/serviceAreas";

// Same SSR workaround as src/app/signup/page.tsx — @mapbox/search-js-react
// touches `document` at module load.
const AddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.AddressAutofill),
  { ssr: false }
);

const MAPBOX_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export default function AdminNewSignupPage() {
  const [formData, setFormData] = useState({
    planId: "",
    name: "",
    email: "",
    phone: "",
    stripePaymentIntentId: "",
  });

  const addressInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Set while the "outside service area" confirmation is showing — holds
  // the address so the "Yes" button knows what to resubmit.
  const [confirmAddress, setConfirmAddress] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const attemptSignup = async (address: string, overrideOutsideArea: boolean) => {
    try {
      const result = await createManualSignup({
        ...formData,
        address,
        stripePaymentIntentId: formData.stripePaymentIntentId || undefined,
        overrideOutsideArea,
      });

      if (result.success) {
        setSuccess(
          `Reservation ${result.reservationId} created — an admin notification email has been sent.`
        );
        setFormData({ planId: "", name: "", email: "", phone: "", stripePaymentIntentId: "" });
        if (addressInputRef.current) addressInputRef.current.value = "";
        return;
      }

      // Let an admin override the service-area boundary by discretion — show
      // an inline confirmation (styled like the rest of the app, rather than
      // a native browser dialog) and resubmit with the override set if
      // they confirm.
      if (result.errorCode === "outside_service_area" && !overrideOutsideArea) {
        setConfirmAddress(address);
        return;
      }

      setError(result.error);
    } catch (err) {
      console.error("Manual signup submission error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setConfirmAddress(null);

    const address = addressInputRef.current?.value.trim() ?? "";
    if (!address) {
      setError("Please provide a full street address.");
      return;
    }

    startTransition(() => attemptSignup(address, false));
  };

  const handleConfirmOverride = () => {
    if (!confirmAddress) return;
    const address = confirmAddress;
    setConfirmAddress(null);
    startTransition(() => attemptSignup(address, true));
  };

  const handleCancelOverride = () => {
    setConfirmAddress(null);
    setError("That address is outside the current service area.");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">New Phone/Email Signup</h1>
      <p className="text-sm text-gray-600 mb-6">
        Web equivalent of <code>npm run signup:manual</code> — runs the same geocode/reserve
        pipeline and sends the same admin approval email, with Source shown as
        Phone/Email.
      </p>

      <form className="space-y-4 max-w-xl" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
            {success}
          </div>
        )}

        <select
          className="w-full border border-gray-300 p-3 rounded text-black text-sm"
          name="planId"
          value={formData.planId}
          onChange={handleChange}
          required
          disabled={isPending}
        >
          <option value="">Select a Plan</option>
          {serviceAreas.map((area) => (
            <optgroup key={area.id} label={area.name}>
              {area.plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.label} — {plan.monthlyPrice}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <input
          className="w-full border border-gray-300 p-3 rounded text-black text-sm"
          name="name"
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isPending}
        />
        <input
          className="w-full border border-gray-300 p-3 rounded text-black text-sm"
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isPending}
        />
        <input
          className="w-full border border-gray-300 p-3 rounded text-black text-sm"
          name="phone"
          type="tel"
          placeholder="Phone (optional)"
          value={formData.phone}
          onChange={handleChange}
          disabled={isPending}
        />

        <AddressAutofill
          accessToken={MAPBOX_PUBLIC_TOKEN}
          onRetrieve={(res) => {
            // AddressAutofill only fills address_line1 (the street) into a
            // single field by design — overwrite with full_address after its
            // own synchronous write, same fix as src/app/signup/page.tsx.
            const fullAddress = res.features[0]?.properties?.full_address;
            if (fullAddress && addressInputRef.current) {
              setTimeout(() => {
                if (addressInputRef.current) addressInputRef.current.value = fullAddress;
              }, 0);
            }
            setError(null);
          }}
        >
          <input
            className="w-full border border-gray-300 p-3 rounded text-black text-sm"
            ref={addressInputRef}
            name="address"
            type="text"
            autoComplete="address-line1"
            placeholder="Full Service Address (street, city, zip)"
            defaultValue=""
            onChange={() => setError(null)}
            required
            disabled={isPending}
          />
        </AddressAutofill>

        <input
          className="w-full border border-gray-300 p-3 rounded text-black text-sm"
          name="stripePaymentIntentId"
          type="text"
          placeholder="Stripe PaymentIntent id (optional, pi_...)"
          value={formData.stripePaymentIntentId}
          onChange={handleChange}
          disabled={isPending}
        />
        <p className="text-xs text-gray-500 -mt-2">
          Leave this blank for the normal phone/email signup flow — the signup fee is invoiced
          through QuickBooks, not Stripe, for these customers. Only fill this in on the rare
          case payment was collected via a manual-capture Stripe Payment Link or Virtual
          Terminal charge instead, so Approve/Reject can capture or cancel it automatically.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="!mt-6 bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-6 py-3 rounded shadow w-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isPending ? "Creating..." : "Create Reservation"}
        </button>
      </form>

      <Link href="/admin" className="inline-block mt-6 text-[#BF0A30] font-semibold hover:underline text-sm">
        ← Back to Reservations
      </Link>

      {confirmAddress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Outside Service Area</h2>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to service this address? It is currently outside of your
              defined service areas.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelOverride}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOverride}
                className="px-4 py-2 rounded bg-[#BF0A30] hover:bg-red-800 text-white font-semibold shadow transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
