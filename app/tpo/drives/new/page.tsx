import { DriveForm } from "@/components/drives/drive-form";
import { requireRole } from "@/lib/dal";
import { getApprovedCompanies } from "@/lib/data/drives";
import { saveTpoDrive } from "../../drive-actions";

export default async function NewTpoDrivePage() {
  await requireRole("TPO", "SUPER_ADMIN");
  const companies = await getApprovedCompanies();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">New drive</h1>
        <p className="mt-1 text-[#526987]">
          Drives you publish open immediately and eligible students are emailed.
        </p>
      </div>
      <div className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-8">
        <DriveForm
          action={saveTpoDrive.bind(null, null)}
          companies={companies}
          cancelHref="/tpo/drives"
          primaryLabel="Publish drive"
          secondaryLabel="Save as draft"
        />
      </div>
    </div>
  );
}
