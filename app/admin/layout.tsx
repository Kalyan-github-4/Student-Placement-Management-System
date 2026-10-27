import { PortalShell } from "@/components/portal/portal-shell";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <PortalShell title="Super Admin" nav={[{ href: "/admin", label: "TPO Accounts" }]}>
      {children}
    </PortalShell>
  );
}
