"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormNotice } from "@/components/auth/auth-card";
import { CompanyFields } from "@/components/company/company-fields";
import { SubmitButton } from "@/components/forms/fields";
import { updateCompany } from "../../actions";

export function CompanyProfileForm({
  defaults,
  legalLocked,
  resubmit,
}: {
  defaults: Record<string, string>;
  legalLocked: boolean;
  resubmit: boolean;
}) {
  const [state, action, pending] = useActionState(updateCompany, undefined);
  const values = state?.values ? { ...defaults, ...state.values } : defaults;

  return (
    // Re-mount on each failed submit so defaultValue picks up the returned values.
    <form key={JSON.stringify(state?.values)} action={action} className="grid gap-8">
      <CompanyFields values={values} errors={state?.errors} legalLocked={legalLocked} />

      {state?.message && <FormNotice tone="error">{state.message}</FormNotice>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/company"
          className="rounded-lg border border-[#D9E4F2] px-5 py-2.5 text-center text-sm font-semibold text-[#526987] transition hover:bg-[#F0F6FD]"
        >
          Cancel
        </Link>
        <SubmitButton pending={pending} pendingLabel="Saving…" className="h-auto py-2.5 text-sm">
          {resubmit ? "Save and resubmit" : "Save changes"}
        </SubmitButton>
      </div>
    </form>
  );
}
