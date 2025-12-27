import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PinForm from "./pin-form";

type PinPageProps = {
  params: { teamId: string };
};

export default async function PinPage({ params }: PinPageProps) {
  const { teamId } = params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  if (!team) {
    return (
      <div className="page-shell px-6 py-10 sm:px-10">
        <div className="surface mx-auto w-full max-w-xl p-8">
          <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
            Team not found
          </h1>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Back to teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell px-6 py-10 sm:px-10">
      <div className="surface mx-auto w-full max-w-xl p-8">
        <h1 className="font-[family-name:var(--font-display)] text-4xl uppercase text-[color:var(--color-accent-dark)]">
          {team.name}
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-accent-dark)]/70">
          Coaches enter the team PIN to access roster and attendance.
        </p>
        <PinForm teamId={teamId} teamName={team.name} />
      </div>
    </div>
  );
}
