import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { getStudentProfile } from "@/lib/data/student";

export default async function ProfilePage() {
  const user = await requireRole("STUDENT");
  const profile = await getStudentProfile(user.id);
  if (!profile) redirect("/student/profile/edit");

  const details = [
    { label: "Full name", value: profile.name },
    { label: "Email", value: user.email },
    { label: "Roll number", value: profile.rollNumber },
    { label: "Branch", value: profile.branch },
    { label: "CGPA", value: profile.cgpa.toFixed(2) },
    { label: "Active backlogs", value: profile.backlogs },
    { label: "Phone", value: profile.phone ?? "—" },
  ];

  return (
    <div className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#152C50]">{profile.name}</h1>
          <p className="mt-1 text-[#526987]">
            {profile.branch} · {profile.rollNumber}
          </p>
        </div>
        <Link
          href="/student/profile/edit"
          className="flex items-center gap-2 rounded-lg border border-[#D9E4F2] px-4 py-2 text-sm font-semibold text-[#174A91] transition hover:border-[#174A91] hover:bg-[#F0F6FD]"
        >
          <Pencil className="h-4 w-4" />
          Edit profile
        </Link>
      </div>

      <dl className="mt-6 grid gap-x-8 gap-y-5 border-t border-[#D9E4F2] pt-6 sm:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label}>
            <dt className="text-sm text-[#526987]">{detail.label}</dt>
            <dd className="mt-0.5 font-medium break-words text-[#152C50]">{detail.value}</dd>
          </div>
        ))}
        <div>
          <dt className="text-sm text-[#526987]">Resume</dt>
          <dd className="mt-0.5 font-medium">
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#174A91] underline-offset-4 hover:underline"
              >
                View resume
              </a>
            ) : (
              <span className="text-[#152C50]">Not added</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
