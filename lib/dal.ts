import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { portalPaths, type Role } from "@/lib/roles";

// Re-reads the account on every request so a suspension or role change applies
// immediately, even though the session JWT was issued earlier.
export const getCurrentUser = cache(async () => {
  // auth() re-encrypts the session cookie with a random IV, which can't run in a
  // prerender (even one with cookies available), so defer it to the real request.
  await connection();
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user] = await db
    .select({ id: users.id, email: users.email, role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, session.user.id));
  return user ?? null;
});

export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status === "SUSPENDED") redirect("/login?error=suspended");
  if (!roles.includes(user.role)) redirect(portalPaths[user.role]);
  return user;
}
