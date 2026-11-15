"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createCheckoutSession } from "./actions/createCheckoutSession";
import { serviceAreas } from "@/data/serviceAreas";

// @mapbox/search-js-react touches `document` at module load, which breaks
// Next's server-side prerendering even inside a "use client" component —
// load it client-only.
const AddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.AddressAutofill),
  { ssr: false }
);

// Public token, safe to expose client-side by design — never the secret
// token used server-side for the actual geocode/polygon check at submit
// time, which stays the real source of truth regardless of what's picked
// here.
const MAPBOX_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    planId: "",
    name: "",
    email: "",
    phone: "",
  });

  // Address is intentionally uncontrolled (per Mapbox's own AddressAutofill
  // pattern) — a React-controlled `value` fights with the library's own DOM
  // writes (it reads keystrokes to query suggestions and writes the chosen
  // suggestion back into the input directly), so we read the live DOM value
  // at submit time instead of mirroring it into state on every keystroke.
  const addressInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    setErrorCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);

    const address = addressInputRef.current?.value.trim() ?? "";
    if (!address) {
      setError("Please provide your full street address.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createCheckoutSession({ ...formData, address });

        if (result.success) {
          window.location.href = result.url;
        } else {
          setError(result.error);
          setErrorCode(
            "errorCode" in result && typeof result.errorCode === "string"
              ? result.errorCode
              : null
          );
        }
      } catch (err) {
        console.error("Signup submission error:", err);
        setError("Unable to start checkout. Please try again or contact us directly.");
      }
    });
  };

  // The server's message ends with "here." when it wants that word linked
  // to the contact form — split on it rather than duplicating the sentence
  // here, so the two copies of the text can't drift apart.
  const renderError = () => {
    if (!error) return null;
    if (errorCode === "outside_service_area") {
      const prefix = error.replace(/here\.$/, "");
      return (
        <>
          {prefix}
          <Link href="/contact" className="underline font-semibold">
            here
          </Link>
          .
        </>
      );
    }
    return error;
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full bg-[#BF0A30] py-6 sm:py-8 px-4 mb-6 text-center rounded text-white">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Sign Up for Weekly Pickup</h1>
      </div>

      <section className="pt-6 sm:pt-8 px-4 sm:px-8 pb-10 max-w-xl mx-auto">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-sm sm:text-base text-gray-700 text-center font-bold">
            Reserve your spot for weekly residential trash &amp; recycling service. We&apos;ll
            place a hold on your card for the one-time signup fee — it&apos;s only charged once
            we confirm your signup, usually within a business day.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {renderError()}
            </div>
          )}

          <select
            className="w-full border border-gray-300 p-3 rounded text-black text-sm sm:text-base"
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
            className="w-full border border-gray-300 p-3 rounded placeholder-gray-600 text-black text-sm sm:text-base"
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isPending}
          />
          <input
            className="w-full border border-gray-300 p-3 rounded placeholder-gray-600 text-black text-sm sm:text-base"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isPending}
          />
          <input
            className="w-full border border-gray-300 p-3 rounded placeholder-gray-600 text-black text-sm sm:text-base"
            name="phone"
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isPending}
          />
          <AddressAutofill
            accessToken={MAPBOX_PUBLIC_TOKEN}
            onRetrieve={(res) => {
              // AddressAutofill only fills address_line1 (the street) into a
              // single field by design — it's really meant for separate
              // line1/city/state/zip fields. Since we want the full address
              // in this one field, overwrite its own autofill with
              // full_address. This has to happen after the library's own
              // synchronous write (hence the 0ms timeout), or its write
              // clobbers ours.
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
              className="w-full border border-gray-300 p-3 rounded placeholder-gray-600 text-black text-sm sm:text-base"
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

          <button
            type="submit"
            disabled={isPending}
            className="!mt-8 bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-6 py-3 rounded shadow w-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isPending ? "Starting checkout..." : "Continue to Payment"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            On the next screen, our secure checkout will authorize (but not yet charge) your
            card for the one-time signup fee. We&apos;ll follow up separately to set up your
            recurring monthly billing.
          </p>
        </form>
      </section>
    </div>
  );
}
