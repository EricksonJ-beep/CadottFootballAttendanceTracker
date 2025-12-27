export function normalizeGoogleSheetCsvUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("export?format=csv")) {
    return trimmed;
  }

  const match = trimmed.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    return null;
  }

  const id = match[1];
  const url = new URL(`https://docs.google.com/spreadsheets/d/${id}/export`);
  url.searchParams.set("format", "csv");

  const gidMatch = trimmed.match(/[?&]gid=(\d+)/);
  if (gidMatch) {
    url.searchParams.set("gid", gidMatch[1]);
  }

  return url.toString();
}
