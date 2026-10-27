import { cn } from "@/lib/utils";

const tones = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-[#F12D32]/10 text-[#C81E23]",
  SUSPENDED: "bg-slate-200 text-slate-700",
} as const;

export function StatusPill({ status }: { status: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        tones[status]
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

export function formatDateTime(date: Date) {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
