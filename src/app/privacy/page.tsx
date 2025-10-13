import React from "react";

export default function PrivacyPage() {
  return (
    <main className="bg-white text-gray-800 px-6 py-12 md:px-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#BF0A30] mb-6">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last Updated: October 9, 2025</p>

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

        <p className="mb-6">
          By using our website or submitting information through our contact form, you
          agree to the terms described below.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">
          1. Information We Collect
        </h2>
        <p className="mb-4">
          We only collect the information you choose to share with us through our
          <strong> contact form</strong>, including:
        </p>
        <ul className="list-disc ml-8 mb-6">
          <li>Your name</li>
          <li>Your email address</li>
          <li>Your phone number (if provided)</li>
          <li>Any message or inquiry details you include</li>
        </ul>
        <p className="mb-6">
          We do not collect payment information, cookies, or analytics data at this time.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">
          2. How We Use Your Information
        </h2>
        <p className="mb-6">
          We use your information solely to:
        </p>
        <ul className="list-disc ml-8 mb-6">
          <li>Respond to your questions, quotes, or service requests</li>
          <li>Provide updates or follow-ups related to your inquiry</li>
          <li>Improve our customer service and communication</li>
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
        <p className="mb-6">
          We may share your information only when necessary to:
        </p>
        <ul className="list-disc ml-8 mb-6">
          <li>Comply with legal obligations or law enforcement requests</li>
          <li>
            Work with trusted service providers who help operate our website (e.g., email hosting),
            under strict confidentiality agreements
          </li>
        </ul>

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