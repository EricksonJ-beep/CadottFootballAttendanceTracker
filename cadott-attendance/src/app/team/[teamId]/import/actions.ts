"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTeamAccess } from "@/lib/team-access";
import { prisma } from "@/lib/prisma";
import { normalizeGoogleSheetCsvUrl } from "@/lib/google-sheets";

type ParsedRow = {
  fullName: string;
  grade: string;
  jerseyNumber: string;
};

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function mapRow(row: Record<string, string>): ParsedRow | null {
  const normalizedEntries = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]),
  );

  const fullName =
    normalizedEntries.fullname ||
    normalizedEntries.name ||
    normalizedEntries.athlete ||
    "";
  const grade = normalizedEntries.grade || "";
  const jerseyNumber =
    normalizedEntries.jerseynumber ||
    normalizedEntries.jersey ||
    normalizedEntries.number ||
    "";

  if (!fullName || !grade || !jerseyNumber) {
    return null;
  }

  return {
    fullName: fullName.trim(),
    grade: grade.trim(),
    jerseyNumber: jerseyNumber.trim(),
  };
}

async function ensureAttendance(teamId: string, athleteId: string) {
  const practices = await prisma.practice.findMany({
    where: { teamId },
    select: { id: true },
  });

  if (!practices.length) {
    return;
  }

  await prisma.attendance.createMany({
    data: practices.map((practice) => ({
      athleteId,
      practiceId: practice.id,
    })),
    skipDuplicates: true,
  });
}

async function upsertAthletes(teamId: string, rows: ParsedRow[]) {
  if (!rows.length) {
    return;
  }

  const existing = await prisma.athlete.findMany({
    where: { teamId },
  });

  const existingByNameGrade = new Map(
    existing.map((athlete) => [
      `${athlete.fullName.toLowerCase()}|${athlete.grade.toLowerCase()}`,
      athlete,
    ]),
  );
  const existingByJersey = new Map(
    existing.map((athlete) => [
      athlete.jerseyNumber.toLowerCase(),
      athlete,
    ]),
  );

  const seen = new Set<string>();

  for (const row of rows) {
    const normalizedName = row.fullName.toLowerCase();
    const normalizedGrade = row.grade.toLowerCase();
    const normalizedJersey = row.jerseyNumber.toLowerCase();
    const importKey = `${normalizedName}|${normalizedGrade}|${normalizedJersey}`;

    if (seen.has(importKey)) {
      continue;
    }
    seen.add(importKey);

    const matchByNameGrade = existingByNameGrade.get(
      `${normalizedName}|${normalizedGrade}`,
    );
    const matchByJersey = existingByJersey.get(normalizedJersey);

    if (matchByNameGrade) {
      if (
        matchByNameGrade.grade !== row.grade ||
        matchByNameGrade.jerseyNumber !== row.jerseyNumber
      ) {
        await prisma.athlete.update({
          where: { id: matchByNameGrade.id },
          data: {
            grade: row.grade,
            jerseyNumber: row.jerseyNumber,
          },
        });
      }
      continue;
    }

    if (matchByJersey) {
      if (
        matchByJersey.fullName !== row.fullName ||
        matchByJersey.grade !== row.grade
      ) {
        await prisma.athlete.update({
          where: { id: matchByJersey.id },
          data: {
            fullName: row.fullName,
            grade: row.grade,
          },
        });
      }
      continue;
    }

    const athlete = await prisma.athlete.create({
      data: {
        teamId,
        fullName: row.fullName,
        grade: row.grade,
        jerseyNumber: row.jerseyNumber,
      },
    });

    await ensureAttendance(teamId, athlete.id);
  }
}

export async function importAthletes(teamId: string, formData: FormData) {
  await requireTeamAccess(teamId);

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return;
  }

  const csvText = await file.text();
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data
    .map(mapRow)
    .filter((row): row is ParsedRow => Boolean(row));

  await upsertAthletes(teamId, rows);

  revalidatePath(`/team/${teamId}/roster`);
}

export async function saveGoogleSheetUrl(teamId: string, formData: FormData) {
  await requireTeamAccess(teamId);
  const sheetUrl = formData.get("sheetUrl")?.toString() ?? "";
  const normalized = normalizeGoogleSheetCsvUrl(sheetUrl);

  if (!normalized) {
    redirect(`/team/${teamId}/import?status=invalid-link`);
  }

  await prisma.team.update({
    where: { id: teamId },
    data: { googleSheetUrl: normalized },
  });

  revalidatePath(`/team/${teamId}/import`);
  redirect(`/team/${teamId}/import?status=saved`);
}

export async function syncGoogleSheet(teamId: string) {
  await requireTeamAccess(teamId);

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team?.googleSheetUrl) {
    redirect(`/team/${teamId}/import?status=missing-link`);
  }

  const response = await fetch(team.googleSheetUrl, { cache: "no-store" });
  if (!response.ok) {
    redirect(`/team/${teamId}/import?status=sync-failed`);
  }

  const csvText = await response.text();
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data
    .map(mapRow)
    .filter((row): row is ParsedRow => Boolean(row));

  await upsertAthletes(teamId, rows);
  revalidatePath(`/team/${teamId}/roster`);
  redirect(`/team/${teamId}/import?status=synced`);
}
