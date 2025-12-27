"use client";

import { useState, useTransition } from "react";
import { updateAttendanceStatus } from "./actions";

type AttendanceCardProps = {
  teamId: string;
  practiceId: string;
  attendanceId: string;
  fullName: string;
  grade: string;
  jerseyNumber: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
};

const statusOrder = ["ABSENT", "PRESENT", "EXCUSED"] as const;

const statusStyles = {
  PRESENT: "border-emerald-500/60 bg-emerald-900/30",
  ABSENT: "border-red-500/60 bg-red-900/30",
  EXCUSED: "border-amber-500/60 bg-amber-900/30",
};

const statusLabel = {
  PRESENT: "Present",
  ABSENT: "Absent",
  EXCUSED: "Excused",
};

export default function AttendanceCard({
  teamId,
  practiceId,
  attendanceId,
  fullName,
  grade,
  jerseyNumber,
  status,
}: AttendanceCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextIndex =
      (statusOrder.indexOf(currentStatus) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];
    setCurrentStatus(nextStatus);
    startTransition(async () => {
      await updateAttendanceStatus(
        teamId,
        practiceId,
        attendanceId,
        nextStatus,
      );
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition ${
        statusStyles[currentStatus]
      } ${isPending ? "opacity-70" : "hover:-translate-y-1 hover:shadow-lg"}`}
    >
      <p className="text-lg font-semibold text-[color:var(--color-accent-dark)]">
        {fullName}
      </p>
      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent-dark)]/70">
        Grade {grade} • Jersey {jerseyNumber}
      </p>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-dark)]/70">
        {statusLabel[currentStatus]}
      </span>
    </button>
  );
}
