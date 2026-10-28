import { z } from "zod";
import { branches } from "@/lib/branches";

// Fields used for eligibility. Students fill them in, then they lock on verification.
export const academicFields = {
  rollNumber: "Roll number",
  branch: "Branch",
  batch: "Batch (passing year)",
  cgpa: "CGPA",
  activeBacklogs: "Active backlogs",
  marks10: "Class 10 %",
  marks12: "Class 12 %",
} as const;

export type AcademicField = keyof typeof academicFields;

const number = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .transform(Number)
    .pipe(z.number(message));

const optionalUrl = (message: string) =>
  z.union([z.literal(""), z.url({ protocol: /^https?$/, error: message })]).transform((v) => v || null);

export const academicSchema = z.object({
  rollNumber: z.string().trim().min(3, "Enter your university roll number.").max(40),
  branch: z.enum(branches, "Select your branch."),
  batch: number("Enter your passing year.").pipe(
    z.number().int("Enter a year.").min(2000, "Enter a valid year.").max(2100, "Enter a valid year.")
  ),
  cgpa: number("Enter your CGPA.").pipe(
    z.number().min(0, "CGPA must be between 0 and 10.").max(10, "CGPA must be between 0 and 10.")
  ),
  activeBacklogs: number("Enter your active backlogs.").pipe(
    z.number().int("Backlogs must be a whole number.").min(0, "Backlogs can't be negative.")
  ),
  marks10: number("Enter your Class 10 percentage.").pipe(
    z.number().min(0, "Enter a percentage from 0 to 100.").max(100, "Enter a percentage from 0 to 100.")
  ),
  marks12: number("Enter your Class 12 percentage.").pipe(
    z.number().min(0, "Enter a percentage from 0 to 100.").max(100, "Enter a percentage from 0 to 100.")
  ),
});

export const personalSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."),
  skills: z
    .string()
    .max(500)
    .transform((v) =>
      [...new Set(v.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 30)
    ),
  githubUrl: optionalUrl("Enter a full GitHub URL."),
  linkedinUrl: optionalUrl("Enter a full LinkedIn URL."),
  portfolioUrl: optionalUrl("Enter a full portfolio URL."),
});

// Each academic field validated on its own, for correction requests.
export function validateAcademicValue(field: AcademicField, value: string) {
  const result = academicSchema.shape[field].safeParse(value);
  return result.success
    ? { value: result.data, error: null }
    : { value: null, error: result.error.issues[0].message };
}

type ProfileForCompleteness = {
  name: string;
  phone: string | null;
  rollNumber: string | null;
  branch: string | null;
  batch: number | null;
  cgpa: number | null;
  activeBacklogs: number | null;
  marks10: number | null;
  marks12: number | null;
};

// What a student still needs before they can submit for verification.
export function missingProfileItems(profile: ProfileForCompleteness, hasResume: boolean) {
  const missing: string[] = [];
  if (!profile.phone) missing.push("Mobile number");
  for (const [field, label] of Object.entries(academicFields)) {
    if (profile[field as AcademicField] === null) missing.push(label);
  }
  if (!hasResume) missing.push("Resume");
  return missing;
}

export function profileCompleteness(profile: ProfileForCompleteness, hasResume: boolean) {
  const total = Object.keys(academicFields).length + 2; // + phone + resume
  return Math.round(((total - missingProfileItems(profile, hasResume).length) / total) * 100);
}

export function formatAcademicValue(field: AcademicField, value: string | number | null) {
  if (value === null || value === "") return "—";
  if (field === "marks10" || field === "marks12") return `${value}%`;
  return String(value);
}
