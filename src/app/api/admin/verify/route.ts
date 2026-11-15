import { NextRequest, NextResponse } from "next/server";
import { verifyAdminActionToken } from "@/lib/adminLink";
import { approveReservation, cancelReservation, rejectReservation } from "@/lib/adminActions";

function htmlResponse(title: string, message: string, status = 200) {
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /><title>${title}</title></head>
      <body style="font-family: Arial, sans-serif; max-width: 480px; margin: 60px auto; text-align: center; color: #333;">
        <h2 style="color: #BF0A30;">${title}</h2>
        <p>${message}</p>
      </body>
    </html>`,
    { status, headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return htmlResponse("Missing token", "This verification link is incomplete.", 400);
  }

  const payload = verifyAdminActionToken(token);
  if (!payload) {
    return htmlResponse(
      "Link expired or invalid",
      "This verification link has expired or is no longer valid.",
      400
    );
  }

  // Shared with the admin dashboard (src/lib/adminActions.ts) so both entry
  // points produce identical side effects (Stripe capture/cancel, bin
  // release, notification emails).
  const result =
    payload.action === "cancel"
      ? await cancelReservation(payload.reservationId)
      : payload.action === "reject"
        ? await rejectReservation(payload.reservationId)
        : await approveReservation(payload.reservationId);

  const title = !result.ok
    ? "Already resolved"
    : payload.action === "cancel"
      ? "Service Canceled"
      : payload.action === "reject"
        ? "Rejected"
        : "Approved";

  return htmlResponse(title, result.message);
}
