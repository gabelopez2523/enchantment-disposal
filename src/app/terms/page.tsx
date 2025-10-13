import React from "react";

export default function TermsPage() {
  return (
    <main className="bg-white text-gray-800 px-6 py-12 md:px-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#BF0A30] mb-6">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last Updated: October 9, 2025</p>

        <p className="mb-6">
          Welcome to <strong>Enchantment Disposal LLC</strong>! These Terms and Conditions outline the rules and
          regulations for using our website,{" "}
          <a
            href="https://www.enchantmentdisposal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#BF0A30] hover:underline"
          >
            www.enchantmentdisposal.com
          </a>.
        </p>

        <p className="mb-6">
          By accessing or using this website, you agree to comply with these Terms and all applicable laws. If
          you do not agree, please do not use our site or services.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">1. Use of Our Website</h2>
        <p className="mb-6">
          You may use our website for lawful purposes only. You agree not to:
        </p>
        <ul className="list-disc ml-8 mb-6">
          <li>Submit false or misleading information through contact forms</li>
          <li>Attempt to interfere with the website’s functionality or security</li>
          <li>Use our site to transmit harmful code or spam</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">2. Services and Pricing</h2>
        <p className="mb-6">
          We make every effort to keep our service descriptions and pricing accurate and up to date. However,
          Enchantment Disposal LLC reserves the right to modify, suspend, or discontinue any service or pricing
          at any time without notice.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">3. Limitation of Liability</h2>
        <p className="mb-6">
          Enchantment Disposal LLC strives to ensure the accuracy of the information presented on this site.
          However, we make no guarantees, warranties, or representations about its completeness or suitability
          for any purpose. We are not liable for any damages arising from your use or inability to use the site.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">4. Intellectual Property</h2>
        <p className="mb-6">
          All logos, images, text, and other content on this website are the property of Enchantment Disposal
          LLC unless otherwise noted. You may not reproduce, distribute, or use our materials without written
          permission.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">5. Links to Other Websites</h2>
        <p className="mb-6">
          Our website may contain links to external websites. We are not responsible for the content or
          practices of any third-party sites.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">6. Changes to These Terms</h2>
        <p className="mb-6">
          We may update these Terms & Conditions periodically. Any changes will be posted on this page with an
          updated “Last Updated” date.
        </p>

        <h2 className="text-2xl font-semibold text-[#BF0A30] mt-10 mb-3">7. Contact Us</h2>
        <p className="mb-6">
          If you have any questions about these Terms, please contact us at:
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