"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { correctionRequests, students } from "@/db/schema";
import { auditInsert } from "@/lib/audit";
import { requireRole } from "@/lib/dal";
import { getStudentForReview } from "@/lib/data/tpo";
import {
  sendCorrectionDecisionEmail,
  sendProfileRejectedEmail,
  sendProfileVerifiedEmail,
} from "@/lib/emails";
import type { FormState } from "@/lib/forms";
import { academicFields, missingProfileItems, validateAcademicValue, type AcademicField } from "@/lib/student";

const noteSchema = z
  .string()
  .trim()
  .min(5, "Give a reason the student can act on.")
  .max(500, "Keep it under 500 characters.");

export async function verifyStudent(studentId: string): Promise<FormState> {
  const tpo = await requireRole("TPO", "SUPER_ADMIN");
  const review = await getStudentForReview(studentId);
  if (!review) return { message: "Student not found." };
  const { student } = review;
  if (student.verificationStatus !== "SUBMITTED") {
    return { message: "Only submitted profiles can be verified; refresh the page." };
  }
  const missing = missingProfileItems(student, review.resumes.length > 0);
  if (missing.length > 0) return { message: `The profile is incomplete: ${missing.join(", ")}.` };

  await db.batch([
    db
      .update(students)
      .set({
        verificationStatus: "VERIFIED",
        verificationNote: null,
        verifiedBy: tpo.id,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(students.id, studentId), eq(students.verificationStatus, "SUBMITTED"))),
    auditInsert({
      actorId: tpo.id,
      action: "student.verified",
      entity: "student",
      entityId: studentId,
      before: { verificationStatus: "SUBMITTED" },
      // Snapshot of what was verified, for later disputes.
      after: {
        verificationStatus: "VERIFIED",
        ...Object.fromEntries(Object.keys(academicFields).map((f) => [f, student[f as AcademicField]])),
      },
    }),
  ]);
  await sendProfileVerifiedEmail(review.email, student.name);
  refresh();
}

export async function rejectStudent(
  studentId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const tpo = await requireRole("TPO", "SUPER_ADMIN");
  const parsed = noteSchema.safeParse(formData.get("reason"));
  if (!parsed.success) return { errors: { reason: parsed.error.issues[0].message } };

  const review = await getStudentForReview(studentId);
  if (!review) return { message: "Student not found." };
  if (review.student.verificationStatus !== "SUBMITTED") {
    return { message: "Only submitted profiles can be sent back; refresh the page." };
  }

  await db.batch([
    db
      .update(students)
      .set({ verificationStatus: "REJECTED", verificationNote: parsed.data, updatedAt: new Date() })
      .where(and(eq(students.id, studentId), eq(students.verificationStatus, "SUBMITTED"))),
    auditInsert({
      actorId: tpo.id,
      action: "student.rejected",
      entity: "student",
      entityId: studentId,
      before: { verificationStatus: "SUBMITTED" },
      after: { verificationStatus: "REJECTED", reason: parsed.data },
    }),
  ]);
  await sendProfileRejectedEmail(review.email, review.student.name, parsed.data);
  refresh();
}

export async function decideCorrection(
  requestId: string,
  approve: boolean,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const tpo = await requireRole("TPO", "SUPER_ADMIN");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500) || null;
  if (!approve && !note) return { errors: { note: "Say why the request is declined." } };

  const [request] = await db
    .select()
    .from(correctionRequests)
    .where(and(eq(correctionRequests.id, requestId), eq(correctionRequests.status, "PENDING")));
  if (!request) return { message: "This request was already decided; refresh the page." };

  const review = await getStudentForReview(request.studentId);
  if (!review) return { message: "Student not found." };
  const field = request.field as AcademicField;
  const checked = validateAcademicValue(field, request.requestedValue);
  if (approve && checked.error) return { message: `Can't apply this value: ${checked.error}` };

  const now = new Date();
  await db.batch([
    db
      .update(correctionRequests)
      .set({ status: approve ? "APPROVED" : "REJECTED", reviewNote: note, reviewedBy: tpo.id, reviewedAt: now })
      .where(and(eq(correctionRequests.id, requestId), eq(correctionRequests.status, "PENDING"))),
    ...(approve
      ? [
          db
            .update(students)
            .set({ [field]: checked.value, updatedAt: now })
            .where(eq(students.id, request.studentId)),
        ]
      : []),
    auditInsert({
      actorId: tpo.id,
      action: approve ? "student.academic_corrected" : "student.correction_declined",
      entity: "student",
      entityId: request.studentId,
      before: { [field]: request.currentValue },
      after: approve ? { [field]: checked.value, requestId } : { requestId, note },
    }),
  ]);

  await sendCorrectionDecisionEmail(review.email, academicFields[field], approve, note);
  refresh();
}
