import Link from "next/link";
import { formatDate } from "@/app/student/status-badge";
import { StatusPill } from "@/components/portal/status-pill";
import type { listCompanies } from "@/lib/data/tpo";

export function CompanyTable({
  companies,
  base,
}: {
  companies: Awaited<ReturnType<typeof listCompanies>>;
  base: string;
}) {
  if (companies.length === 0) {
    return <p className="p-5 text-sm text-[#526987] sm:p-6">No companies here.</p>;
  }

  return (
    <ul className="divide-y divide-[#D9E4F2]">
      {companies.map((company) => {
        const admin = company.members.find((m) => m.isAdmin) ?? company.members[0];
        return (
          <li key={company.id}>
            <Link
              href={`${base}/companies/${company.id}`}
              className="flex flex-col gap-2 p-5 transition hover:bg-[#F0F6FD] sm:flex-row sm:items-center sm:gap-4 sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#152C50]">{company.name}</p>
                <p className="truncate text-sm text-[#526987]">
                  {company.domain} · {company.industry}
                  {admin && ` · ${admin.name} (${admin.user.email})`}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#526987]">
                {admin && !admin.user.emailVerified && (
                  <span className="text-xs font-medium text-amber-700">Email unverified</span>
                )}
                <span>{formatDate(company.createdAt)}</span>
                <StatusPill status={company.status} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
