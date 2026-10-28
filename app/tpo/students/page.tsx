import Link from "next/link";
import { formatDate } from "@/app/student/status-badge";
import { FilterTabs, pickStatus } from "@/components/portal/filter-tabs";
import { requireRole } from "@/lib/dal";
import { listStudents, type VerificationStatus } from "@/lib/data/tpo";
import { VerificationPill } from "./verification-pill";

const statuses = ["DRAFT", "SUBMITTED", "VERIFIED", "REJECTED"] as const;

export default async function TpoStudentsPage({ searchParams }: PageProps<"/tpo/students">) {
  await requireRole("TPO");
  const status = pickStatus<VerificationStatus>((await searchParams).status, statuses);
  const students = await listStudents(status);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Students</h1>
        <p className="mt-1 text-[#526987]">
          Students register themselves and fill in their profiles. Verify each submitted profile
          against college records before the student can apply.
        </p>
      </div>

      <FilterTabs
        basePath="/tpo/students"
        active={status}
        options={[
          { label: "All" },
          { label: "Awaiting verification", status: "SUBMITTED" },
          { label: "Verified", status: "VERIFIED" },
          { label: "Sent back", status: "REJECTED" },
          { label: "Incomplete", status: "DRAFT" },
        ]}
      />

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        {students.length === 0 ? (
          <p className="p-5 text-sm text-[#526987] sm:p-6">No students here.</p>
        ) : (
          <ul className="divide-y divide-[#D9E4F2]">
            {students.map((student) => (
              <li key={student.id}>
                <Link
                  href={`/tpo/students/${student.id}`}
                  className="flex flex-col gap-2 p-5 transition hover:bg-[#F0F6FD] sm:flex-row sm:items-center sm:gap-4 sm:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#152C50]">{student.name}</p>
                    <p className="truncate text-sm text-[#526987]">
                      {[student.rollNumber, student.branch, student.batch, student.cgpa !== null && `CGPA ${student.cgpa}`]
                        .filter(Boolean)
                        .join(" · ") || "Profile not filled in yet"}
                    </p>
                    <p className="truncate text-xs text-[#526987]">{student.email}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#526987]">
                    {!student.emailVerified && (
                      <span className="text-xs font-medium text-amber-700">Email unverified</span>
                    )}
                    <span>Updated {formatDate(student.updatedAt)}</span>
                    <VerificationPill status={student.verificationStatus} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
