"use server";

import { cookies } from "next/headers";
import { checkAdminPassword, createSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/adminSession";

export async function login(password: string): Promise<{ success: boolean; error?: string }> {
  if (!checkAdminPassword(password)) {
    return { success: false, error: "Incorrect password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days, matches the token's own TTL
  });

  // Navigation happens client-side (see login/page.tsx) rather than via
  // redirect() here — calling redirect() from a plain awaited function call
  // (as opposed to a <form action={...}> binding) throws a special
  // NEXT_REDIRECT error that a surrounding try/catch in the caller ends up
  // swallowing as a real error, which is exactly what caused the "error
  // flashes, then logs in anyway" bug.
  return { success: true };
}
