import { Resend } from "resend";
import { serviceAreas } from "@/data/serviceAreas";
import { createAdminActionToken } from "@/lib/adminLink";
import { emailAreaLabel, emailPlanLabel } from "@/lib/email/emailLabels";
import { getSiteUrl } from "@/lib/stripe";
import type { reservations } from "@/lib/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

const SOURCE_LABELS: Record<string, string> = {
  online: "Online (/signup)",
  phone: "Phone/Email (entered manually)",
};

/**
 * Mirrors src/app/contact/actions/sendInquiry.ts's Resend integration.
 * Sent whenever an admin approves a pending_verification reservation
 * (every signup goes through that gate now) — includes a one-click
 * "cancel" link, since this phase only collects the signup fee and has no
 * Stripe subscription to react to when service later ends.
 */
export async function sendActiveSignupEmail(
  reservation: typeof reservations.$inferSelect
): Promise<{ success: boolean; error?: string }> {
  const toEmail = process.env.SEND_TO;
  const apiKey = process.env.RESEND_API_KEY;

  if (!toEmail) {
    console.error("SEND_TO environment variable is not set");
    return { success: false, error: "Server configuration error." };
  }

  if (!apiKey) {
    console.error("RESEND_API_KEY environment variable is not set");
    return { success: false, error: "Server configuration error." };
  }

  const areaName = emailAreaLabel(
    reservation.serviceAreaId,
    serviceAreas.find((a) => a.id === reservation.serviceAreaId)?.name ?? reservation.serviceAreaId
  );
  const planLabel = emailPlanLabel(reservation.planId);
  const sourceLabel = SOURCE_LABELS[reservation.source] ?? reservation.source;

  const cancelUrl = `${getSiteUrl()}/api/admin/verify?token=${encodeURIComponent(
    createAdminActionToken(reservation.id, "cancel")
  )}`;

  const name = sanitizeInput(reservation.customerName);
  const email = sanitizeInput(reservation.customerEmail);
  const phone = reservation.customerPhone ? sanitizeInput(reservation.customerPhone) : "N/A";
  const address = sanitizeInput(reservation.addressFormatted ?? reservation.addressRaw);

  try {
    const { data, error } = await resend.emails.send({
      from: "Enchantment Disposal <no-reply@enchantmentdisposal.com>",
      to: [toEmail],
      replyTo: email,
      subject: `New signup: ${name} (${areaName})`,
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
            .actions { margin-top: 20px; text-align: center; }
            .btn { display: inline-block; padding: 12px 24px; border-radius: 4px; color: white; text-decoration: none; font-weight: bold; background-color: #BF0A30; }
            .footer { margin-top: 20px; padding: 10px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Signup — Signup Fee Paid</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Source:</div>
                <div class="value">${sanitizeInput(sourceLabel)}</div>
              </div>
              <div class="field">
                <div class="label">Service Area:</div>
                <div class="value">${sanitizeInput(areaName)}</div>
              </div>
              <div class="field">
                <div class="label">Customer:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${phone}</div>
              </div>
              <div class="field">
                <div class="label">Address:</div>
                <div class="value">${address}</div>
              </div>
              <div class="field">
                <div class="label">Plan:</div>
                <div class="value">${sanitizeInput(planLabel)}</div>
              </div>
            </div>
            <p style="text-align:center; color:#666; font-size: 14px;">
              Remember to set up this customer's recurring monthly billing manually — it isn't handled automatically yet.
            </p>
            <div class="actions">
              <a class="btn" href="${cancelUrl}">Cancel Service &amp; Release Slot</a>
            </div>
            <div class="footer">
              <p>Use the button above once this customer's service actually ends, so their spot frees up for someone else.</p>
              <p>Received at: ${new Date().toLocaleString("en-US", { timeZone: "America/Denver" })}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Signup — Signup Fee Paid

Source: ${sourceLabel}
Service Area: ${areaName}
Customer: ${name}
Email: ${email}
Phone: ${phone}
Address: ${address}
Plan: ${planLabel}

Remember to set up this customer's recurring monthly billing manually.

Cancel Service & Release Slot: ${cancelUrl}

Received at: ${new Date().toLocaleString("en-US", { timeZone: "America/Denver" })}
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: "Failed to send signup notification email." };
    }

    console.log(`Active-signup email sent. ID: ${data?.id}`);
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in sendActiveSignupEmail:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
