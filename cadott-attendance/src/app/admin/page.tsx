import { prisma } from "@/lib/prisma";
import { getAdminPin, hasAdminAccess } from "@/lib/admin-access";
import AdminForm from "./admin-form";
import { adminLogout, updateTeamPin } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminPin = getAdminPin();
  const authorized = await hasAdminAccess();

  if (!adminPin) {
    return (
      <div className="page-shell px-6 py-10 sm:px-10">
        <section className="surface mx-auto w-full max-w-2xl p-8">
          <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
            Admin PIN Not Set
          </h1>
          <p className="mt-3 text-sm text-[color:var(--color-accent-dark)]/70">
            Set the ADMIN_PIN environment variable to enable this page.
          </p>
        </section>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="page-shell px-6 py-10 sm:px-10">
        <section className="surface mx-auto w-full max-w-2xl p-8">
          <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
            Admin Access
          </h1>
          <p className="mt-3 text-sm text-[color:var(--color-accent-dark)]/70">
            Enter the admin PIN to manage team access.
          </p>
          <AdminForm />
        </section>
      </div>
    );
  }

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="page-shell px-6 py-10 sm:px-10">
      <section className="surface mx-auto w-full max-w-4xl p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--color-accent-dark)]/70">
              Admin
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
              Team PINs
            </h1>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="rounded-full border border-[color:var(--color-stroke)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]"
            >
              Log out
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-2xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-[color:var(--color-accent-dark)]">
                    {team.name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
                    {team.level} • Grades {team.gradeRange}
                  </p>
                </div>
                <form action={updateTeamPin.bind(null, team.id)} className="flex gap-2">
                  <input
                    name="pin"
                    placeholder="New PIN"
                    className="w-28 rounded-xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] px-3 py-2 text-sm text-[color:var(--color-accent-dark)]"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[color:var(--color-accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black"
                  >
                    Update
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
