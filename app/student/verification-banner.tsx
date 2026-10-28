import Link from "next/link";
import { CheckCircle2, Clock, UserRound, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Student } from "@/lib/data/student";
import { SubmitVerificationButton } from "./profile/profile-actions";

// Tells the student where they are in sign-up → profile → verification, and what to do next.
export function VerificationBanner({
  student,
  missing,
  completeness,
}: {
  student: Student;
  missing: string[];
  completeness: number;
}) {
  const status = student.verificationStatus;

  if (status === "VERIFIED") {
    return (
      <Banner tone="success" icon={CheckCircle2} title="Profile verified">
        You can apply to every drive you&apos;re eligible for. Academic details are locked; use a
        correction request on your profile if something is wrong.
      </Banner>
    );
  }

  if (status === "SUBMITTED") {
    return (
      <Banner tone="warning" icon={Clock} title="Waiting for verification">
        The placement cell is checking your details. You&apos;ll get an email when it&apos;s done.
        Editing your profile now takes it out of the queue until you submit again.
      </Banner>
    );
  }

  return (
    <Banner
      tone={status === "REJECTED" ? "error" : "info"}
      icon={status === "REJECTED" ? XCircle : UserRound}
      title={
        status === "REJECTED"
          ? "Your profile needs changes"
          : missing.length > 0
            ? `Complete your profile (${completeness}%)`
            : "Ready to submit"
      }
    >
      {status === "REJECTED" && student.verificationNote && (
        <span className="mb-1 block">
          <span className="font-semibold">Reason:</span> {student.verificationNote}
        </span>
      )}
      {missing.length > 0 ? (
        <>
          Still needed: {missing.join(", ")}. The placement cell verifies your profile before you
          can apply to drives.
        </>
      ) : (
        <>Submit your profile so the placement cell can verify it.</>
      )}
      <span className="mt-3 flex flex-wrap gap-3">
        <Link
          href="/student/profile/edit"
          className="rounded-lg border border-current/30 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-white/70"
        >
          Edit profile
        </Link>
        {missing.length === 0 && <SubmitVerificationButton />}
      </span>
    </Banner>
  );
}

const tones = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-900",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  error: "border-[#F12D32]/40 bg-[#F12D32]/5 text-[#8E1418]",
  info: "border-[#174A91]/30 bg-[#F0F6FD] text-[#152C50]",
};

function Banner({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: keyof typeof tones;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex gap-4 rounded-2xl border p-5", tones[tone])}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="text-sm">
        <p className="text-base font-semibold">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}
