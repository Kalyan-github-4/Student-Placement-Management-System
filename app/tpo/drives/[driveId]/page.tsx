import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { ApplicantsTable } from "@/components/drives/applicants-table";
import { DriveDetails } from "@/components/drives/drive-details";
import { DriveStatusPill } from "@/components/drives/drive-status";
import { ActionButton, ReasonDialogButton } from "@/components/portal/action-buttons";
import { requireRole } from "@/lib/dal";
import { placementBase, placementRoles } from "@/lib/roles";
import { getApplicants, getDrive } from "@/lib/data/drives";
import { changeDriveStatus } from "../../drive-actions";

export default async function TpoDrivePage({ params }: PageProps<"/tpo/drives/[driveId]">) {
  const base = placementBase((await requireRole(...placementRoles)).role);
  const { driveId } = await params;
  const [drive, applicants] = await Promise.all([getDrive(driveId), getApplicants(driveId)]);
  if (!drive) notFound();

  const status = (transition: "approve" | "close" | "reopen" | "complete") =>
    changeDriveStatus.bind(null, drive.id, transition);

  return (
    <div className="grid gap-6">
      <Link
        href={`${base}/drives`}
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
          <p className="mt-1 text-[#526987]">
            <Link href={`${base}/companies/${drive.companyId}`} className="hover:text-[#174A91] hover:underline">
              {drive.company.name}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {drive.status !== "COMPLETED" && (
            <Link
              href={`${base}/drives/${drive.id}/edit`}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-[#D9E4F2] bg-white px-4 text-sm font-semibold text-[#174A91] transition hover:border-[#174A91] hover:bg-[#F0F6FD]"
            >
              <Pencil className="h-4 w-4" /> Edit
            </Link>
          )}
          {drive.status === "PENDING_APPROVAL" && (
            <>
              <ActionButton action={status("approve")} label="Approve and open" />
              <ReasonDialogButton
                action={changeDriveStatus.bind(null, drive.id, "reject")}
                label="Send back"
                title="Send this drive back?"
                description="It returns to the company as a draft with your reason."
              />
            </>
          )}
          {drive.status === "OPEN" && (
            <ActionButton
              action={status("close")}
              label="Close applications"
              variant="outline"
              confirmText="Close this drive? Students can no longer apply."
            />
          )}
          {drive.status === "CLOSED" && (
            <>
              <ActionButton action={status("reopen")} label="Reopen" variant="outline" />
              <ActionButton
                action={status("complete")}
                label="Mark completed"
                confirmText="Mark this drive completed? It can't be edited afterwards."
              />
            </>
          )}
        </div>
      </div>

      {drive.rejectionReason && drive.status === "DRAFT" && (
        <p className="rounded-xl border border-[#F12D32]/30 bg-[#F12D32]/5 p-4 text-sm text-[#8E1418]">
          <span className="font-semibold">Sent back:</span> {drive.rejectionReason}
        </p>
      )}

      <DriveDetails drive={drive} />

      <ApplicantsTable applicants={applicants} csvHref={`${base}/drives/${drive.id}/applicants`} showPhone />
    </div>
  );
}
