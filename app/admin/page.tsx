import { PortalShell, PortalWelcome } from "@/components/portal/portal-shell";

export default function AdminPortal() {
  return (
    <PortalShell title="TPO Portal">
      <PortalWelcome role="ADMIN" />
    </PortalShell>
  );
}
