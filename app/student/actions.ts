"use server";

import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { applications, studentProfiles } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { branches } from "@/lib/branches";
import { eligibilityIssues } from "@/lib/eligibility";
import { getApplyableJob, getStudentProfile } from "@/lib/data/student";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  rollNumber: z.string().trim().min(3, "Enter your university roll number."),
  branch: z.enum(branches, "Select your branch."),
  cgpa: z.coerce
    .number("Enter your CGPA.")
    .min(0, "CGPA must be between 0 and 10.")
    .max(10, "CGPA must be between 0 and 10."),
  backlogs: z.coerce
    .number("Enter your number of backlogs.")
    .int("Backlogs must be a whole number.")
    .min(0, "Backlogs cannot be negative."),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."),
  resumeUrl: z.union([z.literal(""), z.url("Enter a valid link to your resume.")]),
});

export type ProfileFormState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof profileSchema>, string>>;
      values?: Record<string, string>;
    }
  | undefined;

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireRole("STUDENT");
  const values = Object.fromEntries(
    [...formData.entries()].map(([key, value]) => [key, String(value)])
  );

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    const errors: NonNullable<ProfileFormState>["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof typeof errors;
      errors[field] ??= issue.message;
    }
    return { errors, values };
  }

  const data = { ...parsed.data, resumeUrl: parsed.data.resumeUrl || null };

  const [rollTaken] = await db
    .select({ id: studentProfiles.id })
    .from(studentProfiles)
    .where(
      and(eq(studentProfiles.rollNumber, data.rollNumber), ne(studentProfiles.userId, user.id))
    );
  if (rollTaken) {
    return { errors: { rollNumber: "This roll number is already registered." }, values };
  }

  await db
    .insert(studentProfiles)
    .values({ userId: user.id, ...data })
    .onConflictDoUpdate({
      target: studentProfiles.userId,
      set: { ...data, updatedAt: new Date() },
    });

  redirect("/student/profile");
}

export type ApplyState = { error?: string } | undefined;

export async function applyToJob(jobId: string): Promise<ApplyState> {
  const user = await requireRole("STUDENT");
  const profile = await getStudentProfile(user.id);
  if (!profile) return { error: "Complete your profile before applying." };

  const job = await getApplyableJob(jobId);
  if (!job) return { error: "This opening is no longer available." };
  if (eligibilityIssues(profile, job).length > 0) {
    return { error: "You are not eligible for this opening." };
  }

  await db
    .insert(applications)
    .values({ studentId: profile.id, jobId: job.id })
    .onConflictDoNothing();

  refresh();
}
