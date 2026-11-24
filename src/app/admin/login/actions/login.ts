"use server";

import { cookies } from "next/headers";
import { checkAdminPassword, createMfaPendingToken, ADMIN_MFA_PENDING_COOKIE } from "@/lib/adminSession";

// Password step only now — a correct password moves to the authenticator
// code step (see verifyMfa.ts) rather than logging in directly. Still no
// redirect() here, same reasoning as before: calling it from a plain
// awaited function call (as opposed to a <form action={...}> binding)
// throws a special NEXT_REDIRECT error that a surrounding try/catch in the
// caller ends up swallowing as a real error — navigation stays client-side.
export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  if (!checkAdminPassword(password)) {
    return { success: false, error: "Incorrect password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_MFA_PENDING_COOKIE, createMfaPendingToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 60, // 5 minutes, matches the token's own TTL
  });

  return { success: true };
}
