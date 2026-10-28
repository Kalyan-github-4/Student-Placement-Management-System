"use server";

import { and, count, eq, ne, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { applications, correctionRequests, documents, drives, students } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { getApplyableDrive, getResumes, getStudent } from "@/lib/data/student";
import { sendApplicationConfirmationEmail } from "@/lib/emails";
import { fieldErrors, formValues, type FormState } from "@/lib/forms";
import { deleteStoredFile, storeFile } from "@/lib/storage";
import {
  academicFields,
  academicSchema,
  missingProfileItems,
  personalSchema,
  validateAcademicValue,
  type AcademicField,
} from "@/lib/student";

const MAX_RESUMES = 5;

async function requireStudent() {
  const user = await requireRole("STUDENT");
  const student = await getStudent(user.id);
  if (!student) throw new Error("Student record missing for user " + user.id);
  return { user, student };
}

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const { student } = await requireStudent();
  const values = formValues(formData);
  const locked = student.verificationStatus === "VERIFIED";

  // Once verified, academic fields come from the database, not the form.
  const schema = locked ? personalSchema : personalSchema.extend(academicSchema.shape);
  const parsed = schema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const data = parsed.data as z.infer<typeof personalSchema> & Partial<z.infer<typeof academicSchema>>;

  if (data.rollNumber) {
    const [taken] = await db
      .select({ id: students.id })
      .from(students)
      .where(and(eq(students.rollNumber, data.rollNumber), ne(students.id, student.id)));
    if (taken) return { errors: { rollNumber: "This roll number is already registered." }, values };
  }

  await db
    .update(students)
    .set({
      ...data,
      updatedAt: new Date(),
      // Editing a submitted profile takes it out of the TPO's queue until resubmitted.
      ...(student.verificationStatus === "SUBMITTED" ? { verificationStatus: "DRAFT" as const } : {}),
    })
    .where(eq(students.id, student.id));

  redirect("/student/profile");
}

export async function submitForVerification(): Promise<FormState> {
  const { user, student } = await requireStudent();
  if (student.verificationStatus !== "DRAFT" && student.verificationStatus !== "REJECTED") {
    return { message: "Your profile has already been submitted." };
  }
  const resumes = await getResumes(user.id);
  const missing = missingProfileItems(student, resumes.length > 0);
  if (missing.length > 0) return { message: `Complete your profile first: ${missing.join(", ")}.` };

  await db
    .update(students)
    .set({ verificationStatus: "SUBMITTED", updatedAt: new Date() })
    .where(eq(students.id, student.id));
  refresh();
}

export async function uploadResume(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireStudent();
  const [{ total }] = await db
    .select({ total: count() })
    .from(documents)
    .where(and(eq(documents.ownerId, user.id), eq(documents.type, "RESUME")));
  if (total >= MAX_RESUMES) {
    return { message: `You can keep up to ${MAX_RESUMES} resumes. Delete one first.` };
  }

  const result = await storeFile("RESUME", formData.get("file"));
  if ("error" in result) return { message: result.error };

  const { storageKey, fileName, mimeType, size } = result.file;
  await db.insert(documents).values({
    storageKey,
    fileName,
    mimeType,
    size,
    ownerId: user.id,
    type: "RESUME",
    // The first resume becomes the default.
    isDefault: total === 0,
  });
  refresh();
  return { message: "Resume uploaded." };
}

async function getOwnResume(userId: string, documentId: string) {
  const [doc] = await db
    .select()
    .from(documents)
    .where(
      and(eq(documents.id, documentId), eq(documents.ownerId, userId), eq(documents.type, "RESUME"))
    );
  return doc ?? null;
}

export async function setDefaultResume(documentId: string): Promise<FormState> {
  const { user } = await requireStudent();
  if (!(await getOwnResume(user.id, documentId))) return { message: "Resume not found." };

  await db
    .update(documents)
    .set({ isDefault: sql`${documents.id} = ${documentId}` })
    .where(and(eq(documents.ownerId, user.id), eq(documents.type, "RESUME")));
  refresh();
}

export async function deleteResume(documentId: string): Promise<FormState> {
  const { user, student } = await requireStudent();
  const doc = await getOwnResume(user.id, documentId);
  if (!doc) return { message: "Resume not found." };

  // Recruiters must keep seeing the resume a student applied with.
  const [inUse] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(and(eq(applications.resumeId, documentId), ne(applications.status, "WITHDRAWN")));
  if (inUse) return { message: "This resume is attached to an application and can't be deleted." };

  const remaining = await getResumes(user.id);
  if (remaining.length === 1 && student.verificationStatus !== "DRAFT") {
    return { message: "Keep at least one resume on your profile." };
  }

  await db.delete(documents).where(eq(documents.id, documentId));
  const next = remaining.find((r) => r.id !== documentId);
  if (doc.isDefault && next) {
    await db.update(documents).set({ isDefault: true }).where(eq(documents.id, next.id));
  }
  await deleteStoredFile(doc.storageKey, "RESUME");
  refresh();
}

const correctionSchema = z.object({
  field: z.enum(Object.keys(academicFields) as [AcademicField, ...AcademicField[]], "Choose a field."),
  requestedValue: z.string().trim().min(1, "Enter the correct value.").max(60),
  reason: z.string().trim().min(10, "Explain why this needs changing (at least 10 characters).").max(500),
});

export async function requestCorrection(_prev: FormState, formData: FormData): Promise<FormState> {
  const { student } = await requireStudent();
  if (student.verificationStatus !== "VERIFIED") {
    return { message: "Your profile isn't locked yet; edit it directly." };
  }
  const values = formValues(formData);
  const parsed = correctionSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { field, requestedValue, reason } = parsed.data;
  const check = validateAcademicValue(field, requestedValue);
  if (check.error) return { errors: { requestedValue: check.error }, values };

  const [pending] = await db
    .select({ id: correctionRequests.id })
    .from(correctionRequests)
    .where(
      and(
        eq(correctionRequests.studentId, student.id),
        eq(correctionRequests.field, field),
        eq(correctionRequests.status, "PENDING")
      )
    );
  if (pending) {
    return { errors: { field: "You already have a pending request for this field." }, values };
  }

  await db.insert(correctionRequests).values({
    studentId: student.id,
    field,
    currentValue: student[field] === null ? null : String(student[field]),
    requestedValue: String(check.value),
    reason,
  });
  refresh();
  return { message: "Request sent to the placement cell." };
}

export async function applyToDrive(driveId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { user, student } = await requireStudent();
  if (student.verificationStatus !== "VERIFIED") {
    return { message: "Your profile must be verified by the placement cell before you can apply." };
  }

  // Re-checks status, deadline, company approval and eligibility on the server.
  const drive = await getApplyableDrive(student, driveId);
  if (!drive) return { message: "This drive is closed or you're not eligible for it." };

  const resumeId = String(formData.get("resumeId") ?? "");
  if (!(await getOwnResume(user.id, resumeId))) return { message: "Choose one of your resumes." };

  const [created] = await db
    .insert(applications)
    .values({ studentId: student.id, driveId, resumeId })
    .onConflictDoNothing()
    .returning({ id: applications.id });
  if (!created) return { message: "You've already applied to this drive." };

  await sendApplicationConfirmationEmail(user.email, drive.company.name, drive.title);
  refresh();
}

export async function withdrawApplication(applicationId: string): Promise<FormState> {
  const { student } = await requireStudent();
  // Only an untouched application, and only before the deadline.
  const [withdrawn] = await db
    .update(applications)
    .set({ status: "WITHDRAWN", withdrawnAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(applications.id, applicationId),
        eq(applications.studentId, student.id),
        eq(applications.status, "APPLIED"),
        sql`exists (select 1 from ${drives} where ${drives.id} = ${applications.driveId} and ${drives.deadline} > now())`
      )
    )
    .returning({ id: applications.id });
  if (!withdrawn) return { message: "This application can no longer be withdrawn." };
  refresh();
}
