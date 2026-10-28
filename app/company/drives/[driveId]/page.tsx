import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { ApplicantsTable } from "@/components/drives/applicants-table";
import { DriveDetails } from "@/components/drives/drive-details";
import { DriveStatusPill } from "@/components/drives/drive-status";
import { requireRole } from "@/lib/dal";
import { getRecruiterCompany } from "@/lib/data/company";
import { getApplicants, getDrive } from "@/lib/data/drives";

const statusNotes = {
  DRAFT: "Draft. Only your company can see it. Submit it when it's ready.",
  PENDING_APPROVAL: "Waiting for the placement cell to approve it. You can still edit it.",
  OPEN: "Open. Eligible students can see it and apply until the deadline.",
  CLOSED: "Applications are closed.",
  COMPLETED: "This drive is completed.",
};

export default async function CompanyDrivePage({ params }: PageProps<"/company/drives/[driveId]">) {
  const user = await requireRole("RECRUITER");
  const { driveId } = await params;
  const [membership, drive] = await Promise.all([getRecruiterCompany(user.id), getDrive(driveId)]);
  // Recruiters only ever reach their own company's drives.
  if (!drive || drive.companyId !== membership?.companyId) notFound();
  const applicants = await getApplicants(drive.id);
  const editable = drive.status === "DRAFT" || drive.status === "PENDING_APPROVAL";

  return (
    <div className="grid gap-6">
      <Link
        href="/company/drives"
        className="flex w-fit items-center gap-1 text-sm font-semibold text-[#174A91] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> All drives
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#152C50]">{drive.title}</h1>
            <DriveStatusPill status={drive.status} deadlinePassed={drive.deadlinePassed} />
          </div>
          <p className="mt-1 text-sm text-[#526987]">{statusNotes[drive.status]}</p>
        </div>
        {editable && (
          <Link
            href={`/company/drives/${drive.id}/edit`}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-[#D9E4F2] bg-white px-4 text-sm font-semibold text-[#174A91] transition hover:border-[#174A91] hover:bg-[#F0F6FD]"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>

      {drive.rejectionReason && drive.status === "DRAFT" && (
        <p className="rounded-xl border border-[#F12D32]/30 bg-[#F12D32]/5 p-4 text-sm text-[#8E1418]">
          <span className="font-semibold">Sent back by the placement cell:</span> {drive.rejectionReason}
        </p>
      )}

      <DriveDetails drive={drive} />

      {!editable && (
        <ApplicantsTable
          applicants={applicants}
          csvHref={`/company/drives/${drive.id}/applicants`}
          showPhone={false}
        />
      )}
    </div>
  );
}
