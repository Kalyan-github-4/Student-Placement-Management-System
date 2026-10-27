import { formatDateTime, StatusPill } from "@/components/portal/status-pill";
import { requireRole } from "@/lib/dal";
import { listTpos } from "@/lib/data/admin";
import { CreateTpoForm, TpoRowActions } from "./tpo-forms";

export default async function AdminPortal() {
  const user = await requireRole("SUPER_ADMIN");
  const tpos = await listTpos();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">TPO accounts</h1>
        <p className="mt-1 text-[#526987]">
          Create and manage placement cell staff accounts. Signed in as {user.email}.
        </p>
      </div>

      <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#152C50]">Add a TPO</h2>
        <CreateTpoForm />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        <h2 className="border-b border-[#D9E4F2] p-5 text-lg font-semibold text-[#152C50] sm:px-6">
          Placement cell staff
        </h2>
        {tpos.length === 0 ? (
          <p className="p-5 text-sm text-[#526987] sm:px-6">No TPO accounts yet.</p>
        ) : (
          <ul className="divide-y divide-[#D9E4F2]">
            {tpos.map((tpo) => (
              <li
                key={tpo.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#152C50]">{tpo.name}</p>
                    <StatusPill status={tpo.status} />
                    {!tpo.activated && tpo.status !== "SUSPENDED" && (
                      <span className="text-xs font-medium text-amber-700">
                        Activation pending
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-[#526987]">
                    {tpo.designation} · {tpo.email}
                  </p>
                  <p className="text-xs text-[#526987]">
                    {tpo.lastLogin
                      ? `Last sign-in ${formatDateTime(tpo.lastLogin)}`
                      : "Never signed in"}
                  </p>
                </div>
                <TpoRowActions
                  userId={tpo.id}
                  suspended={tpo.status === "SUSPENDED"}
                  canResend={!tpo.activated && tpo.status !== "SUSPENDED"}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
