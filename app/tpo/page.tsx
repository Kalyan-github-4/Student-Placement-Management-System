import Link from "next/link";
import { ArrowRight, Ban, Building2, Clock, XCircle } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { getCompanyCounts, listCompanies } from "@/lib/data/tpo";
import { CompanyTable } from "./companies/company-table";

export default async function TpoOverview() {
  const user = await requireRole("TPO");
  const [counts, pending] = await Promise.all([getCompanyCounts(), listCompanies("PENDING")]);

  const stats = [
    { label: "Awaiting review", value: counts.PENDING, icon: Clock, status: "PENDING" },
    { label: "Approved companies", value: counts.APPROVED, icon: Building2, status: "APPROVED" },
    { label: "Rejected", value: counts.REJECTED, icon: XCircle, status: "REJECTED" },
    { label: "Suspended", value: counts.SUSPENDED, icon: Ban, status: "SUSPENDED" },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Placement cell</h1>
        <p className="mt-1 text-[#526987]">Signed in as {user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={`/tpo/companies?status=${stat.status}`}
            className="rounded-2xl border border-[#D9E4F2] bg-white p-5 transition hover:border-[#174A91]"
          >
            <stat.icon className="h-5 w-5 text-[#174A91]" />
            <p className="mt-3 text-3xl font-bold text-[#152C50]">{stat.value}</p>
            <p className="text-sm text-[#526987]">{stat.label}</p>
          </Link>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-[#D9E4F2] p-5 sm:px-6">
          <h2 className="text-lg font-semibold text-[#152C50]">Companies awaiting review</h2>
          <Link
            href="/tpo/companies"
            className="flex items-center gap-1 text-sm font-semibold text-[#174A91] hover:underline"
          >
            All companies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <CompanyTable companies={pending} />
      </section>
    </div>
  );
}
