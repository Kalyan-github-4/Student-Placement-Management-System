import { DriveForm } from "@/components/drives/drive-form";
import { requireRole } from "@/lib/dal";
import { getRecruiterCompany } from "@/lib/data/company";
import { saveCompanyDrive } from "../../drive-actions";

export default async function NewCompanyDrivePage() {
  const user = await requireRole("RECRUITER");
  const membership = await getRecruiterCompany(user.id);
  if (membership?.company.status !== "APPROVED") {
    return <p className="text-[#526987]">You can post drives once your company is approved.</p>;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">New drive</h1>
        <p className="mt-1 text-[#526987]">
          Save a draft to finish later, or submit it to the placement cell for approval.
        </p>
      </div>
      <div className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-8">
        <DriveForm
          action={saveCompanyDrive.bind(null, null)}
          cancelHref="/company/drives"
          primaryLabel="Submit for approval"
          secondaryLabel="Save as draft"
        />
      </div>
    </div>
  );
}
