// Server-side verification for the Cloudflare Turnstile widget on the
// public /signup form — keeps bots from spamming checkout-session creation
// (and the bin-inventory holds that go with it) or the waitlist.

function getSecret(): string {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY environment variable is not set.");
  }
  return secret;
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string
): Promise<boolean> {
  if (!token) return false;

  const body = new URLSearchParams({ secret: getSecret(), response: token });
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification request failed:", err);
    return false;
  }
}
