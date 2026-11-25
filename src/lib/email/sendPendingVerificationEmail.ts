import { Resend } from "resend";
import { serviceAreas } from "@/data/serviceAreas";
import { createAdminActionToken } from "@/lib/adminLink";
import { emailAreaLabel } from "@/lib/email/emailLabels";
import { getSiteUrl } from "@/lib/stripe";
import type { reservations } from "@/lib/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

const REASON_LABELS: Record<string, string> = {
  buffer_zone: "Address is just outside the service area boundary (within the verification buffer).",
  low_confidence: "Address geocoded with low confidence — double-check it's correct.",
  geocode_failed: "We couldn't automatically look up this address at all.",
  area_mismatch: "Address matches a different service area than the plan the customer selected.",
  awaiting_approval: "Address matched confidently — no concern, just routine sign-off before activating.",
  admin_override: "Address is outside every defined service area — an admin chose to service it anyway via the New Signup form's override.",
};

const SOURCE_LABELS: Record<string, string> = {
  online: "Online (/signup)",
  phone: "Phone/Email (entered manually)",
};

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Mirrors src/app/contact/actions/sendInquiry.ts's Resend integration
 * (same client instantiation, presence checks, and branded template style).
 * Triggered from the Stripe webhook when a checkout resolves to
 * pending_verification.
 */
export async function sendPendingVerificationEmail(
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
  const reasonLabel = REASON_LABELS[reservation.verificationReason ?? ""] ?? "Needs manual review.";
  const sourceLabel = SOURCE_LABELS[reservation.source] ?? reservation.source;

  const approveUrl = `${getSiteUrl()}/api/admin/verify?token=${encodeURIComponent(
    createAdminActionToken(reservation.id, "approve")
  )}`;
  const rejectUrl = `${getSiteUrl()}/api/admin/verify?token=${encodeURIComponent(
    createAdminActionToken(reservation.id, "reject")
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
      subject: `Action needed: review signup for ${name}`,
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
            .btn { display: inline-block; padding: 12px 24px; margin: 0 8px; border-radius: 4px; color: white; text-decoration: none; font-weight: bold; }
            .approve { background-color: #15803d; }
            .reject { background-color: #BF0A30; }
            .footer { margin-top: 20px; padding: 10px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Signup Needs Approval</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Reason:</div>
                <div class="value">${reasonLabel}</div>
              </div>
              <div class="field">
                <div class="label">Source:</div>
                <div class="value">${sanitizeInput(sourceLabel)}</div>
              </div>
              <div class="field">
                <div class="label">Matched Service Area:</div>
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
            </div>
            <div class="actions">
              <a class="btn approve" href="${approveUrl}">Approve</a>
              <a class="btn reject" href="${rejectUrl}">Reject</a>
            </div>
            <div class="footer">
              <p>The customer's card has been authorized but not charged yet, and a spot is being held — approve to charge it and activate service, or reject to release the hold (no charge is ever made).</p>
              <p>Received at: ${new Date().toLocaleString("en-US", { timeZone: "America/Denver" })}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Signup Needs Approval

Reason: ${reasonLabel}
Source: ${sourceLabel}
Matched Service Area: ${areaName}
Customer: ${name}
Email: ${email}
Phone: ${phone}
Address: ${address}

Approve: ${approveUrl}
Reject: ${rejectUrl}

Received at: ${new Date().toLocaleString("en-US", { timeZone: "America/Denver" })}
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: "Failed to send verification email." };
    }

    console.log(`Pending-verification email sent. ID: ${data?.id}`);
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in sendPendingVerificationEmail:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
