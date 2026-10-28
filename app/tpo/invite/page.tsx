import { formatDateTime } from "@/components/portal/status-pill";
import { requireRole } from "@/lib/dal";
import { placementRoles } from "@/lib/roles";
import { listInvites } from "@/lib/data/tpo";
import { InviteForm } from "./invite-form";

function inviteState(invite: { acceptedAt: Date | null; expired: boolean }) {
  if (invite.acceptedAt) return { label: "Registered", tone: "text-emerald-700" };
  if (invite.expired) return { label: "Expired", tone: "text-slate-500" };
  return { label: "Waiting", tone: "text-amber-700" };
}

export default async function InviteCompanyPage() {
  await requireRole(...placementRoles);
  const invites = await listInvites();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Invite a company</h1>
        <p className="mt-1 text-[#526987]">
          Send a registration link to a recruiter. Companies that register through it are approved
          straight away.
        </p>
      </div>

      <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
        <InviteForm />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
        <h2 className="border-b border-[#D9E4F2] p-5 text-lg font-semibold text-[#152C50] sm:px-6">
          Recent invitations
        </h2>
        {invites.length === 0 ? (
          <p className="p-5 text-sm text-[#526987] sm:px-6">No invitations sent yet.</p>
        ) : (
          <ul className="divide-y divide-[#D9E4F2]">
            {invites.map((invite) => {
              const state = inviteState(invite);
              return (
                <li
                  key={invite.id}
                  className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#152C50]">{invite.companyName}</p>
                    <p className="truncate text-sm text-[#526987]">{invite.email}</p>
                  </div>
                  <div className="text-sm sm:text-right">
                    <p className={`font-semibold ${state.tone}`}>{state.label}</p>
                    <p className="text-[#526987]">Sent {formatDateTime(invite.createdAt)}</p>
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
