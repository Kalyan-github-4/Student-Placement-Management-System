import Link from "next/link";
import { IndianRupee, MapPin } from "lucide-react";
import type { jobPostings, studentProfiles } from "@/db/schema";
import { eligibilityIssues } from "@/lib/eligibility";
import { StatusBadge } from "../status-badge";
import { ApplyButton } from "./apply-button";

type Job = typeof jobPostings.$inferSelect;
type Profile = typeof studentProfiles.$inferSelect;
type Status = React.ComponentProps<typeof StatusBadge>["status"];

export function JobList({
  jobs,
  profile,
  statusByJob,
}: {
  jobs: Job[];
  profile: Profile | null;
  statusByJob: Map<string, Status>;
}) {
  return (
    <ul className="divide-y divide-[#D9E4F2]">
      {jobs.map((job) => {
        const status = statusByJob.get(job.id);
        const issues = profile ? eligibilityIssues(profile, job) : [];
        const criteria = [
          job.minCgpa !== null && `CGPA ${job.minCgpa}+`,
          job.maxBacklogs !== null &&
            (job.maxBacklogs === 0 ? "No backlogs" : `≤ ${job.maxBacklogs} backlogs`),
          job.allowedBranches.length > 0 ? job.allowedBranches.join(", ") : "All branches",
        ].filter(Boolean);

        return (
          <li
            key={job.id}
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6"
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[#152C50]">{job.title}</h3>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#526987]">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                )}
                {job.salaryPackage && (
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" /> {job.salaryPackage}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-[#3A5170]">{job.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {criteria.map((item) => (
                  <span
                    key={String(item)}
                    className="rounded-full bg-[#F0F6FD] px-2.5 py-0.5 text-xs font-medium text-[#174A91]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 sm:w-44 sm:text-right">
              {status ? (
                <div className="flex items-center gap-2 sm:justify-end">
                  <span className="text-sm text-[#526987]">Status</span>
                  <StatusBadge status={status} />
                </div>
              ) : !profile ? (
                <Link
                  href="/student/profile/edit"
                  className="block rounded-lg border border-[#D9E4F2] px-4 py-2 text-center text-sm font-semibold text-[#174A91] hover:bg-[#F0F6FD]"
                >
                  Create profile to apply
                </Link>
              ) : issues.length > 0 ? (
                <div className="text-sm">
                  <p className="font-semibold text-[#C81E23]">Not eligible</p>
                  {issues.map((issue) => (
                    <p key={issue} className="text-[#526987]">
                      {issue}
                    </p>
                  ))}
                </div>
              ) : (
                <ApplyButton jobId={job.id} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
