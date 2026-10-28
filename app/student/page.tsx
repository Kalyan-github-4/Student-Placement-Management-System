import Link from "next/link";
import { ArrowRight, Briefcase, FileText, UserRound } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { getEligibleDrives, getResumes, getStudent, getStudentApplications } from "@/lib/data/student";
import { missingProfileItems, profileCompleteness } from "@/lib/student";
import { StatusBadge, formatDate } from "./status-badge";
import { VerificationBanner } from "./verification-banner";

export default async function StudentOverview() {
  const user = await requireRole("STUDENT");
  const student = await getStudent(user.id);
  if (!student) return <p className="text-[#526987]">Student record not found.</p>;

  const verified = student.verificationStatus === "VERIFIED";
  const [resumes, applications, drives] = await Promise.all([
    getResumes(user.id),
    getStudentApplications(student.id),
    verified ? getEligibleDrives(student) : [],
  ]);
  const completeness = profileCompleteness(student, resumes.length > 0);

  const stats = [
    { label: "Profile complete", value: `${completeness}%`, icon: UserRound },
    { label: "Eligible open drives", value: verified ? drives.length : "–", icon: Briefcase },
    {
      label: "Active applications",
      value: applications.filter((a) => a.status !== "WITHDRAWN" && a.status !== "REJECTED").length,
      icon: FileText,
    },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Welcome, {student.name.split(" ")[0]}</h1>
        <p className="mt-1 text-[#526987]">Signed in as {user.email}</p>
      </div>

      <VerificationBanner
        student={student}
        missing={missingProfileItems(student, resumes.length > 0)}
        completeness={completeness}
      />

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
          {verified && (
            <Link
              href="/student/drives"
              className="flex items-center gap-1 text-sm font-semibold text-[#174A91] hover:underline"
            >
              Browse drives <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {applications.length === 0 ? (
          <p className="mt-3 text-sm text-[#526987]">You haven&apos;t applied anywhere yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#D9E4F2]">
            {applications.slice(0, 5).map((application) => (
              <li key={application.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-[#152C50]">{application.drive.title}</p>
                  <p className="text-sm text-[#526987]">
                    {application.drive.company.name} · {formatDate(application.appliedAt)}
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
