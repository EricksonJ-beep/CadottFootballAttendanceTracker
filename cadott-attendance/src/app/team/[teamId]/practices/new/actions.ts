"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTeamAccess } from "@/lib/team-access";

export async function createPractice(teamId: string, formData: FormData) {
  await requireTeamAccess(teamId);

  const dateValue = formData.get("date")?.toString();
  const type = formData.get("type")?.toString() ?? "PRACTICE";
  const title = formData.get("title")?.toString().trim() || null;

  if (!dateValue) {
    return;
  }

  const practice = await prisma.practice.create({
    data: {
      teamId,
      date: new Date(dateValue),
      type: type as "PRACTICE" | "GAME" | "OTHER",
      title,
    },
  });

  const athletes = await prisma.athlete.findMany({
    where: { teamId },
    select: { id: true },
  });

  if (athletes.length) {
    await prisma.attendance.createMany({
      data: athletes.map((athlete) => ({
        athleteId: athlete.id,
        practiceId: practice.id,
      })),
    });
  }

  redirect(`/team/${teamId}/practices/${practice.id}`);
}
