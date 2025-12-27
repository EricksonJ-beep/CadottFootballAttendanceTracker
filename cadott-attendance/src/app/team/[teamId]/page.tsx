import Link from "next/link";
import { requireTeamAccess } from "@/lib/team-access";
import { prisma } from "@/lib/prisma";

type TeamPageProps = {
  params: { teamId: string };
};

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = params;
  const team = await requireTeamAccess(teamId);
  const [athleteCount, practiceCount] = await Promise.all([
    prisma.athlete.count({ where: { teamId } }),
    prisma.practice.count({ where: { teamId } }),
  ]);

  return (
    <div className="page-shell px-6 py-10 sm:px-10">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--color-accent-dark)]/70">
          {team.level} • Grades {team.gradeRange}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[family-name:var(--font-display)] text-5xl uppercase text-[color:var(--color-accent-dark)]">
            {team.name}
          </h1>
          <Link
            href="/"
            className="rounded-full border border-[color:var(--color-stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]"
          >
            Switch Team
          </Link>
        </div>
      </header>

      <section className="mx-auto mt-8 grid w-full max-w-5xl gap-6 md:grid-cols-3">
        <div className="surface p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
            Athletes
          </p>
          <p className="mt-2 text-3xl font-semibold text-[color:var(--color-accent-dark)]">
            {athleteCount}
          </p>
        </div>
        <div className="surface p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
            Practices Logged
          </p>
          <p className="mt-2 text-3xl font-semibold text-[color:var(--color-accent-dark)]">
            {practiceCount}
          </p>
        </div>
        <div className="surface p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
            Season
          </p>
          <p className="mt-2 text-3xl font-semibold text-[color:var(--color-accent-dark)]">
            {team.seasonLabel}
          </p>
        </div>
      </section>

      <section className="mx-auto mt-8 grid w-full max-w-5xl gap-6 md:grid-cols-2">
        <Link
          href={`/team/${teamId}/roster`}
          className="surface flex flex-col gap-2 p-6 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-[color:var(--color-accent-dark)]">
            Roster
          </h2>
          <p className="text-sm text-[color:var(--color-accent-dark)]/70">
            Add athletes, update grades, and manage jersey numbers.
          </p>
        </Link>
        <Link
          href={`/team/${teamId}/practices`}
          className="surface flex flex-col gap-2 p-6 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-[color:var(--color-accent-dark)]">
            Practices
          </h2>
          <p className="text-sm text-[color:var(--color-accent-dark)]/70">
            Create practice dates and check in athletes.
          </p>
        </Link>
        <Link
          href={`/team/${teamId}/import`}
          className="surface flex flex-col gap-2 p-6 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-[color:var(--color-accent-dark)]">
            Import Roster
          </h2>
          <p className="text-sm text-[color:var(--color-accent-dark)]/70">
            Upload from Google Sheets or a CSV file.
          </p>
        </Link>
        <Link
          href={`/team/${teamId}/export`}
          className="surface flex flex-col gap-2 p-6 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-[color:var(--color-accent-dark)]">
            Export Attendance
          </h2>
          <p className="text-sm text-[color:var(--color-accent-dark)]/70">
            Download attendance history for the season.
          </p>
        </Link>
        <Link
          href={`/team/${teamId}/stats`}
          className="surface flex flex-col gap-2 p-6 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase text-[color:var(--color-accent-dark)]">
            Attendance Stats
          </h2>
          <p className="text-sm text-[color:var(--color-accent-dark)]/70">
            Review practice trends and athlete attendance rates.
          </p>
        </Link>
      </section>
    </div>
  );
}
