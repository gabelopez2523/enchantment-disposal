import Link from "next/link";
import { listReservations, type ReservationStatus } from "@/lib/db/reservations";

const STATUS_TABS: Array<{ label: string; value: ReservationStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending_verification" },
  { label: "Active", value: "active" },
  { label: "Rejected", value: "rejected" },
  { label: "Canceled", value: "canceled" },
  { label: "Expired", value: "expired" },
];

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-700",
  pending_verification: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
  canceled: "bg-gray-100 text-gray-700",
  expired: "bg-gray-100 text-gray-500",
};

const PAGE_SIZE = 50;

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; offset?: string }>;
}) {
  const { status, search, offset: offsetParam } = await searchParams;
  const offset = Number(offsetParam) || 0;

  const reservations = await listReservations({
    status: (status as ReservationStatus) || undefined,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const buildHref = (params: { status?: string; search?: string; offset?: number }) => {
    const next = new URLSearchParams();
    const nextStatus = params.status !== undefined ? params.status : status;
    const nextSearch = params.search !== undefined ? params.search : search;
    const nextOffset = params.offset !== undefined ? params.offset : 0;
    if (nextStatus) next.set("status", nextStatus);
    if (nextSearch) next.set("search", nextSearch);
    if (nextOffset) next.set("offset", String(nextOffset));
    const qs = next.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reservations</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <nav className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.label}
              href={buildHref({ status: tab.value, offset: 0 })}
              className={`px-3 py-1.5 rounded text-sm font-semibold ${
                (status ?? "") === tab.value
                  ? "bg-[#BF0A30] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <form method="GET" action="/admin" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search name, email, or address"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900 w-64"
          />
          <button
            type="submit"
            className="bg-[#BF0A30] hover:bg-red-800 text-white text-sm font-semibold px-4 py-1.5 rounded"
          >
            Search
          </button>
        </form>
      </div>

      {reservations.length === 0 ? (
        <p className="text-gray-500">No reservations match these filters.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={`/admin/reservations/${r.id}`} className="text-[#BF0A30] font-semibold hover:underline">
                      {r.customerName}
                    </Link>
                    <div className="text-gray-500">{r.customerEmail}</div>
                  </td>
                  <td className="px-4 py-2 text-gray-900">{r.addressFormatted ?? r.addressRaw}</td>
                  <td className="px-4 py-2 text-gray-900">{r.planId}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        STATUS_BADGE_CLASSES[r.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between mt-4 text-sm">
        {offset > 0 ? (
          <Link href={buildHref({ offset: Math.max(0, offset - PAGE_SIZE) })} className="text-[#BF0A30] font-semibold hover:underline">
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {reservations.length === PAGE_SIZE && (
          <Link href={buildHref({ offset: offset + PAGE_SIZE })} className="text-[#BF0A30] font-semibold hover:underline">
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
