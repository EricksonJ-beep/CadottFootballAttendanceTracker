"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminCookieName, getAdminPin, hasAdminAccess } from "@/lib/admin-access";
import { getPinSecret, signPin } from "@/lib/team-auth";

type AdminState = {
  error?: string;
};

export async function verifyAdminPin(_prevState: AdminState, formData: FormData) {
  const adminPin = getAdminPin();
  const pin = formData.get("pin")?.toString().trim() ?? "";

  if (!adminPin) {
    return { error: "Admin PIN is not configured." };
  }

  if (pin !== adminPin) {
    return { error: "Invalid admin PIN." };
  }

  const cookieStore = await cookies();
  const signature = signPin(pin, getPinSecret());
  cookieStore.set(adminCookieName(), signature, {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
  });

  return {};
}

export async function updateTeamPin(teamId: string, formData: FormData) {
  const authorized = await hasAdminAccess();
  if (!authorized) {
    return;
  }

  const pin = formData.get("pin")?.toString().trim();
  if (!pin) {
    return;
  }

  await prisma.team.update({
    where: { id: teamId },
    data: { pin },
  });

  revalidatePath("/admin");
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName());
}
