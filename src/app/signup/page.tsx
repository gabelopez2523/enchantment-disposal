"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import Link from "next/link";
import { createCheckoutSession } from "./actions/createCheckoutSession";
import { joinWaitlist } from "@/app/actions/joinWaitlist";
import { serviceAreas } from "@/data/serviceAreas";

declare global {
  interface Window {
    turnstile?: { reset: (container?: HTMLElement) => void };
  }
}

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

// Public site key, safe to expose client-side by design — the actual
// verification happens server-side against TURNSTILE_SECRET_KEY.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

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

  // Turnstile's implicit widget renders a hidden `cf-turnstile-response`
  // input inside this container and keeps it updated — read it the same
  // way the address field is read, straight from the DOM at submit time.
  const turnstileRef = useRef<HTMLDivElement>(null);

  const getTurnstileToken = () =>
    turnstileRef.current?.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')
      ?.value ?? "";

  // Turnstile tokens are single-use — after a failed attempt (whether the
  // captcha itself failed or the form was rejected for an unrelated reason),
  // the widget needs a fresh token before the next submit will work.
  const resetTurnstile = () => {
    if (typeof window !== "undefined" && window.turnstile && turnstileRef.current) {
      window.turnstile.reset(turnstileRef.current);
    }
  };

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [waitlistJoined, setWaitlistJoined] = useState(false);

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
    setWaitlistJoined(false);

    const address = addressInputRef.current?.value.trim() ?? "";
    if (!address) {
      setError("Please provide your full street address.");
      return;
    }

    const turnstileToken = getTurnstileToken();

    startTransition(async () => {
      try {
        const result = await createCheckoutSession({ ...formData, address, turnstileToken });

        if (result.success) {
          window.location.href = result.url;
        } else {
          setError(result.error);
          setErrorCode(
            "errorCode" in result && typeof result.errorCode === "string"
              ? result.errorCode
              : null
          );
          resetTurnstile();
        }
      } catch (err) {
        console.error("Signup submission error:", err);
        setError("Unable to start checkout. Please try again or contact us directly.");
        resetTurnstile();
      }
    });
  };

  const handleJoinWaitlist = () => {
    const address = addressInputRef.current?.value.trim() ?? "";
    const turnstileToken = getTurnstileToken();

    startTransition(async () => {
      try {
        const result = await joinWaitlist({ ...formData, address, turnstileToken });
        if (result.success) {
          setWaitlistJoined(true);
          setError(null);
          setErrorCode(null);
        } else {
          setError(result.error);
          resetTurnstile();
        }
      } catch (err) {
        console.error("Join waitlist error:", err);
        setError("Unable to join the waitlist. Please try again or contact us directly.");
        resetTurnstile();
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
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
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
              {errorCode === "out_of_stock" && (
                <button
                  type="button"
                  onClick={handleJoinWaitlist}
                  disabled={isPending}
                  className="mt-3 block w-full bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isPending ? "Joining..." : "Join the Waitlist"}
                </button>
              )}
            </div>
          )}

          {waitlistJoined && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              You&apos;re on the waitlist! We&apos;ll reach out as soon as a spot opens up.
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Plan</label>
            <p className="text-xs text-gray-500 mb-3">
              Pricing depends on your service area — pick the plan that matches your address below.
            </p>
            <div className="space-y-4">
              {serviceAreas.map((area) => (
                <div key={area.id}>
                  <h3 className="font-bold text-base text-[#BF0A30] mb-2">{area.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {area.plans.map((plan) => {
                      const isSelected = formData.planId === plan.id;
                      return (
                        <label
                          key={plan.id}
                          className={`flex flex-col gap-1 border rounded p-3 text-sm sm:text-base ${
                            isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          } ${
                            isSelected
                              ? "border-[#BF0A30] bg-red-50 ring-1 ring-[#BF0A30]"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <input
                            type="radio"
                            name="planId"
                            value={plan.id}
                            checked={isSelected}
                            onChange={handleChange}
                            required
                            disabled={isPending}
                            className="sr-only"
                          />
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                                isSelected ? "border-[#BF0A30] bg-[#BF0A30]" : "border-gray-400"
                              }`}
                            />
                            <span className="text-gray-900">{plan.label}</span>
                          </span>
                          <span className="font-semibold text-gray-900 pl-6">
                            {plan.monthlyPrice}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

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

          <div ref={turnstileRef} className="cf-turnstile flex justify-center" data-sitekey={TURNSTILE_SITE_KEY} />

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
