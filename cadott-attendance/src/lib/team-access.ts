import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPinSecret, signPin } from "@/lib/team-auth";

export function accessCookieName(teamId: string) {
  return `team_access_${teamId}`;
}

export async function requireTeamAccess(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(accessCookieName(teamId))?.value;
  const expected = signPin(team.pin, getPinSecret());

  if (!cookieValue || cookieValue !== expected) {
    redirect(`/team/${teamId}/pin`);
  }

  return team;
}
