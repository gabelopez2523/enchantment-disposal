import Link from "next/link";
import { getReservationById } from "@/lib/db/reservations";
import { approveAction, cancelAction, rejectAction, releaseAction } from "./actions";

// Guards against e.g. a browser's automatic /admin/reservations/favicon.ico
// request landing here with "favicon.ico" as the id — reservations.id is a
// uuid column, so that query would otherwise throw a raw Postgres error
// instead of a normal "not found".
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminReservationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; message?: string }>;
}) {
  const { id } = await params;
  const { ok, message } = await searchParams;
  const reservation = UUID_PATTERN.test(id) ? await getReservationById(id) : null;

  if (!reservation) {
    return (
      <div>
        <p className="text-gray-700">No reservation found with that id.</p>
        <Link href="/admin" className="text-[#BF0A30] font-semibold hover:underline">
          ← Back to Reservations
        </Link>
      </div>
    );
  }

  const approve = approveAction.bind(null, reservation.id);
  const reject = rejectAction.bind(null, reservation.id);
  const cancel = cancelAction.bind(null, reservation.id);
  const release = releaseAction.bind(null, reservation.id);

  return (
    <div>
      <Link href="/admin" className="text-[#BF0A30] font-semibold hover:underline text-sm">
        ← Back to Reservations
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-6">{reservation.customerName}</h1>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded border text-sm ${
            ok === "true" ? "bg-green-100 border-green-400 text-green-700" : "bg-yellow-100 border-yellow-400 text-yellow-800"
          }`}
        >
          {message}
        </div>
      )}

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm">
        <Field label="Status" value={reservation.status} />
        <Field label="Source" value={reservation.source} />
        <Field label="Email" value={reservation.customerEmail} />
        <Field label="Phone" value={reservation.customerPhone ?? "N/A"} />
        <Field label="Address" value={reservation.addressFormatted ?? reservation.addressRaw} />
        <Field label="Service Area" value={reservation.serviceAreaId} />
        <Field label="Plan" value={reservation.planId} />
        <Field label="Bin Size" value={reservation.binSize} />
        <Field label="Verification Reason" value={reservation.verificationReason ?? "N/A"} />
        <Field label="Created" value={new Date(reservation.createdAt).toLocaleString("en-US")} />
      </dl>

      <div className="flex flex-wrap gap-3">
        {reservation.status === "pending_verification" && (
          <>
            <form action={approve}>
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2 rounded shadow"
              >
                Approve
              </button>
            </form>
            <form action={reject}>
              <button
                type="submit"
                className="bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-5 py-2 rounded shadow"
              >
                Reject
              </button>
            </form>
          </>
        )}

        {reservation.status === "active" && (
          <form action={cancel}>
            <button
              type="submit"
              className="bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-5 py-2 rounded shadow"
            >
              Cancel Service &amp; Release Slot
            </button>
          </form>
        )}

        {reservation.status === "pending_payment" && (
          <form action={release}>
            <button
              type="submit"
              className="bg-[#BF0A30] hover:bg-red-800 text-white font-semibold px-5 py-2 rounded shadow"
            >
              Release Abandoned Checkout
            </button>
          </form>
        )}

        {reservation.status !== "pending_verification" &&
          reservation.status !== "active" &&
          reservation.status !== "pending_payment" && (
            <p className="text-gray-500 text-sm">No actions available for this status.</p>
          )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500 font-semibold">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  );
}
