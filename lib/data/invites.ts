import "server-only";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { companyInvites } from "@/db/schema";
import { hashToken } from "@/lib/tokens";

export async function getValidInvite(token: string) {
  const [invite] = await db
    .select()
    .from(companyInvites)
    .where(
      and(
        eq(companyInvites.tokenHash, hashToken(token)),
        isNull(companyInvites.acceptedAt),
        gt(companyInvites.expiresAt, sql`now()`)
      )
    );
  return invite ?? null;
}
