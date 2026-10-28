import "server-only";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
  companies,
  companyInvites,
  correctionRequests,
  documents,
  students,
  users,
} from "@/db/schema";

export type CompanyStatus = (typeof companies.$inferSelect)["status"];

export async function getCompanyCounts() {
  const rows = await db
    .select({ status: companies.status, count: count() })
    .from(companies)
    .groupBy(companies.status);
  const counts: Record<CompanyStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    SUSPENDED: 0,
  };
  for (const row of rows) counts[row.status] = row.count;
  return counts;
}

export async function listCompanies(status?: CompanyStatus) {
  return db.query.companies.findMany({
    where: status ? eq(companies.status, status) : undefined,
    orderBy: desc(companies.createdAt),
    with: {
      members: {
        columns: { name: true, isAdmin: true },
        with: { user: { columns: { email: true, emailVerified: true } } },
      },
    },
  });
}

export async function getCompanyForReview(companyId: string) {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    with: {
      members: {
        with: {
          user: { columns: { email: true, emailVerified: true, status: true, lastLogin: true } },
        },
      },
    },
  });
  if (!company) return null;

  const memberIds = company.members.map((m) => m.userId);
  const authLetters = memberIds.length
    ? await db
        .select({ id: documents.id, fileName: documents.fileName })
        .from(documents)
        .where(and(inArray(documents.ownerId, memberIds), eq(documents.type, "AUTH_LETTER")))
    : [];
  return { ...company, authLetters };
}

export async function getEntityHistory(entity: string, entityId: string) {
  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      after: auditLogs.after,
      at: auditLogs.at,
      actorEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .where(and(eq(auditLogs.entity, entity), eq(auditLogs.entityId, entityId)))
    .orderBy(desc(auditLogs.at));
}

export async function listInvites() {
  // Expiry is decided by the database clock so the page doesn't read the time while rendering.
  return db
    .select({
      id: companyInvites.id,
      email: companyInvites.email,
      companyName: companyInvites.companyName,
      acceptedAt: companyInvites.acceptedAt,
      createdAt: companyInvites.createdAt,
      expired: sql<boolean>`${companyInvites.expiresAt} < now()`,
    })
    .from(companyInvites)
    .orderBy(desc(companyInvites.createdAt))
    .limit(50);
}

export type VerificationStatus = (typeof students.$inferSelect)["verificationStatus"];

export async function getStudentCounts() {
  const rows = await db
    .select({ status: students.verificationStatus, count: count() })
    .from(students)
    .groupBy(students.verificationStatus);
  const counts: Record<VerificationStatus, number> = { DRAFT: 0, SUBMITTED: 0, VERIFIED: 0, REJECTED: 0 };
  for (const row of rows) counts[row.status] = row.count;
  return counts;
}

export async function listStudents(status?: VerificationStatus) {
  return db
    .select({
      id: students.id,
      name: students.name,
      email: users.email,
      emailVerified: users.emailVerified,
      rollNumber: students.rollNumber,
      branch: students.branch,
      batch: students.batch,
      cgpa: students.cgpa,
      verificationStatus: students.verificationStatus,
      updatedAt: students.updatedAt,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(status ? eq(students.verificationStatus, status) : undefined)
    .orderBy(desc(students.updatedAt))
    .limit(200);
}

export async function getStudentForReview(studentId: string) {
  const [row] = await db
    .select({ student: students, email: users.email, userStatus: users.status })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(students.id, studentId));
  if (!row) return null;

  const [resumes, corrections] = await Promise.all([
    db
      .select()
      .from(documents)
      .where(and(eq(documents.ownerId, row.student.userId), eq(documents.type, "RESUME")))
      .orderBy(desc(documents.isDefault), desc(documents.createdAt)),
    db
      .select()
      .from(correctionRequests)
      .where(eq(correctionRequests.studentId, studentId))
      .orderBy(desc(correctionRequests.createdAt)),
  ]);
  return { ...row, resumes, corrections };
}

export async function listPendingCorrections() {
  return db
    .select({
      request: correctionRequests,
      studentName: students.name,
      rollNumber: students.rollNumber,
    })
    .from(correctionRequests)
    .innerJoin(students, eq(correctionRequests.studentId, students.id))
    .where(eq(correctionRequests.status, "PENDING"))
    .orderBy(correctionRequests.createdAt);
}
