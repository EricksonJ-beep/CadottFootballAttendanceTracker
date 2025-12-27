import Link from "next/link";
import { requireTeamAccess } from "@/lib/team-access";
import { prisma } from "@/lib/prisma";

type PracticesPageProps = {
  params: { teamId: string };
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export default async function PracticesPage({ params }: PracticesPageProps) {
  const { teamId } = params;
  const team = await requireTeamAccess(teamId);
  const practices = await prisma.practice.findMany({
    where: { teamId },
    orderBy: { date: "desc" },
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
              Practices
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/team/${teamId}`}
              className="rounded-full border border-[color:var(--color-stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]"
            >
              Team Home
            </Link>
            <Link
              href={`/team/${teamId}/practices/new`}
              className="rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              New Practice
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {practices.length === 0 ? (
            <p className="text-sm text-[color:var(--color-accent-dark)]/70">
              No practices yet. Create one to start checking athletes in.
            </p>
          ) : (
            practices.map((practice) => (
              <Link
                key={practice.id}
                href={`/team/${teamId}/practices/${practice.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-4 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <p className="text-lg font-semibold text-[color:var(--color-accent-dark)]">
                    {practice.title || "Practice Session"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
                    {practice.type} • {formatDate(practice.date)}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
                  Check-in
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
