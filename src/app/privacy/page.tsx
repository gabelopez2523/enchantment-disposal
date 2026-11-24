import React from "react";

export default function PrivacyPage() {
  return (
    <main className="bg-white text-gray-800 px-6 py-12 md:px-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#BF0A30] mb-6">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last Updated: November 23, 2026</p>

        <p className="mb-6">
          At <strong>Enchantment Disposal LLC</strong>, your privacy matters to us.
          This Privacy Policy explains how we collect, use, and protect the
          information you share with us through our website,
          <a
            href="https://www.enchantmentdisposal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#BF0A30] hover:underline"
          >
            {" "}www.enchantmentdisposal.com
          </a>.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">
          1. Information We Collect
        </h2>
        <ul className="list-disc ml-8 mb-6 space-y-2">
          <li>
            <strong>Contact inquiries.</strong> We collect your name, email address, phone number
            if provided, and any message or inquiry details you include.
          </li>
          <li>
            <strong>Residential signup and waitlist.</strong> We collect your name, email
            address, phone number if provided, service address, and selected plan, including
            service area and cart size. Online signup requires a phone number. We store signup
            and waitlist records with their status and relevant dates. When checking a signup
            address, we may also store the standardized address, latitude and longitude, and the
            result of our service area check.
          </li>
          <li>
            <strong>Checkout.</strong> Stripe collects your card details and any billing
            information it requests through Stripe Checkout. We provide Stripe with your email
            address and reservation reference. We receive and store payment and authorization
            status and Stripe identifiers for your checkout, customer record, and payment.
            Our website does not receive or store your full card number or security code.
          </li>
          <li>
            <strong>Security and website usage.</strong> We use IP addresses and request times
            to limit repeated signup and waitlist attempts. Cloudflare Turnstile processes
            verification information, which may include your IP address and browser signals,
            to help prevent automated submissions. We use Vercel Web Analytics to measure site
            visits and understand how people use the website.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">
          2. How We Use Your Information
        </h2>
        <p className="mb-6">
          We use your information to:
        </p>
        <ul className="list-disc ml-8 mb-6">
          <li>Respond to your questions, quotes, or service requests</li>
          <li>Provide updates or follow-ups related to your inquiry</li>
          <li>Check address eligibility and cart availability, review reservations, and manage the waitlist</li>
          <li>Process signup fee authorizations and charges and arrange monthly billing</li>
          <li>Send signup confirmations, availability notices, and other service communications</li>
          <li>Prevent abuse and understand and improve website and customer service performance</li>
        </ul>
        <p className="mb-6">
          We do not sell, rent, or share your information with third parties for marketing purposes.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">
          3. How We Protect Your Information
        </h2>
        <p className="mb-6">
          We take reasonable measures to protect your personal information from unauthorized
          access, alteration, disclosure, or destruction. While no online transmission is ever
          100% secure, we strive to use commercially acceptable means to safeguard your data.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">
          4. Sharing Your Information
        </h2>
        <p className="mb-4">
          We share information with service providers that help us operate the website and
          manage signup and service requests.
        </p>
        <ul className="list-disc ml-8 mb-6 space-y-2">
          <li>
            <a href="https://stripe.com/privacy" className="text-[#BF0A30] hover:underline">Stripe</a>
            {" "}processes checkout and signup fee payments.
          </li>
          <li>Mapbox provides address suggestions as you type and helps verify service addresses.</li>
          <li>Cloudflare Turnstile helps protect signup and waitlist forms from abuse.</li>
          <li>Neon hosts our signup and waitlist database, and Resend delivers service-related emails.</li>
          <li>Vercel provides website hosting and website usage analytics.</li>
        </ul>
        <p className="mb-6">
          We may also disclose information when necessary to comply with legal obligations or
          respond to lawful requests.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">
          5. Your Rights
        </h2>
        <p className="mb-6">
          You have the right to:
        </p>
        <ul className="list-disc ml-8 mb-6">
          <li>Request access to the information we hold about you</li>
          <li>Ask us to correct or delete your information</li>
          <li>Withdraw your consent at any time</li>
        </ul>
        <p className="mb-6">
          To make any of these requests, contact us at{" "}
          <a
            href="mailto:info@enchantmentdisposal.com"
            className="text-[#BF0A30] hover:underline"
          >
            info@enchantmentdisposal.com
          </a>.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">
          6. Links to Other Websites
        </h2>
        <p className="mb-6">
          Our website may include links to other sites (such as payment processors or review
          platforms). We are not responsible for the content or privacy practices of those websites.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">
          7. Updates to This Policy
        </h2>
        <p className="mb-6">
          We may update this Privacy Policy occasionally to reflect changes in our practices.
          The latest version will always be available on this page.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">
          8. Contact Us
        </h2>
        <p className="mb-4">
          If you have any questions or concerns about this Privacy Policy or how we handle your
          information, please reach out to us at:
        </p>
        <p className="font-medium">
          📧 <a href="mailto:info@enchantmentdisposal.com" className="text-[#BF0A30] hover:underline">info@enchantmentdisposal.com</a><br />
          📍 Enchantment Disposal LLC<br />
          Santa Fe, New Mexico
        </p>
      </div>
    </main>
  );
}
