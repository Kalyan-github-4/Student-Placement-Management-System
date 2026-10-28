import { PortalShell } from "@/components/portal/portal-shell";

// Besides TPO accounts, Super Admin gets the placement cell pages inside this portal.
const nav = [
  { href: "/admin", label: "TPO Accounts" },
  { href: "/admin/overview", label: "Placement Overview" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/corrections", label: "Corrections" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/drives", label: "Drives" },
  { href: "/admin/invite", label: "Invite Company" },
  { href: "/admin/audit", label: "Audit Log" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <PortalShell title="Super Admin" nav={nav}>
      {children}
    </PortalShell>
  );
}
