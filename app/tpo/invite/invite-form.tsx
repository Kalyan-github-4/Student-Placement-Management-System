"use client";

import { useActionState } from "react";
import { FormNotice } from "@/components/auth/auth-card";
import { SubmitButton, TextField } from "@/components/forms/fields";
import { inviteCompany } from "../actions";

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteCompany, undefined);
  // On success the form re-mounts empty; on failure it keeps what was typed.
  const values = state?.errors ? state.values : undefined;

  return (
    <form key={state?.message ?? JSON.stringify(values)} action={action} className="grid gap-5">
      {state?.message && <FormNotice>{state.message}</FormNotice>}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="companyName"
          label="Company name"
          required
          defaultValue={values?.companyName}
          error={state?.errors?.companyName}
        />
        <TextField
          name="email"
          label="Recruiter's official email"
          type="email"
          required
          placeholder="hr@acme.com"
          defaultValue={values?.email}
          error={state?.errors?.email}
        />
      </div>
      <SubmitButton pending={pending} pendingLabel="Sending…" className="w-full sm:w-fit">
        Send invitation
      </SubmitButton>
    </form>
  );
}
