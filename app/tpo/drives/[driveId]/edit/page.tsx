import { notFound } from "next/navigation";
import { DriveForm } from "@/components/drives/drive-form";
import { requireRole } from "@/lib/dal";
import { getDrive } from "@/lib/data/drives";
import { driveToFormValues } from "@/lib/drives";
import { saveTpoDrive } from "../../../drive-actions";

export default async function EditTpoDrivePage({ params }: PageProps<"/tpo/drives/[driveId]/edit">) {
  await requireRole("TPO", "SUPER_ADMIN");
  const { driveId } = await params;
  const drive = await getDrive(driveId);
  if (!drive || drive.status === "COMPLETED") notFound();

  const isOpen = drive.status === "OPEN";
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Edit drive</h1>
        <p className="mt-1 text-[#526987]">
          {drive.company.name} ·{" "}
          {isOpen
            ? "This drive is open; changes apply straight away. Tightening eligibility doesn't remove existing applications."
            : "Publish to open the drive to eligible students."}
        </p>
      </div>
      <div className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-8">
        <DriveForm
          action={saveTpoDrive.bind(null, drive.id)}
          defaults={driveToFormValues(drive, drive.criteria)}
          cancelHref={`/tpo/drives/${drive.id}`}
          primaryLabel={isOpen ? "Save changes" : "Save and publish"}
          secondaryLabel={isOpen ? undefined : "Save as draft"}
        />
      </div>
    </div>
  );
}
