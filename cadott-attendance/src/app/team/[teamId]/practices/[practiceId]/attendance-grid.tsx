"use client";

import { useMemo, useState, useDeferredValue } from "react";
import AttendanceCard from "./attendance-card";

type AttendanceRecord = {
  attendanceId: string;
  fullName: string;
  grade: string;
  jerseyNumber: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
};

type AttendanceGridProps = {
  teamId: string;
  practiceId: string;
  records: AttendanceRecord[];
};

const filters = ["ALL", "PRESENT", "ABSENT", "EXCUSED"] as const;

export default function AttendanceGrid({
  teamId,
  practiceId,
  records,
}: AttendanceGridProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    return records.filter((record) => {
      if (filter !== "ALL" && record.status !== filter) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      return (
        record.fullName.toLowerCase().includes(normalized) ||
        record.jerseyNumber.toLowerCase().includes(normalized) ||
        record.grade.toLowerCase().includes(normalized)
      );
    });
  }, [records, deferredQuery, filter]);

  const counts = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const excused = records.filter((r) => r.status === "EXCUSED").length;
    return { total, present, absent, excused };
  }, [records]);

  return (
    <div className="mt-6">
      <div className="sticky top-4 z-10 rounded-2xl border border-[color:var(--color-stroke)] bg-[color:var(--color-surface)] p-4 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex flex-1 items-center gap-3 rounded-xl border border-[color:var(--color-stroke)] bg-black/10 px-3 py-2 text-sm text-[color:var(--color-accent-dark)]">
            <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/60">
              Search
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, grade, jersey"
              className="w-full bg-transparent text-sm text-[color:var(--color-accent-dark)] outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((value) => {
              const label =
                value === "ALL"
                  ? `All (${counts.total})`
                  : value === "PRESENT"
                    ? `Present (${counts.present})`
                    : value === "ABSENT"
                      ? `Absent (${counts.absent})`
                      : `Excused (${counts.excused})`;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                    filter === value
                      ? "bg-[color:var(--color-accent)] text-black"
                      : "border border-[color:var(--color-stroke)] text-[color:var(--color-accent-dark)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="surface p-6">
            <p className="text-sm text-[color:var(--color-accent-dark)]/70">
              No athletes match that search or filter.
            </p>
          </div>
        ) : (
          filtered.map((record) => (
            <AttendanceCard
              key={record.attendanceId}
              teamId={teamId}
              practiceId={practiceId}
              attendanceId={record.attendanceId}
              fullName={record.fullName}
              grade={record.grade}
              jerseyNumber={record.jerseyNumber}
              status={record.status}
            />
          ))
        )}
      </div>
    </div>
  );
}
