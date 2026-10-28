import { cn } from "@/lib/utils";

type DriveStatus = "DRAFT" | "PENDING_APPROVAL" | "OPEN" | "CLOSED" | "COMPLETED";

const styles: Record<DriveStatus, string> = {
  DRAFT: "bg-slate-200 text-slate-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-800",
  OPEN: "bg-emerald-100 text-emerald-800",
  CLOSED: "bg-[#174A91]/10 text-[#174A91]",
  COMPLETED: "bg-violet-100 text-violet-800",
};

const labels: Record<DriveStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Awaiting approval",
  OPEN: "Open",
  CLOSED: "Closed",
  COMPLETED: "Completed",
};

// An open drive past its deadline accepts no applications, so it reads as closed.
// `deadlinePassed` comes from the database clock, not the render-time clock.
export function DriveStatusPill({ status, deadlinePassed }: { status: DriveStatus; deadlinePassed: boolean }) {
  const expired = status === "OPEN" && deadlinePassed;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        expired ? styles.CLOSED : styles[status]
      )}
    >
      {expired ? "Deadline passed" : labels[status]}
    </span>
  );
}
