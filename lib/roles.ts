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
