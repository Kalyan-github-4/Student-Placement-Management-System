import "server-only";
import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { applications, companies, correctionRequests, documents, drives, students } from "@/db/schema";
import { eligibilityIssues } from "@/lib/eligibility";

export type Student = typeof students.$inferSelect;

export async function getStudent(userId: string) {
  const [student] = await db.select().from(students).where(eq(students.userId, userId));
  return student ?? null;
}

export async function getResumes(userId: string) {
  return db
    .select()
    .from(documents)
    .where(and(eq(documents.ownerId, userId), eq(documents.type, "RESUME")))
    .orderBy(desc(documents.isDefault), desc(documents.createdAt));
}

export async function getCorrections(studentId: string) {
  return db
    .select()
    .from(correctionRequests)
    .where(eq(correctionRequests.studentId, studentId))
    .orderBy(desc(correctionRequests.createdAt));
}

// Drives a student could apply to right now: open, before the deadline, from an
// approved company. The deadline is compared with the database clock.
const openDriveFilter = and(
  eq(drives.status, "OPEN"),
  gt(drives.deadline, sql`now()`),
  inArray(
    drives.companyId,
    db.select({ id: companies.id }).from(companies).where(eq(companies.status, "APPROVED"))
  )
);

async function getOpenDrives() {
  return db.query.drives.findMany({
    where: openDriveFilter,
    orderBy: asc(drives.deadline),
    with: { company: { columns: { id: true, name: true, logoUrl: true, website: true } }, criteria: true },
  });
}

// Students only ever see drives they are eligible for (PRD), so filtering happens here.
export async function getEligibleDrives(student: Student) {
  const open = await getOpenDrives();
  return open.filter((drive) => eligibilityIssues(student, drive.criteria).length === 0);
}

// The drive if it's open and the student is eligible, otherwise null.
export async function getApplyableDrive(student: Student, driveId: string) {
  const drive = await db.query.drives.findFirst({
    where: and(eq(drives.id, driveId), openDriveFilter),
    with: { company: true, criteria: true },
  });
  if (!drive || eligibilityIssues(student, drive.criteria).length > 0) return null;
  return drive;
}

export async function getStudentApplications(studentId: string) {
  return db.query.applications.findMany({
    where: eq(applications.studentId, studentId),
    orderBy: desc(applications.appliedAt),
    with: {
      drive: {
        columns: { id: true, title: true, deadline: true, status: true, location: true },
        with: { company: { columns: { name: true } } },
      },
      resume: { columns: { id: true, fileName: true } },
    },
  });
}

export async function getApplication(studentId: string, driveId: string) {
  const [application] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.studentId, studentId), eq(applications.driveId, driveId)));
  return application ?? null;
}
