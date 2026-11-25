"use server";

import { redirect } from "next/navigation";
import {
  approveReservation,
  cancelReservation,
  rejectReservation,
  releaseAbandonedReservation,
} from "@/lib/adminActions";

function redirectWithResult(id: string, result: { ok: boolean; message: string }): never {
  const params = new URLSearchParams({ ok: String(result.ok), message: result.message });
  redirect(`/admin/reservations/${id}?${params.toString()}`);
}

export async function approveAction(id: string): Promise<void> {
  redirectWithResult(id, await approveReservation(id));
}

export async function rejectAction(id: string): Promise<void> {
  redirectWithResult(id, await rejectReservation(id));
}

export async function cancelAction(id: string): Promise<void> {
  redirectWithResult(id, await cancelReservation(id));
}

export async function releaseAction(id: string): Promise<void> {
  redirectWithResult(id, await releaseAbandonedReservation(id));
}
