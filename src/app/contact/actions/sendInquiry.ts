"use server";

import { Resend } from "resend";

//const resend = new Resend(process.env.RESEND_API_KEY); // Add this to .env
const resend = new Resend(process.env.RESEND_API_KEY); // Add this to .env


export async function sendInquiryEmail({
  name,
  email,
  phone,
  service,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
}) {
  try {
    const toEmail = process.env.SEND_TO; // ← change this to where you want inquiries sent
    if (!toEmail) {
      throw new Error("SEND_TO environment variable is not set.");
    }

    const { error } = await resend.emails.send({
      from: "Enchantment Disposal <no-reply@enchantmentdisposal.com>", // Use a verified domain if needed
      to: [toEmail],
      subject: "New Inquiry from Enchantment Disposal Contact Form",
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Service Interested In:</strong> ${service || "N/A"}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      throw new Error("Failed to send email.");
    }

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false };
  }
}