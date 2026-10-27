import { PortalShell } from "@/components/portal/portal-shell";

const nav = [
  { href: "/tpo", label: "Overview" },
  { href: "/tpo/companies", label: "Companies" },
  { href: "/tpo/invite", label: "Invite Company" },
];

export default function TpoLayout({ children }: LayoutProps<"/tpo">) {
  return (
    <PortalShell title="TPO Portal" nav={nav}>
      {children}
    </PortalShell>
  );
}
