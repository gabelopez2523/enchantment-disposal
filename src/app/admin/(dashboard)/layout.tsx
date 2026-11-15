import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminSession";
import { logout } from "../actions/logout";

// The actual auth gate for everything under this route group. Deliberately
// not Next.js middleware — middleware runs on the Edge runtime by default,
// which doesn't support Node's crypto module (createHmac/timingSafeEqual)
// that adminSession.ts relies on. A Server Component layout runs in the
// Node.js runtime and redirects before any HTML streams to the client, so
// there's no "flash of protected content" either way.
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token || !verifySessionToken(token)) {
    redirect("/admin/login");
  }

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-[#BF0A30] text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <nav className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/admin" className="hover:underline">
              Reservations
            </Link>
            <Link href="/admin/new" className="hover:underline">
              New Signup
            </Link>
            <Link href="/admin/inventory" className="hover:underline">
              Inventory
            </Link>
          </nav>
          <form action={logout}>
            <button type="submit" className="text-sm font-semibold hover:underline">
              Log Out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
