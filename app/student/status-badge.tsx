import { cn } from "@/lib/utils";

type Status = "APPLIED" | "SHORTLISTED" | "REJECTED" | "HIRED";

const styles: Record<Status, string> = {
  APPLIED: "bg-[#174A91]/10 text-[#174A91]",
  SHORTLISTED: "bg-amber-100 text-amber-800",
  REJECTED: "bg-[#F12D32]/10 text-[#C81E23]",
  HIRED: "bg-emerald-100 text-emerald-800",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        styles[status]
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
