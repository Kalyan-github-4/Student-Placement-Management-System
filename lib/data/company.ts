import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companyUsers } from "@/db/schema";

// The recruiter's membership row with their company.
export async function getRecruiterCompany(userId: string) {
  const membership = await db.query.companyUsers.findFirst({
    where: eq(companyUsers.userId, userId),
    with: { company: true },
  });
  return membership ?? null;
}
