import { FilterTabs, pickStatus } from "@/components/portal/filter-tabs";
import { requireRole } from "@/lib/dal";
import { listCompanies, type CompanyStatus } from "@/lib/data/tpo";
import { CompanyTable } from "./company-table";

const statuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;

export default async function TpoCompaniesPage({ searchParams }: PageProps<"/tpo/companies">) {
  await requireRole("TPO", "SUPER_ADMIN");
  const status = pickStatus<CompanyStatus>((await searchParams).status, statuses);
  const companies = await listCompanies(status);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Companies</h1>
        <p className="mt-1 text-[#526987]">Review registrations and manage company access.</p>
      </div>

      <FilterTabs
        basePath="/tpo/companies"
        active={status}
        options={[
          { label: "All" },
          { label: "Pending", status: "PENDING" },
          { label: "Approved", status: "APPROVED" },
          { label: "Rejected", status: "REJECTED" },
          { label: "Suspended", status: "SUSPENDED" },
        ]}
      />

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        <CompanyTable companies={companies} />
      </section>
    </div>
  );
}
