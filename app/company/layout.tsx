import { PortalShell } from "@/components/portal/portal-shell";

const nav = [
  { href: "/company", label: "Overview" },
  { href: "/company/profile/edit", label: "Company Profile" },
];

export default function CompanyLayout({ children }: LayoutProps<"/company">) {
  return (
    <PortalShell title="Company Portal" nav={nav}>
      {children}
    </PortalShell>
  );
}
