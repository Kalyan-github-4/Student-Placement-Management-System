import { PortalShell, PortalWelcome } from "@/components/portal/portal-shell";

export default function CompanyPortal() {
  return (
    <PortalShell title="Company Portal">
      <PortalWelcome role="COMPANY" />
    </PortalShell>
  );
}
