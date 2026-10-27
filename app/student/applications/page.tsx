import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { getStudentApplications, getStudentProfile } from "@/lib/data/student";
import { StatusBadge, formatDate } from "../status-badge";

export default async function ApplicationsPage() {
  const user = await requireRole("STUDENT");
  const profile = await getStudentProfile(user.id);
  const applications = profile ? await getStudentApplications(profile.id) : [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">My Applications</h1>
        <p className="mt-1 text-[#526987]">Track the status of every position you applied for.</p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-[#D9E4F2] bg-white p-6 text-[#526987]">
          You haven&apos;t applied anywhere yet.{" "}
          <Link href="/student/companies" className="font-semibold text-[#174A91] hover:underline">
            Browse companies
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[#D9E4F2] overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
          {applications.map((application) => (
            <li
              key={application.id}
              className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-[#152C50]">{application.job.title}</p>
                <p className="text-sm text-[#526987]">
                  {application.job.company.name}
                  {application.job.location && ` · ${application.job.location}`}
                  {application.job.salaryPackage && ` · ${application.job.salaryPackage}`}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#526987]">
                Applied {formatDate(application.appliedAt)}
                <StatusBadge status={application.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
