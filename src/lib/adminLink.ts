// Signs/verifies the one-click approve/reject links sent in the
// pending-verification admin email, so /api/admin/verify can trust the
// `action` + `reservationId` in the URL without requiring a login.

import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type AdminAction = "approve" | "reject" | "cancel";

interface TokenPayload {
  reservationId: string;
  action: AdminAction;
  exp: number; // epoch ms
}

function getSecret(): string {
  const secret = process.env.ADMIN_ACTION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_ACTION_SECRET environment variable is not set.");
  }
  return secret;
}

function base64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("hex");
}

export function createAdminActionToken(reservationId: string, action: AdminAction): string {
  const payload: TokenPayload = { reservationId, action, exp: Date.now() + TOKEN_TTL_MS };
  const payloadB64 = base64url(JSON.stringify(payload));
  const signature = sign(payloadB64, getSecret());
  return `${payloadB64}.${signature}`;
}

export function verifyAdminActionToken(token: string): TokenPayload | null {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64, getSecret());
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as TokenPayload;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    if (payload.action !== "approve" && payload.action !== "reject" && payload.action !== "cancel")
      return null;
    if (typeof payload.reservationId !== "string" || !payload.reservationId) return null;
    return payload;
  } catch {
    return null;
  }
}
