import Link from "next/link";
import { requireTeamAccess } from "@/lib/team-access";
import { importAthletes, saveGoogleSheetUrl, syncGoogleSheet } from "./actions";

type ImportPageProps = {
  params: { teamId: string };
  searchParams?: { status?: string };
};

const statusMessages: Record<string, string> = {
  saved: "Google Sheet link saved.",
  synced: "Roster synced from Google Sheets.",
  "invalid-link": "That link does not look like a Google Sheet.",
  "missing-link": "Add a Google Sheet link before syncing.",
  "sync-failed": "Unable to sync. Check sharing settings and try again.",
};

export default async function ImportPage({ params, searchParams }: ImportPageProps) {
  const { teamId } = params;
  const team = await requireTeamAccess(teamId);
  const status = searchParams?.status;
  const statusMessage = status ? statusMessages[status] : null;

  return (
    <div className="page-shell px-6 py-10 sm:px-10">
      <section className="surface mx-auto w-full max-w-3xl p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--color-accent-dark)]/70">
              {team.name}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
              Import Roster
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
            Export your Google Sheet as CSV or upload any CSV with the headers:
            <strong className="text-[color:var(--color-accent-dark)]">
              {" "}
              Full Name, Grade, Jersey Number
            </strong>
            .
          </p>
          <p>
            For direct sync, share the sheet link with anyone who has the link
            or publish it to the web so it can be downloaded as CSV.
          </p>
          <p>
            Accepted header variants: name, fullName, athlete, grade, jersey,
            jerseyNumber, number.
          </p>
        </div>

        {statusMessage ? (
          <div className="toast text-sm text-[color:var(--color-accent-dark)]">
            {statusMessage}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <form action={saveGoogleSheetUrl.bind(null, teamId)} className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-accent-dark)]">
              Google Sheet Link
              <input
                name="sheetUrl"
                placeholder="Paste a Google Sheet share link"
                defaultValue={team.googleSheetUrl ?? ""}
              className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-accent-dark)]"
              />
            </label>
            <button
              type="submit"
              className="rounded-full border border-[color:var(--color-stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]"
            >
              Save Sheet Link
            </button>
          </form>
          <form action={syncGoogleSheet.bind(null, teamId)}>
            <button
              type="submit"
              className="rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Sync Now
            </button>
          </form>
        </div>

        <form action={importAthletes.bind(null, teamId)} className="mt-8 grid gap-4">
          <input
            type="file"
            name="file"
            accept=".csv"
            required
            className="rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-accent-dark)]"
          />
          <button
            type="submit"
            className="w-fit rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            Import CSV
          </button>
        </form>
      </section>
    </div>
  );
}
