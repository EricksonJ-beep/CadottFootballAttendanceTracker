import Link from "next/link";
import { requireTeamAccess } from "@/lib/team-access";
import { createPractice } from "./actions";

type NewPracticePageProps = {
  params: { teamId: string };
};

export default async function NewPracticePage({ params }: NewPracticePageProps) {
  const { teamId } = params;
  const team = await requireTeamAccess(teamId);

  return (
    <div className="page-shell px-6 py-10 sm:px-10">
      <section className="surface mx-auto w-full max-w-3xl p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--color-accent-dark)]/70">
              {team.name}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
              New Practice
            </h1>
          </div>
          <Link
            href={`/team/${teamId}/practices`}
            className="rounded-full border border-[color:var(--color-stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]"
          >
            Back
          </Link>
        </div>

        <form action={createPractice.bind(null, teamId)} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
            Date & Time
            <input
              name="date"
              type="datetime-local"
              required
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-base text-[color:var(--color-accent-dark)]"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
            Practice Type
            <select
              name="type"
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-base text-[color:var(--color-accent-dark)]"
            >
              <option value="PRACTICE">Practice</option>
              <option value="GAME">Game</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
            Title (optional)
            <input
              name="title"
              placeholder="Example: Perfect Practice"
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-base text-[color:var(--color-accent-dark)]"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Create Practice
          </button>
        </form>
      </section>
    </div>
  );
}
