import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, FileText, UserRound } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { eligibilityIssues } from "@/lib/eligibility";
import {
  getOpenCompanies,
  getStudentApplications,
  getStudentProfile,
} from "@/lib/data/student";
import { StatusBadge, formatDate } from "./status-badge";

export default async function StudentOverview() {
  const user = await requireRole("STUDENT");
  const [profile, companies] = await Promise.all([
    getStudentProfile(user.id),
    getOpenCompanies(),
  ]);
  const applications = profile ? await getStudentApplications(profile.id) : [];

  const jobs = companies.flatMap((company) => company.jobPostings);
  const eligibleCount = profile
    ? jobs.filter((job) => eligibilityIssues(profile, job).length === 0).length
    : null;

  const stats = [
    { label: "Open positions", value: jobs.length, icon: Briefcase },
    { label: "Eligible for you", value: eligibleCount ?? "–", icon: CheckCircle2 },
    { label: "Applications", value: applications.length, icon: FileText },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">
          Welcome{profile ? `, ${profile.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-[#526987]">Signed in as {user.email}</p>
      </div>

      {!profile && (
        <div className="flex flex-col gap-4 rounded-2xl border border-[#174A91]/30 bg-white p-5 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#174A91]/10 text-[#174A91]">
            <UserRound className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-[#152C50]">Complete your profile</p>
            <p className="text-sm text-[#526987]">
              Add your academic details so companies can see if you&apos;re eligible.
            </p>
          </div>
          <Link
            href="/student/profile/edit"
            className="rounded-lg bg-[#174A91] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#082B63]"
          >
            Create profile
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#D9E4F2] bg-white p-5">
            <stat.icon className="h-5 w-5 text-[#174A91]" />
            <p className="mt-3 text-3xl font-bold text-[#152C50]">{stat.value}</p>
            <p className="text-sm text-[#526987]">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#152C50]">Recent applications</h2>
          <Link
            href="/student/companies"
            className="flex items-center gap-1 text-sm font-semibold text-[#174A91] hover:underline"
          >
            Browse companies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {applications.length === 0 ? (
          <p className="mt-3 text-sm text-[#526987]">You haven&apos;t applied anywhere yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#D9E4F2]">
            {applications.slice(0, 5).map((application) => (
              <li key={application.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-[#152C50]">{application.job.title}</p>
                  <p className="text-sm text-[#526987]">
                    {application.job.company.companyName} · {formatDate(application.appliedAt)}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
