import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { getStudent, getStudentApplications } from "@/lib/data/student";
import { formatDeadline } from "@/lib/drives";
import { StatusBadge, formatDate } from "../status-badge";
import { WithdrawButton } from "../drives/[driveId]/apply-form";

export default async function ApplicationsPage() {
  const user = await requireRole("STUDENT");
  const student = await getStudent(user.id);
  const applications = student ? await getStudentApplications(student.id) : [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">My applications</h1>
        <p className="mt-1 text-[#526987]">Every drive you&apos;ve applied to and where it stands.</p>
      </div>

      {applications.length === 0 ? (
        <p className="rounded-2xl border border-[#D9E4F2] bg-white p-5 text-[#526987]">
          You haven&apos;t applied anywhere yet.{" "}
          <Link href="/student/drives" className="font-semibold text-[#174A91] hover:underline">
            Browse drives
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-[#D9E4F2] overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
          {applications.map((application) => (
            <li
              key={application.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0">
                <Link
                  href={`/student/drives/${application.drive.id}`}
                  className="font-semibold text-[#152C50] hover:text-[#174A91]"
                >
                  {application.drive.title}
                </Link>
                <p className="text-sm text-[#526987]">
                  {application.drive.company.name} · Applied {formatDate(application.appliedAt)}
                  {application.resume && ` · ${application.resume.fileName}`}
                </p>
                <p className="text-xs text-[#526987]">
                  Deadline {formatDeadline(application.drive.deadline)}
                </p>
              </div>
              <div className="grid justify-items-start gap-2 sm:justify-items-end">
                <StatusBadge status={application.status} />
                {application.status === "APPLIED" && <WithdrawButton applicationId={application.id} />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
