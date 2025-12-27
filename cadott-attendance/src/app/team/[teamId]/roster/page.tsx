import Link from "next/link";
import { requireTeamAccess } from "@/lib/team-access";
import { prisma } from "@/lib/prisma";
import { addAthlete, deleteAthlete } from "./actions";

type RosterPageProps = {
  params: { teamId: string };
};

export default async function RosterPage({ params }: RosterPageProps) {
  const { teamId } = params;
  const team = await requireTeamAccess(teamId);
  const athletes = await prisma.athlete.findMany({
    where: { teamId },
    orderBy: [{ fullName: "asc" }],
  });

  return (
    <div className="page-shell px-6 py-10 sm:px-10">
      <section className="surface mx-auto w-full max-w-5xl p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--color-accent-dark)]/70">
              {team.name}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
              Roster
            </h1>
          </div>
          <Link
            href={`/team/${teamId}`}
            className="rounded-full border border-[color:var(--color-stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]"
          >
            Team Home
          </Link>
        </div>

        <form
          action={addAthlete.bind(null, teamId)}
          className="mt-6 grid gap-4 rounded-2xl border border-dashed border-[color:var(--color-stroke)] p-5"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]">
            Add athlete
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              name="fullName"
              placeholder="Athlete name"
              required
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-accent-dark)]"
            />
            <input
              name="grade"
              placeholder="Grade"
              required
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-accent-dark)]"
            />
            <input
              name="jerseyNumber"
              placeholder="Jersey #"
              required
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-accent-dark)]"
            />
          </div>
          <button
            type="submit"
            className="w-fit rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            Add to roster
          </button>
        </form>

        <div className="mt-6 grid gap-3">
          {athletes.length === 0 ? (
            <p className="text-sm text-[color:var(--color-accent-dark)]/70">
              No athletes yet. Add them above or import from Google Sheets.
            </p>
          ) : (
            athletes.map((athlete) => (
              <div
                key={athlete.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-4"
              >
                <div>
                  <p className="text-lg font-semibold text-[color:var(--color-accent-dark)]">
                    {athlete.fullName}
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
                    Grade {athlete.grade} • Jersey {athlete.jerseyNumber}
                  </p>
                </div>
                <form action={deleteAthlete.bind(null, teamId, athlete.id)}>
                  <button
                    type="submit"
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-600"
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
