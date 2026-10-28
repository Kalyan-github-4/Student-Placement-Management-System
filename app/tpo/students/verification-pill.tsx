import { cn } from "@/lib/utils";

type VerificationStatus = "DRAFT" | "SUBMITTED" | "VERIFIED" | "REJECTED";

const styles: Record<VerificationStatus, string> = {
  DRAFT: "bg-slate-200 text-slate-700",
  SUBMITTED: "bg-amber-100 text-amber-800",
  VERIFIED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-[#F12D32]/10 text-[#C81E23]",
};

const labels: Record<VerificationStatus, string> = {
  DRAFT: "Incomplete",
  SUBMITTED: "Awaiting verification",
  VERIFIED: "Verified",
  REJECTED: "Sent back",
};

export function VerificationPill({ status }: { status: VerificationStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", styles[status])}>
      {labels[status]}
    </span>
  );
}
