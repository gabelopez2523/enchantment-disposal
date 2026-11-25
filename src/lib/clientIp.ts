import { headers } from "next/headers";

// Vercel (and most proxies) set x-forwarded-for to "client, proxy1, proxy2…"
// — the first entry is the original client. Falls back to x-real-ip, then a
// constant so a missing header degrades to one shared rate-limit bucket
// rather than throwing.
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headerList.get("x-real-ip")?.trim() ?? "unknown";
}
