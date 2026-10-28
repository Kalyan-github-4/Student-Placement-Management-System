import "server-only";
import { NextResponse } from "next/server";
import type { getApplicants } from "@/lib/data/drives";

function cell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  // Quote everything; also defuse cells Excel would run as formulas.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  return [headers.map(cell).join(","), ...rows.map((row) => headers.map((h) => cell(row[h])).join(","))].join(
    "\r\n"
  );
}

export function csvResponse(fileName: string, csv: string) {
  // The BOM makes Excel open UTF-8 (₹, names with accents) correctly.
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName.replace(/[^\w.-]+/g, "_")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export function applicantRows(applicants: Awaited<ReturnType<typeof getApplicants>>, includePhone: boolean) {
  return applicants.map((a) => ({
    Name: a.name,
    "Roll number": a.rollNumber,
    Email: a.email,
    ...(includePhone ? { Phone: a.phone } : {}),
    Branch: a.branch,
    Batch: a.batch,
    CGPA: a.cgpa,
    "Active backlogs": a.activeBacklogs,
    "Class 10 %": a.marks10,
    "Class 12 %": a.marks12,
    Status: a.status,
    "Applied at": a.appliedAt.toISOString(),
  }));
}
