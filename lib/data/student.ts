import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, companyProfiles, jobPostings, studentProfiles } from "@/db/schema";

export async function getStudentProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId));
  return profile ?? null;
}

// Approved companies with their approved openings.
export async function getOpenCompanies() {
  const companies = await db.query.companyProfiles.findMany({
    where: eq(companyProfiles.status, "APPROVED"),
    orderBy: companyProfiles.companyName,
    with: {
      jobPostings: {
        where: eq(jobPostings.status, "APPROVED"),
        orderBy: desc(jobPostings.createdAt),
      },
    },
  });
  return companies.filter((company) => company.jobPostings.length > 0);
}

export async function getOpenCompany(companyId: string) {
  const company = await db.query.companyProfiles.findFirst({
    where: and(eq(companyProfiles.id, companyId), eq(companyProfiles.status, "APPROVED")),
    with: {
      jobPostings: {
        where: eq(jobPostings.status, "APPROVED"),
        orderBy: desc(jobPostings.createdAt),
      },
    },
  });
  return company ?? null;
}

export async function getStudentApplications(studentId: string) {
  return db.query.applications.findMany({
    where: eq(applications.studentId, studentId),
    orderBy: desc(applications.appliedAt),
    with: { job: { with: { company: true } } },
  });
}

export async function getApplyableJob(jobId: string) {
  const [row] = await db
    .select({ job: jobPostings })
    .from(jobPostings)
    .innerJoin(companyProfiles, eq(jobPostings.companyId, companyProfiles.id))
    .where(
      and(
        eq(jobPostings.id, jobId),
        eq(jobPostings.status, "APPROVED"),
        eq(companyProfiles.status, "APPROVED")
      )
    );
  return row?.job ?? null;
}
