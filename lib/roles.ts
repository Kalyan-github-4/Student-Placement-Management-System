export type Role = "STUDENT" | "COMPANY" | "ADMIN";

// Maps the `?role=` value used by the sign-in dialog to the database role.
export const roleFromParam: Record<string, Role> = {
  student: "STUDENT",
  company: "COMPANY",
  admin: "ADMIN",
};

export const roleLabels: Record<Role, string> = {
  STUDENT: "Student",
  COMPANY: "Company",
  ADMIN: "Placement Cell (TPO)",
};

export const portalPaths: Record<Role, string> = {
  STUDENT: "/student",
  COMPANY: "/company",
  ADMIN: "/admin",
};
