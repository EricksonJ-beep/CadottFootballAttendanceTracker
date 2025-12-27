import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="page-shell px-6 py-10 sm:px-10">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]">
          Cadott Football Program
        </p>
        <div className="flex flex-col gap-4">
          <h1 className="font-[family-name:var(--font-display)] text-5xl uppercase text-[color:var(--color-accent-dark)] sm:text-6xl">
            Attendance Hub
          </h1>
          <p className="max-w-2xl text-lg text-[color:var(--color-accent-dark)]/80">
            Check in athletes by team, track season attendance, and export records
            whenever you need them. Each team uses a simple PIN for access.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/setup"
            className="rounded-full bg-[color:var(--color-accent-dark)] px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Create Team
          </Link>
          <span className="rounded-full border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-5 py-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
            One PIN per team
          </span>
        </div>
      </header>

      <section className="mx-auto mt-12 grid w-full max-w-5xl gap-6 md:grid-cols-2">
        {teams.length === 0 ? (
          <div className="surface p-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-[color:var(--color-accent-dark)]">
              No teams yet
            </h2>
            <p className="mt-3 text-sm text-[color:var(--color-accent-dark)]/80">
              Start by creating a team and setting a PIN for coach access.
            </p>
            <Link
              href="/setup"
              className="mt-5 inline-flex rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Create the first team
            </Link>
          </div>
        ) : (
          teams.map((team) => (
            <Link
              key={team.id}
              href={`/team/${team.id}`}
              className="surface group flex flex-col gap-3 p-6 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-[color:var(--color-accent-dark)]">
                  {team.name}
                </h2>
                <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]/70">
                  {team.seasonLabel}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-[color:var(--color-accent-dark)]/80">
                <span className="rounded-full border border-[color:var(--color-stroke)] px-3 py-1">
                  {team.level}
                </span>
                <span className="rounded-full border border-[color:var(--color-stroke)] px-3 py-1">
                  Grades {team.gradeRange}
                </span>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]/60">
                Tap to check in
              </span>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
