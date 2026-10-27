import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { portalPaths, type Role } from "@/lib/roles";

// Re-reads the account on every request so a suspension or role change applies
// immediately, even though the session JWT was issued earlier.
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user] = await db
    .select({ id: users.id, email: users.email, role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, session.user.id));
  return user ?? null;
});

export async function requireRole(role: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status === "SUSPENDED") redirect("/login?error=suspended");
  if (user.role !== role) redirect(portalPaths[user.role]);
  return user;
}
