import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { accessCookieName } from "@/lib/team-access";
import { getPinSecret, signPin } from "@/lib/team-auth";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  if (!team) {
    return new NextResponse("Team not found", { status: 404 });
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(accessCookieName(teamId))?.value;
  const expected = signPin(team.pin, getPinSecret());

  if (!cookieValue || cookieValue !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const attendance = await prisma.attendance.findMany({
    where: { practice: { teamId } },
    include: {
      athlete: true,
      practice: true,
    },
    orderBy: [{ practice: { date: "asc" } }, { athlete: { fullName: "asc" } }],
  });

  const headers = [
    "Team",
    "Season",
    "Practice Date",
    "Practice Type",
    "Athlete Name",
    "Grade",
    "Jersey Number",
    "Status",
  ];

  const rows = attendance.map((record) => [
    team.name,
    team.seasonLabel,
    formatDate(record.practice.date),
    record.practice.type,
    record.athlete.fullName,
    record.athlete.grade,
    record.athlete.jerseyNumber,
    record.status,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`))
    .map((row) => row.join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${team.name
        .replace(/\s+/g, "-")
        .toLowerCase()}-attendance.csv"`,
    },
  });
}
