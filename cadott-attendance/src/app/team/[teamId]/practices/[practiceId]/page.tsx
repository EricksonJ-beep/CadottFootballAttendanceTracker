import Link from "next/link";
import { requireTeamAccess } from "@/lib/team-access";
import { prisma } from "@/lib/prisma";
import AttendanceGrid from "./attendance-grid";

type PracticeCheckInPageProps = {
  params: { teamId: string; practiceId: string };
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

export default async function PracticeCheckInPage({
  params,
}: PracticeCheckInPageProps) {
  const { teamId, practiceId } = params;
  const team = await requireTeamAccess(teamId);

  const practice = await prisma.practice.findFirst({
    where: { id: practiceId, teamId },
    include: {
      attendance: {
        include: { athlete: true },
        orderBy: { athlete: { fullName: "asc" } },
      },
    },
  });

  if (!practice) {
    return (
      <div className="page-shell px-6 py-10 sm:px-10">
        <div className="surface mx-auto w-full max-w-3xl p-8">
          <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
            Practice not found
          </h1>
          <Link
            href={`/team/${teamId}/practices`}
            className="mt-4 inline-flex rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Back to practices
          </Link>
        </div>
      </div>
    );
  }

  const attendanceRecords = practice.attendance.map((record) => ({
    attendanceId: record.id,
    fullName: record.athlete.fullName,
    grade: record.athlete.grade,
    jerseyNumber: record.athlete.jerseyNumber,
    status: record.status,
  }));

  return (
    <div className="page-shell px-6 py-10 sm:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="surface p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--color-accent-dark)]/70">
                {team.name}
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
                {practice.title || "Practice Check-In"}
              </h1>
              <p className="mt-2 text-sm text-[color:var(--color-accent-dark)]/70">
                {practice.type} • {formatDate(practice.date)}
              </p>
            </div>
            <Link
              href={`/team/${teamId}/practices`}
              className="rounded-full border border-[color:var(--color-stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]"
            >
              Back to practices
            </Link>
          </div>

          <p className="mt-6 text-sm text-[color:var(--color-accent-dark)]/70">
            Tap an athlete card to cycle through Absent → Present → Excused.
          </p>
        </div>

        {attendanceRecords.length === 0 ? (
          <div className="mt-6 surface p-6">
            <p className="text-sm text-[color:var(--color-accent-dark)]/70">
              No athletes in the roster yet. Add them first.
            </p>
          </div>
        ) : (
          <AttendanceGrid
            teamId={teamId}
            practiceId={practiceId}
            records={attendanceRecords}
          />
        )}
      </section>
    </div>
  );
}
