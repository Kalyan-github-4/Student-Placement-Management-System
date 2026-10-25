import { requireRole } from "@/lib/dal";
import { getStudentProfile } from "@/lib/data/student";
import { ProfileForm } from "./profile-form";

export default async function EditProfilePage() {
  const user = await requireRole("STUDENT");
  const profile = await getStudentProfile(user.id);

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-8">
      <h1 className="text-2xl font-bold text-[#152C50]">
        {profile ? "Edit profile" : "Create your profile"}
      </h1>
      <p className="mt-1 mb-6 text-sm text-[#526987]">
        Companies use these details to check your eligibility. Keep them accurate.
      </p>
      <ProfileForm
        email={user.email}
        isNew={!profile}
        defaults={
          profile
            ? {
                name: profile.name,
                rollNumber: profile.rollNumber,
                branch: profile.branch,
                cgpa: String(profile.cgpa),
                backlogs: String(profile.backlogs),
                phone: profile.phone ?? "",
                resumeUrl: profile.resumeUrl ?? "",
              }
            : {}
        }
      />
    </div>
  );
}
