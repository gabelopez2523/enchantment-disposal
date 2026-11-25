"use server";

import { cookies } from "next/headers";
import {
  checkAdminTotpCode,
  createSessionToken,
  verifyMfaPendingToken,
  ADMIN_SESSION_COOKIE,
  ADMIN_MFA_PENDING_COOKIE,
} from "@/lib/adminSession";

// Second step of login.ts — only reachable after the password step set the
// pending-MFA cookie. Same not-a-redirect() reasoning as login.ts.
export async function verifyMfa(code: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(ADMIN_MFA_PENDING_COOKIE)?.value;

  if (!pendingToken || !verifyMfaPendingToken(pendingToken)) {
    return {
      success: false,
      error: "Your login attempt expired. Please enter your password again.",
    };
  }

  if (!checkAdminTotpCode(code)) {
    return { success: false, error: "Incorrect authenticator code." };
  }

  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days, matches the token's own TTL
  });
  cookieStore.delete(ADMIN_MFA_PENDING_COOKIE);

  return { success: true };
}
