import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function createTeam(formData: FormData) {
  "use server";

  const name = formData.get("name")?.toString().trim();
  const level = formData.get("level")?.toString().trim();
  const gradeRange = formData.get("gradeRange")?.toString().trim();
  const pin = formData.get("pin")?.toString().trim();
  const seasonLabel = formData.get("seasonLabel")?.toString().trim() || "2025";

  if (!name || !level || !gradeRange || !pin) {
    return;
  }

  const team = await prisma.team.create({
    data: {
      name,
      level,
      gradeRange,
      pin,
      seasonLabel,
    },
  });

  redirect(`/team/${team.id}`);
}

export default function SetupPage() {
  return (
    <div className="page-shell px-6 py-10 sm:px-10">
      <section className="surface mx-auto w-full max-w-3xl p-8">
        <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
          Create a Team
        </h1>
        <p className="mt-3 text-sm text-[color:var(--color-accent-dark)]/70">
          Each team gets a unique PIN. Share it with coaches so they can check in
          athletes from their phones.
        </p>

        <form action={createTeam} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
            Team Name
            <input
              name="name"
              placeholder="Cadott Flag Football"
              required
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-base font-normal text-[color:var(--color-accent-dark)]"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
              Level
              <input
                name="level"
                placeholder="Flag / CVYF / Middle School / High School"
                required
                className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-base font-normal text-[color:var(--color-accent-dark)]"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
              Grade Range
              <input
                name="gradeRange"
                placeholder="K-1, 2-3, 4-6, 5-6, 7-8, 9-12"
                required
                className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-base font-normal text-[color:var(--color-accent-dark)]"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
              Team PIN
              <input
                name="pin"
                type="password"
                inputMode="numeric"
                placeholder="4-digit PIN"
                required
                className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-base font-normal text-[color:var(--color-accent-dark)]"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
              Season Label
              <input
                name="seasonLabel"
                placeholder="2025"
                defaultValue="2025"
                className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-base font-normal text-[color:var(--color-accent-dark)]"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-2 rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Save Team
          </button>
        </form>
      </section>
    </div>
  );
}
