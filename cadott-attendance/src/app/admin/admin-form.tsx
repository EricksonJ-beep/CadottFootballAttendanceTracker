"use client";

import { useActionState } from "react";
import { verifyAdminPin } from "./actions";

type AdminState = {
  error?: string;
};

const initialState: AdminState = {};

export default function AdminForm() {
  const [state, action, pending] = useActionState(
    verifyAdminPin,
    initialState,
  );

  return (
    <form action={action} className="mt-6 grid gap-4">
      <label className="grid gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
        Admin PIN
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          placeholder="Admin PIN"
          required
          className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-base font-normal text-[color:var(--color-accent-dark)]"
        />
      </label>
      {state?.error ? (
        <p className="text-sm text-red-500">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black disabled:opacity-60"
      >
        {pending ? "Checking..." : "Unlock Admin"}
      </button>
    </form>
  );
}
