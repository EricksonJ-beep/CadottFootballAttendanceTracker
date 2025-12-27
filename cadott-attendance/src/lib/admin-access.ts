import { cookies } from "next/headers";
import { signPin, getPinSecret } from "@/lib/team-auth";

const ADMIN_COOKIE = "admin_access";

export function getAdminPin() {
  return process.env.ADMIN_PIN ?? "";
}

export function adminCookieName() {
  return ADMIN_COOKIE;
}

export async function hasAdminAccess() {
  const adminPin = getAdminPin();
  if (!adminPin) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_COOKIE)?.value;
  const expected = signPin(adminPin, getPinSecret());
  return cookieValue === expected;
}
