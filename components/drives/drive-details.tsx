import { criteriaSummary, type Criteria } from "@/lib/eligibility";
import { driveTypeLabels, formatDeadline, formatPay } from "@/lib/drives";

type Drive = {
  type: keyof typeof driveTypeLabels;
  ctcLpa: number | null;
  stipend: string | null;
  location: string;
  deadline: Date;
  bondDetails: string | null;
  description: string;
  criteria: Criteria | null;
};

// Read-only drive summary shown to the TPO and the recruiter.
export function DriveDetails({ drive }: { drive: Drive }) {
  const facts = [
    { label: "Role type", value: driveTypeLabels[drive.type] },
    { label: "Pay", value: formatPay(drive) },
    { label: "Location", value: drive.location },
    { label: "Deadline", value: formatDeadline(drive.deadline) },
    { label: "Bond", value: drive.bondDetails ?? "None" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-sm text-[#526987]">{fact.label}</dt>
              <dd className="mt-0.5 font-medium text-[#152C50]">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <h2 className="mt-6 text-sm font-semibold text-[#152C50]">Job description</h2>
        <p className="mt-1 text-sm whitespace-pre-line text-[#526987]">{drive.description}</p>
      </section>
      <section className="h-fit rounded-2xl border border-[#D9E4F2] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#152C50]">Eligibility</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {criteriaSummary(drive.criteria).map((line) => (
            <li key={line} className="rounded-full bg-[#F0F6FD] px-3 py-1 text-sm text-[#174A91]">
              {line}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
