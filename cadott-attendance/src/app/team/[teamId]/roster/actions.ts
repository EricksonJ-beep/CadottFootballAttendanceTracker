"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeamAccess } from "@/lib/team-access";

export async function addAthlete(teamId: string, formData: FormData) {
  await requireTeamAccess(teamId);

  const fullName = formData.get("fullName")?.toString().trim();
  const grade = formData.get("grade")?.toString().trim();
  const jerseyNumber = formData.get("jerseyNumber")?.toString().trim();

  if (!fullName || !grade || !jerseyNumber) {
    return;
  }

  const athlete = await prisma.athlete.create({
    data: {
      teamId,
      fullName,
      grade,
      jerseyNumber,
    },
  });

  const practices = await prisma.practice.findMany({
    where: { teamId },
    select: { id: true },
  });

  if (practices.length) {
    await prisma.attendance.createMany({
      data: practices.map((practice) => ({
        athleteId: athlete.id,
        practiceId: practice.id,
      })),
    });
  }

  revalidatePath(`/team/${teamId}/roster`);
}

export async function deleteAthlete(teamId: string, athleteId: string) {
  await requireTeamAccess(teamId);

  await prisma.athlete.delete({
    where: { id: athleteId },
  });

  revalidatePath(`/team/${teamId}/roster`);
}
