import Link from "next/link";
import { requireTeamAccess } from "@/lib/team-access";

type ExportPageProps = {
  params: { teamId: string };
};

export default async function ExportPage({ params }: ExportPageProps) {
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
              Export Attendance
            </h1>
          </div>
          <Link
            href={`/team/${teamId}`}
            className="rounded-full border border-[color:var(--color-stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]"
          >
            Team Home
          </Link>
        </div>

        <div className="mt-6 grid gap-4 text-sm text-[color:var(--color-accent-dark)]/70">
          <p>
            Download a CSV of every attendance record for the season. You can
            filter and summarize it in Google Sheets or Excel.
          </p>
        </div>

        <a
          href={`/team/${teamId}/export/download`}
          className="mt-6 inline-flex rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Download CSV
        </a>
      </section>
    </div>
  );
}
