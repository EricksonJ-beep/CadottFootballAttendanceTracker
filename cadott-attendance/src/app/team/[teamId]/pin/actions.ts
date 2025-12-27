"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { accessCookieName } from "@/lib/team-access";
import { getPinSecret, signPin } from "@/lib/team-auth";

type PinState = {
  error?: string;
};

export async function verifyTeamPin(
  teamId: string,
  _prevState: PinState,
  formData: FormData,
) {
  const pin = formData.get("pin")?.toString().trim();
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  if (!team || !pin) {
    return { error: "Invalid PIN. Try again." };
  }

  if (team.pin !== pin) {
    return { error: "Invalid PIN. Try again." };
  }

  const signature = signPin(pin, getPinSecret());
  const cookieStore = await cookies();
  cookieStore.set(accessCookieName(teamId), signature, {
    httpOnly: true,
    sameSite: "lax",
    path: `/team/${teamId}`,
  });

  redirect(`/team/${teamId}`);
}
