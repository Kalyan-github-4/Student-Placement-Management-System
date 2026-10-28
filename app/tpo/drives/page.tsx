import Link from "next/link";
import { Plus } from "lucide-react";
import { DriveList } from "@/components/drives/drive-list";
import { FilterTabs, pickStatus } from "@/components/portal/filter-tabs";
import { requireRole } from "@/lib/dal";
import { listDrives, type DriveStatus } from "@/lib/data/drives";

const statuses = ["DRAFT", "PENDING_APPROVAL", "OPEN", "CLOSED", "COMPLETED"] as const;

export default async function TpoDrivesPage({ searchParams }: PageProps<"/tpo/drives">) {
  await requireRole("TPO");
  const status = pickStatus<DriveStatus>((await searchParams).status, statuses);
  const drives = await listDrives({ status });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#152C50]">Drives</h1>
          <p className="mt-1 text-[#526987]">
            Create drives, approve the ones companies propose, and track applicants.
          </p>
        </div>
        <Link
          href="/tpo/drives/new"
          className="flex items-center gap-1.5 rounded-lg bg-[#174A91] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#082B63]"
        >
          <Plus className="h-4 w-4" /> New drive
        </Link>
      </div>

      <FilterTabs
        basePath="/tpo/drives"
        active={status}
        options={[
          { label: "All" },
          { label: "Awaiting approval", status: "PENDING_APPROVAL" },
          { label: "Open", status: "OPEN" },
          { label: "Closed", status: "CLOSED" },
          { label: "Drafts", status: "DRAFT" },
          { label: "Completed", status: "COMPLETED" },
        ]}
      />

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        <DriveList drives={drives} hrefBase="/tpo/drives" showCompany />
      </section>
    </div>
  );
}
