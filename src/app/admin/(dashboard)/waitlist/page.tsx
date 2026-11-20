import Link from "next/link";
import { listWaitlist } from "@/lib/db/waitlist";
import { binInventory } from "@/data/binInventory";
import { serviceAreas } from "@/data/serviceAreas";
import { resolveAction } from "./actions";

const STATUS_TABS: Array<{ label: string; value: string }> = [
  { label: "Waiting", value: "waiting" },
  { label: "Resolved", value: "resolved" },
  { label: "All", value: "" },
];

export default async function AdminWaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; binSize?: string; ok?: string; message?: string }>;
}) {
  const { status, binSize, ok, message } = await searchParams;
  const activeStatus = status ?? "waiting"; // default to the actionable view

  const entries = await listWaitlist({
    status: activeStatus || undefined,
    binSize: binSize || undefined,
    limit: 100,
  });

  const buildHref = (params: { status?: string; binSize?: string }) => {
    const next = new URLSearchParams();
    const nextStatus = params.status !== undefined ? params.status : activeStatus;
    const nextBinSize = params.binSize !== undefined ? params.binSize : binSize;
    if (nextStatus) next.set("status", nextStatus);
    if (nextBinSize) next.set("binSize", nextBinSize);
    const qs = next.toString();
    return qs ? `/admin/waitlist?${qs}` : "/admin/waitlist";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Waitlist</h1>
      <p className="text-sm text-gray-600 mb-6">
        Leads captured when a bin size was out of stock. No capacity is held for these — when a
        unit frees up you&apos;ll get an email listing everyone waiting for that size, oldest
        first.
      </p>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded border text-sm ${
            ok === "true" ? "bg-green-100 border-green-400 text-green-700" : "bg-yellow-100 border-yellow-400 text-yellow-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <nav className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.label}
              href={buildHref({ status: tab.value })}
              className={`px-3 py-1.5 rounded text-sm font-semibold ${
                activeStatus === tab.value
                  ? "bg-[#BF0A30] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <form method="GET" action="/admin/waitlist" className="flex gap-2">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <select
            name="binSize"
            defaultValue={binSize ?? ""}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-900"
          >
            <option value="">All Bin Sizes</option>
            {binInventory.map((bin) => (
              <option key={bin.id} value={bin.id}>
                {bin.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-[#BF0A30] hover:bg-red-800 text-white text-sm font-semibold px-4 py-1.5 rounded"
          >
            Filter
          </button>
        </form>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-500">No waitlist entries match these filters.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Address</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Area</th>
                <th className="px-4 py-2">Waiting Since</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const resolve = resolveAction.bind(null, entry.id);
                const areaName =
                  serviceAreas.find((a) => a.id === entry.serviceAreaId)?.name ?? entry.serviceAreaId;
                return (
                  <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="text-gray-900 font-semibold">{entry.customerName}</div>
                      <div className="text-gray-500">{entry.customerEmail}</div>
                      {entry.customerPhone && <div className="text-gray-500">{entry.customerPhone}</div>}
                    </td>
                    <td className="px-4 py-2 text-gray-900">{entry.addressRaw}</td>
                    <td className="px-4 py-2 text-gray-900">{entry.planId}</td>
                    <td className="px-4 py-2 text-gray-900">{areaName}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString("en-US")}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          entry.status === "waiting" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {entry.status === "waiting" && (
                        <form action={resolve}>
                          <button
                            type="submit"
                            className="text-[#BF0A30] font-semibold hover:underline text-xs"
                          >
                            Mark Resolved
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
