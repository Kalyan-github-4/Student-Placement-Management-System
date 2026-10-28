import "server-only";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { applications, companies, drives, eligibilityCriteria, students, users } from "@/db/schema";
import { eligibilityIssues } from "@/lib/eligibility";
import { sendNewDriveEmail } from "@/lib/emails";
import { formatDeadline, splitDriveInput, type DriveInput } from "@/lib/drives";

export type DriveStatus = (typeof drives.$inferSelect)["status"];

// Relational queries alias the table, so the column comes from the callback argument.
const deadlinePassed = (fields: { deadline: typeof drives.deadline }) => ({
  deadlinePassed: sql<boolean>`${fields.deadline} <= now()`.as("deadline_passed"),
});

export async function listDrives(filter: { status?: DriveStatus; companyId?: string }) {
  const conditions = [
    filter.status ? eq(drives.status, filter.status) : undefined,
    filter.companyId ? eq(drives.companyId, filter.companyId) : undefined,
  ].filter(Boolean);
  const rows = await db.query.drives.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: desc(drives.createdAt),
    with: { company: { columns: { id: true, name: true, status: true } } },
    extras: deadlinePassed,
  });

  const ids = rows.map((d) => d.id);
  const counts = ids.length
    ? await db
        .select({ driveId: applications.driveId, total: count() })
        .from(applications)
        .where(inArray(applications.driveId, ids))
        .groupBy(applications.driveId)
    : [];
  const byDrive = new Map(counts.map((c) => [c.driveId, c.total]));
  return rows.map((d) => ({ ...d, applicantCount: byDrive.get(d.id) ?? 0 }));
}

export async function countDrivesByStatus(status: DriveStatus) {
  const [row] = await db.select({ total: count() }).from(drives).where(eq(drives.status, status));
  return row.total;
}

export async function getDrive(driveId: string) {
  const drive = await db.query.drives.findFirst({
    where: eq(drives.id, driveId),
    with: { company: true, criteria: true },
    extras: deadlinePassed,
  });
  return drive ?? null;
}

// Applicants with the details a recruiter needs. Phone numbers are deliberately left
// out until shortlisting (PRD privacy rule); the TPO view adds them.
export async function getApplicants(driveId: string) {
  return db
    .select({
      id: applications.id,
      status: applications.status,
      appliedAt: applications.appliedAt,
      resumeId: applications.resumeId,
      studentId: students.id,
      name: students.name,
      email: users.email,
      phone: students.phone,
      rollNumber: students.rollNumber,
      branch: students.branch,
      batch: students.batch,
      cgpa: students.cgpa,
      activeBacklogs: students.activeBacklogs,
      marks10: students.marks10,
      marks12: students.marks12,
    })
    .from(applications)
    .innerJoin(students, eq(applications.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(applications.driveId, driveId))
    .orderBy(desc(applications.appliedAt));
}

export async function getApprovedCompanies() {
  return db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .where(eq(companies.status, "APPROVED"))
    .orderBy(companies.name);
}

// Inserts or updates a drive together with its eligibility row.
export async function saveDrive({
  driveId,
  companyId,
  input,
  status,
  actorId,
  extra = {},
}: {
  driveId: string | null;
  companyId: string;
  input: DriveInput;
  status: DriveStatus;
  actorId: string;
  extra?: Partial<typeof drives.$inferInsert>;
}) {
  const { drive, criteria } = splitDriveInput(input);
  if (driveId) {
    await db.batch([
      db
        .update(drives)
        .set({ ...drive, ...extra, status, updatedAt: new Date() })
        .where(eq(drives.id, driveId)),
      db
        .insert(eligibilityCriteria)
        .values({ driveId, ...criteria })
        .onConflictDoUpdate({ target: eligibilityCriteria.driveId, set: criteria }),
    ]);
    return driveId;
  }
  const [created] = await db
    .insert(drives)
    .values({ ...drive, ...extra, companyId, status, createdBy: actorId })
    .returning({ id: drives.id });
  await db.insert(eligibilityCriteria).values({ driveId: created.id, ...criteria });
  return created.id;
}

// After a drive opens, email every verified student who is eligible. Runs after the
// response is sent so the TPO isn't kept waiting on hundreds of emails.
export function notifyEligibleStudents(driveId: string) {
  after(async () => {
    const drive = await getDrive(driveId);
    if (!drive || drive.status !== "OPEN") return;

    const verified = await db
      .select({ student: students, email: users.email })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(and(eq(students.verificationStatus, "VERIFIED"), eq(users.status, "ACTIVE")));
    const recipients = verified.filter(({ student }) => eligibilityIssues(student, drive.criteria).length === 0);

    const deadline = formatDeadline(drive.deadline);
    for (let i = 0; i < recipients.length; i += 10) {
      await Promise.all(
        recipients
          .slice(i, i + 10)
          .map(({ email }) => sendNewDriveEmail(email, drive.company.name, drive.title, drive.id, deadline))
      );
    }
  });
}
