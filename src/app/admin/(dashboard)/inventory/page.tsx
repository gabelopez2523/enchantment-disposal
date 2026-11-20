import { getBinInventorySummary, sweepExpiredReservations } from "@/lib/db/reservations";

export default async function AdminInventoryPage() {
  // Same safety net as the reservations list — release any abandoned
  // checkout holds before showing counts, since this page is exactly where
  // a stale hold would otherwise show up as phantom "in use" capacity.
  await sweepExpiredReservations();
  const bins = await getBinInventorySummary();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Bin Inventory</h1>
      <p className="text-sm text-gray-600 mb-6">
        Read-only. To change a total, edit{" "}
        <code>src/data/binInventory.ts</code> and run <code>npm run db:seed</code> —
        kept as a deliberate code change, not a dashboard edit, so capacity changes stay
        reviewable.
      </p>

      <div className="overflow-x-auto border border-gray-200 rounded max-w-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">Bin Size</th>
              <th className="px-4 py-2">In Use</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Available</th>
            </tr>
          </thead>
          <tbody>
            {bins.map((bin) => (
              <tr key={bin.id} className="border-t border-gray-100">
                <td className="px-4 py-2 font-semibold text-gray-900">{bin.label}</td>
                <td className="px-4 py-2 text-gray-900">{bin.activeCount}</td>
                <td className="px-4 py-2 text-gray-900">{bin.totalUnits}</td>
                <td className="px-4 py-2 text-gray-900">{bin.totalUnits - bin.activeCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
