import Link from "next/link";
import { ArrowRight, Building2, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/dal";
import {
  getOpenCompanies,
  getStudentApplications,
  getStudentProfile,
} from "@/lib/data/student";
import { JobList } from "./job-list";

export default async function CompaniesPage() {
  const user = await requireRole("STUDENT");
  const [profile, companies] = await Promise.all([
    getStudentProfile(user.id),
    getOpenCompanies(),
  ]);
  const applications = profile ? await getStudentApplications(profile.id) : [];
  const statusByJob = new Map(applications.map((a) => [a.jobId, a.status]));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Companies</h1>
        <p className="mt-1 text-[#526987]">
          Companies hiring through the placement cell and their open positions.
        </p>
      </div>

      {!profile && (
        <p className="rounded-xl border border-[#174A91]/30 bg-white px-4 py-3 text-sm text-[#526987]">
          <Link href="/student/profile/edit" className="font-semibold text-[#174A91] hover:underline">
            Complete your profile
          </Link>{" "}
          to check eligibility and apply.
        </p>
      )}

      {companies.length === 0 && (
        <p className="text-[#526987]">No companies are hiring right now. Check back soon.</p>
      )}

      {companies.map((company) => (
        <section
          key={company.id}
          className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white"
        >
          <div className="flex flex-col gap-4 border-b border-[#D9E4F2] p-5 sm:flex-row sm:items-start sm:p-6">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#082B63]/10 text-[#082B63]">
                <Building2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[#152C50]">
                  <Link href={`/student/companies/${company.id}`} className="hover:text-[#174A91]">
                    {company.name}
                  </Link>
                </h2>
                {company.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-[#526987]">{company.description}</p>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#174A91] hover:underline"
                  >
                    Website <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
            <Link
              href={`/student/companies/${company.id}`}
              className="flex shrink-0 items-center justify-center gap-1 rounded-lg border border-[#D9E4F2] px-4 py-2 text-sm font-semibold text-[#174A91] transition hover:border-[#174A91] hover:bg-[#F0F6FD]"
            >
              View details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <JobList jobs={company.jobPostings} profile={profile} statusByJob={statusByJob} />
        </section>
      ))}
    </div>
  );
}
