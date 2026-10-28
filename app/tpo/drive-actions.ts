"use server";

import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { companies, companyUsers, drives, users } from "@/db/schema";
import { auditInsert } from "@/lib/audit";
import { requireRole } from "@/lib/dal";
import { getDrive, notifyEligibleStudents, saveDrive, type DriveStatus } from "@/lib/data/drives";
import { driveFormInput, driveSchema } from "@/lib/drives";
import { sendDriveDecisionEmail } from "@/lib/emails";
import { fieldErrors, type FormState } from "@/lib/forms";

// Creates (driveId null) or edits a drive as the TPO. TPO drives skip approval:
// "publish" opens them straight away, "draft" keeps them hidden.
export async function saveTpoDrive(
  driveId: string | null,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const tpo = await requireRole("TPO");
  const { input, values } = driveFormInput(formData);
  const parsed = driveSchema.safeParse(input);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const publish = formData.get("intent") === "publish";
  if (publish && parsed.data.deadline <= new Date()) {
    return { errors: { deadline: "The deadline must be in the future to publish." }, values };
  }

  let companyId: string;
  let current: Awaited<ReturnType<typeof getDrive>> = null;
  if (driveId) {
    current = await getDrive(driveId);
    if (!current) return { message: "Drive not found.", values };
    if (current.status === "COMPLETED") return { message: "Completed drives can't be edited.", values };
    companyId = current.companyId;
  } else {
    companyId = String(formData.get("companyId") ?? "");
    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.id, companyId), eq(companies.status, "APPROVED")));
    if (!company) return { errors: { companyId: "Choose an approved company." }, values };
  }

  const status: DriveStatus = publish ? "OPEN" : current?.status === "OPEN" ? "OPEN" : "DRAFT";
  const opening = status === "OPEN" && current?.status !== "OPEN";
  const id = await saveDrive({
    driveId,
    companyId,
    input: parsed.data,
    status,
    actorId: tpo.id,
    extra: opening ? { approvedBy: tpo.id, approvedAt: new Date(), rejectionReason: null } : {},
  });
  await auditInsert({
    actorId: tpo.id,
    action: driveId ? "drive.updated" : "drive.created",
    entity: "drive",
    entityId: id,
    before: current ? { status: current.status } : null,
    after: { status, title: parsed.data.title },
  });

  if (opening) notifyEligibleStudents(id);
  redirect(`/tpo/drives/${id}`);
}

const reasonSchema = z.string().trim().min(5, "Give a reason the company can act on.").max(500);

async function recruiterEmails(companyId: string) {
  const rows = await db
    .select({ email: users.email })
    .from(companyUsers)
    .innerJoin(users, eq(companyUsers.userId, users.id))
    .where(eq(companyUsers.companyId, companyId));
  return rows.map((r) => r.email);
}

type Transition = "approve" | "reject" | "close" | "reopen" | "complete";

const transitions: Record<Transition, { from: DriveStatus[]; to: DriveStatus; action: string }> = {
  approve: { from: ["PENDING_APPROVAL"], to: "OPEN", action: "drive.approved" },
  reject: { from: ["PENDING_APPROVAL"], to: "DRAFT", action: "drive.rejected" },
  close: { from: ["OPEN"], to: "CLOSED", action: "drive.closed" },
  reopen: { from: ["CLOSED"], to: "OPEN", action: "drive.reopened" },
  complete: { from: ["CLOSED"], to: "COMPLETED", action: "drive.completed" },
};

export async function changeDriveStatus(
  driveId: string,
  transition: Transition,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const tpo = await requireRole("TPO");
  const drive = await getDrive(driveId);
  if (!drive) return { message: "Drive not found." };
  const { from, to, action } = transitions[transition];
  if (!from.includes(drive.status)) return { message: "The drive's status changed; refresh the page." };

  let reason: string | null = null;
  if (transition === "reject") {
    const parsed = reasonSchema.safeParse(formData.get("reason"));
    if (!parsed.success) return { errors: { reason: parsed.error.issues[0].message } };
    reason = parsed.data;
  }
  if ((transition === "approve" || transition === "reopen") && drive.deadline <= new Date()) {
    return { message: "The deadline has passed. Edit the drive to set a new deadline first." };
  }
  if (to === "OPEN" && drive.company.status !== "APPROVED") {
    return { message: "The company isn't approved, so the drive can't open." };
  }

  await db.batch([
    db
      .update(drives)
      .set({
        status: to,
        rejectionReason: reason,
        updatedAt: new Date(),
        ...(transition === "approve" ? { approvedBy: tpo.id, approvedAt: new Date() } : {}),
      })
      .where(and(eq(drives.id, driveId), inArray(drives.status, from))),
    auditInsert({
      actorId: tpo.id,
      action,
      entity: "drive",
      entityId: driveId,
      before: { status: drive.status },
      after: { status: to, ...(reason ? { reason } : {}) },
    }),
  ]);

  if (transition === "approve" || transition === "reject") {
    const emails = await recruiterEmails(drive.companyId);
    await Promise.all(emails.map((to) => sendDriveDecisionEmail(to, drive.title, transition === "approve", reason)));
  }
  if (transition === "approve") notifyEligibleStudents(driveId);
  refresh();
}
