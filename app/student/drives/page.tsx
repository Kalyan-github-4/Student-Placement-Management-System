import Link from "next/link";
import { ArrowRight, Building2, CalendarClock, MapPin } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { getEligibleDrives, getStudent, getStudentApplications } from "@/lib/data/student";
import { driveTypeLabels, formatDeadline, formatPay } from "@/lib/drives";
import { StatusBadge } from "../status-badge";

export default async function DrivesPage() {
  const user = await requireRole("STUDENT");
  const student = await getStudent(user.id);
  if (!student) return <p className="text-[#526987]">Student record not found.</p>;

  if (student.verificationStatus !== "VERIFIED") {
    return (
      <div className="grid gap-6">
        <h1 className="text-2xl font-bold text-[#152C50]">Drives</h1>
        <p className="rounded-2xl border border-[#174A91]/30 bg-white p-5 text-[#526987]">
          Drives appear here once the placement cell verifies your profile, because eligibility is
          checked against your verified academic details.{" "}
          <Link href="/student/profile" className="font-semibold text-[#174A91] hover:underline">
            Go to your profile
          </Link>
        </p>
      </div>
    );
  }

  const [drives, applications] = await Promise.all([
    getEligibleDrives(student),
    getStudentApplications(student.id),
  ]);
  const statusByDrive = new Map(applications.map((a) => [a.driveId, a.status]));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Drives</h1>
        <p className="mt-1 text-[#526987]">
          Open drives you&apos;re eligible for, closing soonest first.
        </p>
      </div>

      {drives.length === 0 && (
        <p className="rounded-2xl border border-[#D9E4F2] bg-white p-5 text-[#526987]">
          No open drives match your profile right now. You&apos;ll get an email when a new one opens.
        </p>
      )}

      <ul className="grid gap-4">
        {drives.map((drive) => {
          const status = statusByDrive.get(drive.id);
          return (
            <li key={drive.id}>
              <Link
                href={`/student/drives/${drive.id}`}
                className="flex flex-col gap-4 rounded-2xl border border-[#D9E4F2] bg-white p-5 transition hover:border-[#174A91] sm:flex-row sm:items-center sm:p-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#082B63]/10 text-[#082B63]">
                  {drive.company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={drive.company.logoUrl} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-[#152C50]">{drive.title}</p>
                  <p className="text-sm text-[#526987]">
                    {drive.company.name} · {driveTypeLabels[drive.type]} · {formatPay(drive)}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#526987]">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {drive.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-4 w-4" /> Apply by {formatDeadline(drive.deadline)}
                    </span>
                  </p>
                </div>
                {status ? (
                  <StatusBadge status={status} />
                ) : (
                  <span className="flex items-center gap-1 text-sm font-semibold text-[#174A91]">
                    View &amp; apply <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
