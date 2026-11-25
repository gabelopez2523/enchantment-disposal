// Signs/verifies the /admin login session cookie. Same HMAC pattern as
// src/lib/adminLink.ts's email action tokens, but signed with a separate
// secret (ADMIN_SESSION_SECRET) so rotating it to force everyone to log in
// again doesn't invalidate any in-flight email action links.

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { verifyTotpCode } from "./totp";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
// Just long enough to type a 6-digit code off a phone, short enough that an
// abandoned password step can't be resumed by someone else later.
const MFA_PENDING_TTL_MS = 5 * 60 * 1000;

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_MFA_PENDING_COOKIE = "admin_mfa_pending";

// `typ` binds each token to its one purpose — without it, both payloads are
// shaped identically ({ exp }) and signed with the same secret, so a
// pending-MFA token (issued after the password step alone) would also pass
// verifySessionToken(), letting anyone who knows just the password skip the
// authenticator-code step entirely by copying that cookie's value into
// admin_session. typ is part of the signed payload, so a token can't be
// relabeled without invalidating its signature.
interface SessionPayload {
  typ: "session";
  exp: number; // epoch ms
}

interface MfaPendingPayload {
  typ: "mfa_pending";
  exp: number; // epoch ms
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET environment variable is not set.");
  }
  return secret;
}

function base64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("hex");
}

export function createSessionToken(): string {
  const payload: SessionPayload = { typ: "session", exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = base64url(JSON.stringify(payload));
  const signature = sign(payloadB64, getSecret());
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const expected = sign(payloadB64, getSecret());
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SessionPayload;
    return (
      payload.typ === "session" && typeof payload.exp === "number" && Date.now() <= payload.exp
    );
  } catch {
    return false;
  }
}

// Issued once the password step succeeds, before the authenticator-code
// step — signed with the same secret as the real session token (this is
// still part of establishing one session, not a separate trust boundary).
export function createMfaPendingToken(): string {
  const payload: MfaPendingPayload = { typ: "mfa_pending", exp: Date.now() + MFA_PENDING_TTL_MS };
  const payloadB64 = base64url(JSON.stringify(payload));
  const signature = sign(payloadB64, getSecret());
  return `${payloadB64}.${signature}`;
}

export function verifyMfaPendingToken(token: string): boolean {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const expected = sign(payloadB64, getSecret());
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as MfaPendingPayload;
    return (
      payload.typ === "mfa_pending" &&
      typeof payload.exp === "number" &&
      Date.now() <= payload.exp
    );
  } catch {
    return false;
  }
}

export function checkAdminTotpCode(code: string): boolean {
  const secret = process.env.ADMIN_TOTP_SECRET;
  if (!secret) {
    throw new Error("ADMIN_TOTP_SECRET environment variable is not set.");
  }
  return verifyTotpCode(secret, code);
}

// Lets a logged-in staff member bypass the public captcha/rate-limit checks
// on actions shared with the admin dashboard (e.g. joinWaitlist, used by
// both /signup and /admin/new) — an authenticated caller doesn't need to
// solve a captcha meant for anonymous public traffic.
export async function isAdminSessionActive(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return !!token && verifySessionToken(token);
}

export function checkAdminPassword(submitted: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD environment variable is not set.");
  }

  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
