import { z } from "zod";
import { branches } from "@/lib/branches";

// Display helpers shared by the student, company and TPO drive pages.

export const driveTypeLabels = {
  FULL_TIME: "Full-time",
  INTERNSHIP: "Internship",
  BOTH: "Internship + full-time",
} as const;

export function formatPay(drive: { ctcLpa: number | null; stipend: string | null }) {
  const parts = [];
  if (drive.ctcLpa !== null) parts.push(`${drive.ctcLpa} LPA`);
  if (drive.stipend) parts.push(`Stipend ${drive.stipend}`);
  return parts.join(" · ") || "Not disclosed";
}

export function formatDeadline(date: Date) {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ---- Form schema shared by TPO-created and company-proposed drives ----


const optionalNumber = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= min && v <= max), { error: message });

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((v) => v || null);

// <input type="datetime-local"> has no time zone; the college runs on IST.
export function parseIstDateTime(value: string) {
  const date = new Date(`${value}:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toIstInputValue(date: Date) {
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 16);
}

export const driveSchema = z
  .object({
    title: z.string().trim().min(3, "Enter the role title.").max(120),
    type: z.enum(["FULL_TIME", "INTERNSHIP", "BOTH"], "Choose the role type."),
    ctcLpa: optionalNumber(0, 200, "Enter CTC in LPA, e.g. 6.5."),
    stipend: optionalText(60),
    location: z.string().trim().min(2, "Enter the job location.").max(120),
    description: z.string().trim().min(30, "Describe the role in at least 30 characters.").max(5000),
    bondDetails: optionalText(300),
    deadline: z
      .string()
      .transform((v, ctx) => {
        const date = parseIstDateTime(v);
        if (!date) ctx.addIssue({ code: "custom", message: "Choose the application deadline." });
        return date ?? new Date(0);
      }),
    minCgpa: optionalNumber(0, 10, "CGPA must be between 0 and 10."),
    branches: z.array(z.enum(branches)),
    batch: optionalNumber(2000, 2100, "Enter a passing year, e.g. 2027."),
    maxBacklogs: optionalNumber(0, 50, "Enter a whole number of backlogs."),
    min10: optionalNumber(0, 100, "Enter a percentage from 0 to 100."),
    min12: optionalNumber(0, 100, "Enter a percentage from 0 to 100."),
  })
  .refine((d) => d.type === "INTERNSHIP" || d.ctcLpa !== null, {
    path: ["ctcLpa"],
    error: "Enter the CTC for a full-time role.",
  })
  .refine((d) => d.type === "FULL_TIME" || d.stipend !== null, {
    path: ["stipend"],
    error: "Enter the stipend for an internship.",
  })
  .refine((d) => d.batch === null || Number.isInteger(d.batch), { path: ["batch"], error: "Enter a year." })
  .refine((d) => d.maxBacklogs === null || Number.isInteger(d.maxBacklogs), {
    path: ["maxBacklogs"],
    error: "Enter a whole number.",
  });

export type DriveInput = z.infer<typeof driveSchema>;

// Splits validated form data into the drive row and its eligibility row.
export function splitDriveInput(input: DriveInput) {
  const { minCgpa, branches, batch, maxBacklogs, min10, min12, ...drive } = input;
  return { drive, criteria: { minCgpa, branches, batch, maxBacklogs, min10, min12 } };
}

export function driveFormInput(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && key !== "branches" && !key.startsWith("$")) values[key] = value;
  }
  const selected = formData.getAll("branches").map(String);
  return { input: { ...values, branches: selected }, values: { ...values, branches: selected.join("|") } };
}

type DriveRow = {
  title: string;
  type: string;
  ctcLpa: number | null;
  stipend: string | null;
  location: string;
  description: string;
  bondDetails: string | null;
  deadline: Date;
};
type CriteriaRow = {
  minCgpa: number | null;
  branches: string[];
  batch: number | null;
  maxBacklogs: number | null;
  min10: number | null;
  min12: number | null;
} | null;

// Stored drive → form field strings, for the edit forms.
export function driveToFormValues(drive: DriveRow, criteria: CriteriaRow) {
  const str = (v: string | number | null | undefined) => (v === null || v === undefined ? "" : String(v));
  return {
    title: drive.title,
    type: drive.type,
    ctcLpa: str(drive.ctcLpa),
    stipend: str(drive.stipend),
    location: drive.location,
    description: drive.description,
    bondDetails: str(drive.bondDetails),
    deadline: toIstInputValue(drive.deadline),
    minCgpa: str(criteria?.minCgpa),
    branches: (criteria?.branches ?? []).join("|"),
    batch: str(criteria?.batch),
    maxBacklogs: str(criteria?.maxBacklogs),
    min10: str(criteria?.min10),
    min12: str(criteria?.min12),
  };
}
