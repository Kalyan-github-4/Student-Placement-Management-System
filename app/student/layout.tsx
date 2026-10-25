import { PortalShell } from "@/components/portal/portal-shell";

const nav = [
  { href: "/student", label: "Overview" },
  { href: "/student/profile", label: "My Profile" },
  { href: "/student/companies", label: "Companies" },
  { href: "/student/applications", label: "My Applications" },
];

export default function StudentLayout({ children }: LayoutProps<"/student">) {
  return (
    <PortalShell title="Student Portal" nav={nav}>
      {children}
    </PortalShell>
  );
}
