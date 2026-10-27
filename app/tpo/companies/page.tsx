import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { listCompanies, type CompanyStatus } from "@/lib/data/tpo";
import { cn } from "@/lib/utils";
import { CompanyTable } from "./company-table";

const filters: { label: string; status?: CompanyStatus }[] = [
  { label: "All" },
  { label: "Pending", status: "PENDING" },
  { label: "Approved", status: "APPROVED" },
  { label: "Rejected", status: "REJECTED" },
  { label: "Suspended", status: "SUSPENDED" },
];

export default async function TpoCompaniesPage({ searchParams }: PageProps<"/tpo/companies">) {
  await requireRole("TPO");
  const { status: param } = await searchParams;
  const active = filters.find((f) => f.status === param) ?? filters[0];
  const companies = await listCompanies(active.status);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Companies</h1>
        <p className="mt-1 text-[#526987]">Review registrations and manage company access.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={filter.status ? `/tpo/companies?status=${filter.status}` : "/tpo/companies"}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition",
              filter === active
                ? "border-[#174A91] bg-[#174A91] text-white"
                : "border-[#D9E4F2] bg-white text-[#526987] hover:border-[#174A91] hover:text-[#174A91]"
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        <CompanyTable companies={companies} />
      </section>
    </div>
  );
}
