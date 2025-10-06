"use client"; // The form uses state and interactivity

import { sendInquiryEmail } from "./actions/sendInquiry";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await sendInquiryEmail(formData);

    if (result?.success) {
      setFormData({ name: "", email: "", phone: "", service: "", message: "" });
      alert("Your inquiry has been submitted. We'll get back to you soon!");
    } else {
      alert("Something went wrong while sending your message. Please try again later.");
    }
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
          <input
            className="w-full border border-gray-300 p-3 rounded placeholder-gray-600 text-black text-sm sm:text-base"
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border border-gray-300 p-3 rounded placeholder-gray-600 text-black text-sm sm:text-base"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border border-gray-300 p-3 rounded placeholder-gray-600 text-black text-sm sm:text-base"
            name="phone"
            type="tel"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={handleChange}
          />
          <select
            className="w-full border border-gray-300 p-3 rounded text-black text-sm sm:text-base"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
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
          ></textarea>
          <button
            type="submit"
            className="bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-6 py-3 rounded shadow w-full"
          >
            Send Inquiry
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