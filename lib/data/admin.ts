import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tpoProfiles, users } from "@/db/schema";

export async function listTpos() {
  return db
    .select({
      id: users.id,
      email: users.email,
      status: users.status,
      activated: users.passwordHash,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt,
      name: tpoProfiles.name,
      designation: tpoProfiles.designation,
    })
    .from(users)
    .innerJoin(tpoProfiles, eq(tpoProfiles.userId, users.id))
    .where(eq(users.role, "TPO"))
    .orderBy(desc(users.createdAt))
    .then((rows) => rows.map(({ activated, ...row }) => ({ ...row, activated: !!activated })));
}
