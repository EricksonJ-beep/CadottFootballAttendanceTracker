"use server";

import { revalidatePath } from "next/cache";
import { requireTeamAccess } from "@/lib/team-access";
import { prisma } from "@/lib/prisma";

export async function updateAttendanceStatus(
  teamId: string,
  practiceId: string,
  attendanceId: string,
  status: "PRESENT" | "ABSENT" | "EXCUSED",
) {
  await requireTeamAccess(teamId);

  const attendance = await prisma.attendance.findFirst({
    where: { id: attendanceId, practiceId },
  });

  if (!attendance) {
    return;
  }

  await prisma.attendance.update({
    where: { id: attendanceId },
    data: { status },
  });

  revalidatePath(`/team/${teamId}/practices/${practiceId}`);
}
