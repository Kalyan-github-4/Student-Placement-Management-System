import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { portalPaths, type Role } from "@/lib/roles";

export async function requireRole(role: Role) {
  const session = await auth();
  if (!session?.user) redirect(`/login?role=${role.toLowerCase()}`);
  if (session.user.role !== role) redirect(portalPaths[session.user.role]);
  return session.user;
}
