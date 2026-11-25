import { Resend } from "resend";
import { serviceAreas } from "@/data/serviceAreas";
import { binInventory } from "@/data/binInventory";
import { emailAreaLabel, emailPlanLabel } from "@/lib/email/emailLabels";
import type { waitlist } from "@/lib/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

function checkEnv(): { toEmail: string; apiKey: string } | null {
  const toEmail = process.env.SEND_TO;
  const apiKey = process.env.RESEND_API_KEY;
  if (!toEmail) {
    console.error("SEND_TO environment variable is not set");
    return null;
  }
  if (!apiKey) {
    console.error("RESEND_API_KEY environment variable is not set");
    return null;
  }
  return { toEmail, apiKey };
}

function wrapper(headline: string, bodyHtml: string): string {
  return `
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
        <div class="header"><h2>${headline}</h2></div>
        <div class="content">${bodyHtml}</div>
        <div class="footer">
          <p>Received at: ${new Date().toLocaleString("en-US", { timeZone: "America/Denver" })}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sent the moment someone joins the waitlist (out-of-stock bin size at
 * signup) — mirrors sendPendingVerificationEmail.ts's Resend integration.
 */
export async function sendWaitlistJoinedEmail(
  entry: typeof waitlist.$inferSelect
): Promise<{ success: boolean; error?: string }> {
  const env = checkEnv();
  if (!env) return { success: false, error: "Server configuration error." };

  const areaName = emailAreaLabel(
    entry.serviceAreaId,
    serviceAreas.find((a) => a.id === entry.serviceAreaId)?.name ?? entry.serviceAreaId
  );
  const planLabel = emailPlanLabel(entry.planId);
  const name = sanitizeInput(entry.customerName);
  const email = sanitizeInput(entry.customerEmail);
  const phone = entry.customerPhone ? sanitizeInput(entry.customerPhone) : "N/A";
  const address = sanitizeInput(entry.addressRaw);

  try {
    const { data, error } = await resend.emails.send({
      from: "Enchantment Disposal <no-reply@enchantmentdisposal.com>",
      to: [env.toEmail],
      replyTo: email,
      subject: `New waitlist signup: ${name} (${planLabel})`,
      html: wrapper(
        "New Waitlist Signup",
        `
          <div class="field"><div class="label">Plan (out of stock):</div><div class="value">${sanitizeInput(planLabel)}</div></div>
          <div class="field"><div class="label">Service Area:</div><div class="value">${sanitizeInput(areaName)}</div></div>
          <div class="field"><div class="label">Customer:</div><div class="value">${name}</div></div>
          <div class="field"><div class="label">Email:</div><div class="value"><a href="mailto:${email}">${email}</a></div></div>
          <div class="field"><div class="label">Phone:</div><div class="value">${phone}</div></div>
          <div class="field"><div class="label">Address:</div><div class="value">${address}</div></div>
        `
      ),
      text: `New Waitlist Signup\n\nPlan (out of stock): ${planLabel}\nService Area: ${areaName}\nCustomer: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}`,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: "Failed to send waitlist notification email." };
    }
    console.log(`Waitlist-joined email sent. ID: ${data?.id}`);
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in sendWaitlistJoinedEmail:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Sent whenever a bin unit frees up (cancellation, rejection, or an
 * abandoned hold expiring) and someone is actually waiting for that size —
 * triggered from releaseHeldSlot in reservations.ts. Lists everyone
 * waiting, oldest first, so the admin can work down the list manually.
 */
export async function sendSlotAvailableEmail(
  binSize: string,
  waiting: (typeof waitlist.$inferSelect)[]
): Promise<{ success: boolean; error?: string }> {
  if (waiting.length === 0) return { success: true };

  const env = checkEnv();
  if (!env) return { success: false, error: "Server configuration error." };

  const binLabel = binInventory.find((b) => b.id === binSize)?.label ?? binSize;

  const rowsHtml = waiting
    .map((w, i) => {
      const name = sanitizeInput(w.customerName);
      const email = sanitizeInput(w.customerEmail);
      const phone = w.customerPhone ? sanitizeInput(w.customerPhone) : "N/A";
      const planLabel = emailPlanLabel(w.planId);
      const waitingSince = new Date(w.createdAt).toLocaleDateString("en-US");
      return `
        <div class="field">
          <div class="label">#${i + 1} — ${name}${i === 0 ? " (longest waiting)" : ""}</div>
          <div class="value">
            ${planLabel}<br>
            <a href="mailto:${email}">${email}</a> — ${phone}<br>
            Waiting since ${waitingSince}
          </div>
        </div>
      `;
    })
    .join("");

  const rowsText = waiting
    .map((w, i) => {
      const waitingSince = new Date(w.createdAt).toLocaleDateString("en-US");
      return `#${i + 1} ${w.customerName}${i === 0 ? " (longest waiting)" : ""} — ${emailPlanLabel(w.planId)} — ${w.customerEmail} — ${w.customerPhone ?? "N/A"} — waiting since ${waitingSince}`;
    })
    .join("\n");

  try {
    const { data, error } = await resend.emails.send({
      from: "Enchantment Disposal <no-reply@enchantmentdisposal.com>",
      to: [env.toEmail],
      subject: `A ${binLabel} slot opened up — ${waiting.length} on the waitlist`,
      html: wrapper(
        `${sanitizeInput(binLabel)} Slot Available`,
        `
          <p>A ${sanitizeInput(binLabel)} unit just freed up, and ${waiting.length} customer${waiting.length === 1 ? " is" : "s are"} on the waitlist for it. Reach out starting with whoever's been waiting longest.</p>
          ${rowsHtml}
          <p style="margin-top:20px;">Use the <strong>New Signup</strong> page in the dashboard to sign them up once you've confirmed.</p>
        `
      ),
      text: `A ${binLabel} unit just freed up. Waitlist (oldest first):\n\n${rowsText}\n\nUse the New Signup page in the dashboard once confirmed.`,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: "Failed to send slot-available email." };
    }
    console.log(`Slot-available email sent. ID: ${data?.id}`);
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in sendSlotAvailableEmail:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
