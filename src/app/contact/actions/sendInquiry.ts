"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Input validation helper
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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
    // Validate environment variables
    const toEmail = process.env.SEND_TO;
    const apiKey = process.env.RESEND_API_KEY;

    if (!toEmail) {
      console.error("SEND_TO environment variable is not set");
      return { 
        success: false, 
        error: "Server configuration error. Please contact us directly." 
      };
    }

    if (!apiKey) {
      console.error("RESEND_API_KEY environment variable is not set");
      return { 
        success: false, 
        error: "Server configuration error. Please contact us directly." 
      };
    }

    // Validate and sanitize inputs
    if (!name || name.trim().length < 2) {
      return { success: false, error: "Please provide a valid name." };
    }

    if (!email || !isValidEmail(email)) {
      return { success: false, error: "Please provide a valid email address." };
    }

    if (!message || message.trim().length < 10) {
      return { success: false, error: "Please provide a message (at least 10 characters)." };
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = phone ? sanitizeInput(phone) : "N/A";
    const sanitizedService = service ? sanitizeInput(service) : "N/A";
    const sanitizedMessage = sanitizeInput(message);

    // Rate limiting check (optional - implement if needed)
    // You could use a database or Redis to track submissions per IP/email

    // Send email
    const { data, error } = await resend.emails.send({
      from: "Enchantment Disposal <no-reply@enchantmentdisposal.com>",
      to: [toEmail],
      replyTo: sanitizedEmail, // Allows easy reply to customer
      subject: `New Inquiry from ${sanitizedName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #BF0A30; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #BF0A30; }
            .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #BF0A30; }
            .footer { margin-top: 20px; padding: 10px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Inquiry</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${sanitizedName}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${sanitizedPhone}</div>
              </div>
              <div class="field">
                <div class="label">Service Interested In:</div>
                <div class="value">${sanitizedService}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${sanitizedMessage.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p>This inquiry was submitted via the Enchantment Disposal contact form.</p>
              <p>Received at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Plain text fallback
      text: `
New Inquiry from Enchantment Disposal Contact Form

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Phone: ${sanitizedPhone}
Service: ${sanitizedService}
Message: ${sanitizedMessage}

Received at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })}
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { 
        success: false, 
        error: "Failed to send your message. Please try again or call us directly." 
      };
    }

    // Log success (optional - for analytics/monitoring)
    console.log(`Inquiry email sent successfully. ID: ${data?.id}`);

    return { 
      success: true,
      message: "Your inquiry has been sent successfully!"
    };

  } catch (err) {
    console.error("Unexpected error in sendInquiryEmail:", err);
    return { 
      success: false, 
      error: "An unexpected error occurred. Please contact us directly at (505) 795-3211." 
    };
  }
}