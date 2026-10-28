import { notFound } from "next/navigation";
import { DriveForm } from "@/components/drives/drive-form";
import { requireRole } from "@/lib/dal";
import { getRecruiterCompany } from "@/lib/data/company";
import { getDrive } from "@/lib/data/drives";
import { driveToFormValues } from "@/lib/drives";
import { saveCompanyDrive } from "../../../drive-actions";

export default async function EditCompanyDrivePage({ params }: PageProps<"/company/drives/[driveId]/edit">) {
  const user = await requireRole("RECRUITER");
  const { driveId } = await params;
  const [membership, drive] = await Promise.all([getRecruiterCompany(user.id), getDrive(driveId)]);
  if (!drive || drive.companyId !== membership?.companyId) notFound();
  if (drive.status !== "DRAFT" && drive.status !== "PENDING_APPROVAL") {
    return <p className="text-[#526987]">This drive is live. Ask the placement cell to change it.</p>;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Edit drive</h1>
        {drive.rejectionReason && (
          <p className="mt-2 rounded-xl border border-[#F12D32]/30 bg-[#F12D32]/5 p-3 text-sm text-[#8E1418]">
            <span className="font-semibold">Placement cell:</span> {drive.rejectionReason}
          </p>
        )}
      </div>
      <div className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-8">
        <DriveForm
          action={saveCompanyDrive.bind(null, drive.id)}
          defaults={driveToFormValues(drive, drive.criteria)}
          cancelHref={`/company/drives/${drive.id}`}
          primaryLabel="Submit for approval"
          secondaryLabel="Save as draft"
        />
      </div>
    </div>
  );
}
