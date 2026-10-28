export type Role = "SUPER_ADMIN" | "TPO" | "STUDENT" | "RECRUITER";

export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  TPO: "Placement Cell (TPO)",
  STUDENT: "Student",
  RECRUITER: "Company Recruiter",
};

export const portalPaths: Record<Role, string> = {
  SUPER_ADMIN: "/admin",
  TPO: "/tpo",
  STUDENT: "/student",
  RECRUITER: "/company",
};

// Roles that can review and act on placement data (students, companies, drives).
export const placementRoles: Role[] = ["TPO", "SUPER_ADMIN"];

// The placement cell pages are shared: TPOs use them under /tpo, and Super Admin under
// /admin so they never leave their own portal. Links inside the pages start from this.
export function placementBase(role: Role) {
  return role === "SUPER_ADMIN" ? "/admin" : "/tpo";
}
