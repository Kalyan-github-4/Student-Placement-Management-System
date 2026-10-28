import { requireRole } from "@/lib/dal";
import { getStudent } from "@/lib/data/student";
import { ProfileForm } from "./profile-form";

export default async function EditProfilePage() {
  const user = await requireRole("STUDENT");
  const student = await getStudent(user.id);
  if (!student) return <p className="text-[#526987]">Student record not found.</p>;

  const str = (value: string | number | null) => (value === null ? "" : String(value));
  const defaults = {
    name: student.name,
    phone: str(student.phone),
    skills: student.skills.join(", "),
    githubUrl: str(student.githubUrl),
    linkedinUrl: str(student.linkedinUrl),
    portfolioUrl: str(student.portfolioUrl),
    rollNumber: str(student.rollNumber),
    branch: str(student.branch),
    batch: str(student.batch),
    cgpa: str(student.cgpa),
    activeBacklogs: str(student.activeBacklogs),
    marks10: str(student.marks10),
    marks12: str(student.marks12),
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Edit profile</h1>
        <p className="mt-1 text-[#526987]">
          {student.verificationStatus === "VERIFIED"
            ? "Academic details are locked after verification. You can still update your contact details, skills and links."
            : "Fill in every field accurately. The placement cell checks these details before verifying your profile."}
        </p>
      </div>
      <div className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-8">
        <ProfileForm
          email={user.email}
          defaults={defaults}
          academicLocked={student.verificationStatus === "VERIFIED"}
          wasSubmitted={student.verificationStatus === "SUBMITTED"}
        />
      </div>
    </div>
  );
}
