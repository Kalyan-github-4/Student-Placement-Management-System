import "server-only";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, companies, companyInvites, users } from "@/db/schema";

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
  return company ?? null;
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
