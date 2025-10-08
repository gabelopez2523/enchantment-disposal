"use client";

import { sendInquiryEmail } from "./actions/sendInquiry";
import { useState, useTransition } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error on input change
    setSuccess(false); // Clear success message on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await sendInquiryEmail(formData);

        if (result?.success) {
          setFormData({ name: "", email: "", phone: "", service: "", message: "" });
          setSuccess(true);
        } else {
          setError(result?.error || "Something went wrong. Please try again.");
        }
      } catch (err) {
        console.error("Form submission error:", err);
        setError("Unable to send your message. Please try again or contact us directly.");
      }
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full bg-[#BF0A30] py-6 sm:py-8 px-4 mb-6 text-center rounded text-white">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Contact Us</h1>
      </div>
      
      <section className="pt-6 sm:pt-8 px-4 sm:px-8 pb-8 max-w-xl mx-auto">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-sm sm:text-base text-gray-700 text-center font-bold">
            Got questions or need a dumpster for your project? Reach out today for quick, dependable service and a free quote!
          </p>

          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Your inquiry has been submitted. We will get back to you soon!
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

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
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={handleChange}
            disabled={isPending}
          />
          <select
            className="w-full border border-gray-300 p-3 rounded text-black text-sm sm:text-base"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
            disabled={isPending}
          >
            <option value="">Select a Service</option>
            <option value="Weekly Trash Service">Weekly Trash Service</option>
            <option value="Dumpster Rentals">Dumpster Rentals</option>
            <option value="Junk Removal">Junk Removal</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            className="w-full border border-gray-300 p-3 rounded placeholder-gray-600 text-black text-sm sm:text-base"
            name="message"
            placeholder="Message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isPending}
          ></textarea>
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-6 py-3 rounded shadow w-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isPending ? "Sending..." : "Send Inquiry"}
          </button>
        </form>
      </section>

      <section className="bg-white pb-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-black mb-4 sm:mb-6 text-center">Our Contact Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-[#BF0A30] text-white px-4 sm:px-6 py-4 sm:py-6 rounded-lg shadow flex flex-col justify-start">
              <h6 className="text-base sm:text-lg font-semibold mb-2">Phone</h6>
              <p className="text-sm sm:text-base">(505) 795-3211</p>
            </div>
            <div className="bg-[#BF0A30] text-white px-4 sm:px-6 py-4 sm:py-6 rounded-lg shadow flex flex-col justify-start">
              <h6 className="text-base sm:text-lg font-semibold mb-2">Email</h6>
                <a
                  href="mailto:info@enchantmentdisposal.com"
                  className="underline hover:text-yellow-300 transition-colors text-sm sm:text-base break-words"
                >
                  info@enchantmentdisposal.com
                </a>
            </div>
            <div className="bg-[#BF0A30] text-white px-4 sm:px-6 py-4 sm:py-6 rounded-lg shadow flex flex-col justify-start">
              <h6 className="text-base sm:text-lg font-semibold mb-2">Office Hours</h6>
              <ul className="text-sm sm:text-base">
                <li>Mon-Fri: 8:00am - 5:00pm</li>
                <li>Saturday: 8:00am - 12:00pm</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 rounded overflow-hidden shadow">
            <iframe
              src="https://maps.google.com/maps?q=SantaFe%2C%20NM&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}