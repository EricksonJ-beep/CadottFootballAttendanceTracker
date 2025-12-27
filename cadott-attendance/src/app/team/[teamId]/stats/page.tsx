import Link from "next/link";
import { requireTeamAccess } from "@/lib/team-access";
import { prisma } from "@/lib/prisma";

type StatsPageProps = {
  params: { teamId: string };
  searchParams?: { start?: string; end?: string; practiceId?: string };
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(value);
}

function parseDate(value?: string) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export default async function StatsPage({ params, searchParams }: StatsPageProps) {
  const { teamId } = params;
  const team = await requireTeamAccess(teamId);
  const startDate = parseDate(searchParams?.start);
  const endDateRaw = parseDate(searchParams?.end);
  const endDate = endDateRaw
    ? new Date(endDateRaw.getFullYear(), endDateRaw.getMonth(), endDateRaw.getDate(), 23, 59, 59)
    : null;
  const selectedPracticeId = searchParams?.practiceId?.trim() || "";

  const practices = await prisma.practice.findMany({
    where: { teamId },
    orderBy: { date: "desc" },
  });

  const attendance = await prisma.attendance.findMany({
    where: {
      ...(selectedPracticeId ? { practiceId: selectedPracticeId } : {}),
      practice: {
        teamId,
        ...(startDate || endDate
          ? {
              date: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      },
    },
    include: {
      athlete: true,
      practice: true,
    },
    orderBy: [{ practice: { date: "desc" } }],
  });

  const practiceTotals = new Map<
    string,
    { present: number; total: number; date: Date; title: string; type: string }
  >();
  const athleteTotals = new Map<
    string,
    {
      present: number;
      total: number;
      name: string;
      grade: string;
      jerseyNumber: string;
    }
  >();

  let totalPresent = 0;
  let totalRecords = 0;

  for (const record of attendance) {
    totalRecords += 1;
    if (record.status === "PRESENT") {
      totalPresent += 1;
    }

    const practiceKey = record.practiceId;
    if (!practiceTotals.has(practiceKey)) {
      practiceTotals.set(practiceKey, {
        present: 0,
        total: 0,
        date: record.practice.date,
        title: record.practice.title || "Practice Session",
        type: record.practice.type,
      });
    }
    const practice = practiceTotals.get(practiceKey);
    if (practice) {
      practice.total += 1;
      if (record.status === "PRESENT") {
        practice.present += 1;
      }
    }

    const athleteKey = record.athleteId;
    if (!athleteTotals.has(athleteKey)) {
      athleteTotals.set(athleteKey, {
        present: 0,
        total: 0,
        name: record.athlete.fullName,
        grade: record.athlete.grade,
        jerseyNumber: record.athlete.jerseyNumber,
      });
    }
    const athlete = athleteTotals.get(athleteKey);
    if (athlete) {
      athlete.total += 1;
      if (record.status === "PRESENT") {
        athlete.present += 1;
      }
    }
  }

  const practiceRows = Array.from(practiceTotals.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  const athleteRows = Array.from(athleteTotals.values())
    .map((athlete) => ({
      ...athlete,
      rate: athlete.total ? Math.round((athlete.present / athlete.total) * 100) : 0,
    }))
    .sort((a, b) => b.rate - a.rate);

  const overallRate = totalRecords
    ? Math.round((totalPresent / totalRecords) * 100)
    : 0;

  return (
    <div className="page-shell px-6 py-10 sm:px-10">
      <section className="surface mx-auto w-full max-w-6xl p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--color-accent-dark)]/70">
              {team.name}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
              Attendance Stats
            </h1>
          </div>
          <Link
            href={`/team/${teamId}`}
            className="rounded-full border border-[color:var(--color-stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]"
          >
            Team Home
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
              Overall Attendance
            </p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--color-accent-dark)]">
              {overallRate}%
            </p>
            <p className="text-xs text-[color:var(--color-accent-dark)]/60">
              {totalPresent} present of {totalRecords} check-ins
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
              Total Practices
            </p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--color-accent-dark)]">
              {practiceRows.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
              Athletes Tracked
            </p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--color-accent-dark)]">
              {athleteRows.length}
            </p>
          </div>
        </div>

        <form
          method="get"
          className="mt-8 grid gap-4 rounded-2xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-5 md:grid-cols-4"
        >
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]">
            Start Date
            <input
              type="date"
              name="start"
              defaultValue={searchParams?.start ?? ""}
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-accent-dark)]"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]">
            End Date
            <input
              type="date"
              name="end"
              defaultValue={searchParams?.end ?? ""}
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-accent-dark)]"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)] md:col-span-2">
            Practice
            <select
              name="practiceId"
              defaultValue={selectedPracticeId}
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-accent-dark)]"
            >
              <option value="">All practices</option>
              {practices.map((practice) => (
                <option key={practice.id} value={practice.id}>
                  {practice.title || "Practice Session"} • {formatDate(practice.date)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-3 md:col-span-4">
            <button
              type="submit"
              className="rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black"
            >
              Apply Filters
            </button>
            <Link
              href={`/team/${teamId}/stats`}
              className="rounded-full border border-[color:var(--color-stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]">
              Practice Breakdown
            </h2>
            <div className="mt-4 grid gap-3">
              {practiceRows.length === 0 ? (
                <p className="text-sm text-[color:var(--color-accent-dark)]/70">
                  No practices logged yet.
                </p>
              ) : (
                practiceRows.map((practice) => {
                  const rate = practice.total
                    ? Math.round((practice.present / practice.total) * 100)
                    : 0;
                  return (
                    <div
                      key={`${practice.title}-${practice.date.toISOString()}`}
                      className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-[color:var(--color-accent-dark)]">
                            {practice.title}
                          </p>
                          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
                            {practice.type} • {formatDate(practice.date)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-[color:var(--color-accent-dark)]">
                          {rate}%
                        </span>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-[color:var(--color-stroke)]">
                        <div
                          className="h-full rounded-full bg-[color:var(--color-accent)]"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]">
              Athlete Attendance
            </h2>
            <div className="mt-4 grid gap-3">
              {athleteRows.length === 0 ? (
                <p className="text-sm text-[color:var(--color-accent-dark)]/70">
                  No attendance records yet.
                </p>
              ) : (
                athleteRows.map((athlete) => (
                  <div
                    key={`${athlete.name}-${athlete.jerseyNumber}`}
                    className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-[color:var(--color-accent-dark)]">
                          {athlete.name}
                        </p>
                        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
                          Grade {athlete.grade} • Jersey {athlete.jerseyNumber}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[color:var(--color-accent-dark)]">
                        {athlete.rate}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-[color:var(--color-stroke)]">
                      <div
                        className="h-full rounded-full bg-[color:var(--color-accent)]"
                        style={{ width: `${athlete.rate}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
