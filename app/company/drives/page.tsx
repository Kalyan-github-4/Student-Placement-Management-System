import Link from "next/link";
import { Plus } from "lucide-react";
import { DriveList } from "@/components/drives/drive-list";
import { requireRole } from "@/lib/dal";
import { getRecruiterCompany } from "@/lib/data/company";
import { listDrives } from "@/lib/data/drives";

export default async function CompanyDrivesPage() {
  const user = await requireRole("RECRUITER");
  const membership = await getRecruiterCompany(user.id);
  if (!membership) return <p className="text-[#526987]">No company is linked to this account.</p>;

  const approved = membership.company.status === "APPROVED";
  const drives = await listDrives({ companyId: membership.companyId });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#152C50]">Drives</h1>
          <p className="mt-1 text-[#526987]">
            Draft a drive and submit it. The placement cell approves it before eligible students see
            it.
          </p>
        </div>
        {approved && (
          <Link
            href="/company/drives/new"
            className="flex items-center gap-1.5 rounded-lg bg-[#174A91] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#082B63]"
          >
            <Plus className="h-4 w-4" /> New drive
          </Link>
        )}
      </div>

      {!approved && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
          You can post drives once the placement cell approves your company.
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        <DriveList drives={drives} hrefBase="/company/drives" showCompany={false} />
      </section>
    </div>
  );
}
