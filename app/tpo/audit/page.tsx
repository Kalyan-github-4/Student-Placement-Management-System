import Link from "next/link";
import { FilterTabs, pickStatus } from "@/components/portal/filter-tabs";
import { formatDateTime } from "@/components/portal/status-pill";
import { requireRole } from "@/lib/dal";
import { auditEntities, listAuditLogs, type AuditEntity } from "@/lib/data/tpo";

// Where each kind of audited record can be opened.
const entityLinks: Partial<Record<string, string>> = {
  company: "/tpo/companies/",
  drive: "/tpo/drives/",
  student: "/tpo/students/",
};

// One line of what changed, e.g. "status: APPROVED · reason: …".
function summarize(after: unknown) {
  if (!after || typeof after !== "object") return null;
  return Object.entries(after)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join(" · ");
}

export default async function AuditLogPage({ searchParams }: PageProps<"/tpo/audit">) {
  await requireRole("TPO", "SUPER_ADMIN");
  const entity = pickStatus<AuditEntity>((await searchParams).status, auditEntities);
  const entries = await listAuditLogs(entity);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Audit log</h1>
        <p className="mt-1 text-[#526987]">
          Every decision made by the placement cell and Super Admin, newest first. Entries can&apos;t
          be edited or deleted.
        </p>
      </div>

      <FilterTabs
        basePath="/tpo/audit"
        active={entity}
        options={[
          { label: "All" },
          { label: "Students", status: "student" },
          { label: "Companies", status: "company" },
          { label: "Drives", status: "drive" },
          { label: "Staff accounts", status: "user" },
          { label: "Invites", status: "company_invite" },
        ]}
      />

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        {entries.length === 0 ? (
          <p className="p-5 text-sm text-[#526987] sm:p-6">Nothing recorded yet.</p>
        ) : (
          <ul className="divide-y divide-[#D9E4F2]">
            {entries.map((entry) => {
              const href = entityLinks[entry.entity];
              const details = summarize(entry.after);
              return (
                <li key={entry.id} className="grid gap-1 p-5 sm:grid-cols-[11rem_1fr] sm:gap-4 sm:px-6">
                  <p className="text-sm text-[#526987]">{formatDateTime(entry.at)}</p>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#152C50]">
                      {entry.action}{" "}
                      {href ? (
                        <Link href={`${href}${entry.entityId}`} className="text-sm font-medium text-[#174A91] hover:underline">
                          Open {entry.entity}
                        </Link>
                      ) : null}
                    </p>
                    <p className="text-sm text-[#526987]">
                      by {entry.actorEmail ?? "a deleted account"}
                      {entry.actorRole === "SUPER_ADMIN" && " (Super Admin)"}
                    </p>
                    {details && <p className="mt-1 text-xs break-words text-[#526987]">{details}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
