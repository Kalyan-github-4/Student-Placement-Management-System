import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { eligibilityIssues } from "@/lib/eligibility";
import {
  getOpenCompany,
  getStudentApplications,
  getStudentProfile,
} from "@/lib/data/student";
import { JobList } from "../job-list";

export default async function CompanyDetailsPage({
  params,
}: PageProps<"/student/companies/[companyId]">) {
  const { companyId } = await params;
  const user = await requireRole("STUDENT");
  const [profile, company] = await Promise.all([
    getStudentProfile(user.id),
    getOpenCompany(companyId),
  ]);
  if (!company) notFound();

  const applications = profile ? await getStudentApplications(profile.id) : [];
  const statusByJob = new Map(applications.map((a) => [a.jobId, a.status]));

  const jobs = company.jobPostings;
  const locations = [...new Set(jobs.flatMap((job) => job.location ?? []))];
  const packages = jobs.flatMap((job) => job.salaryPackage ?? []);
  const branches = jobs.some((job) => job.allowedBranches.length === 0)
    ? ["All branches"]
    : [...new Set(jobs.flatMap((job) => job.allowedBranches))];
  const eligibleCount = profile
    ? jobs.filter((job) => eligibilityIssues(profile, job).length === 0).length
    : null;

  const facts = [
    { label: "Open positions", value: String(jobs.length) },
    { label: "Locations", value: locations.join(", ") || "—" },
    { label: "Packages", value: packages.join(" · ") || "—" },
    { label: "Hiring from", value: branches.join(", ") || "—" },
    ...(eligibleCount !== null
      ? [{ label: "You're eligible for", value: `${eligibleCount} of ${jobs.length} openings` }]
      : []),
  ];

  return (
    <div className="grid gap-6">
      <Link
        href="/student/companies"
        className="flex w-fit items-center gap-1 text-sm font-semibold text-[#174A91] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> All companies
      </Link>

      <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#082B63]/10 text-[#082B63]">
            <Building2 className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-[#152C50]">{company.companyName}</h1>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium break-all text-[#174A91] hover:underline"
              >
                {company.website.replace(/^https?:\/\//, "")}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-[#D9E4F2] pt-6">
          <h2 className="text-sm font-semibold tracking-wide text-[#526987] uppercase">About</h2>
          <p className="mt-2 text-[#3A5170]">
            {company.description || "No description provided."}
          </p>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-5 border-t border-[#D9E4F2] pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-sm text-[#526987]">{fact.label}</dt>
              <dd className="mt-0.5 font-medium text-[#152C50]">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        <h2 className="border-b border-[#D9E4F2] px-5 py-4 text-lg font-semibold text-[#152C50] sm:px-6">
          Open positions
        </h2>
        {jobs.length === 0 ? (
          <p className="p-5 text-sm text-[#526987] sm:p-6">No open positions right now.</p>
        ) : (
          <JobList jobs={jobs} profile={profile} statusByJob={statusByJob} />
        )}
      </section>
    </div>
  );
}
