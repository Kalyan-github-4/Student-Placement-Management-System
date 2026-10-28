"use client";

import { useActionState } from "react";
import { FormNotice } from "@/components/auth/auth-card";
import { SubmitButton, TextField } from "@/components/forms/fields";
import { createTpo, resendTpoActivation, setTpoAccess } from "./actions";

export function CreateTpoForm() {
  const [state, action, pending] = useActionState(createTpo, undefined);
  // On success the form re-mounts empty; on failure it keeps what was typed.
  const values = state?.errors ? state.values : undefined;

  return (
    <form key={state?.message ?? JSON.stringify(values)} action={action} className="grid gap-5">
      {state?.message && <FormNotice>{state.message}</FormNotice>}
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField
          name="name"
          label="Full name"
          required
          defaultValue={values?.name}
          error={state?.errors?.name}
        />
        <TextField
          name="designation"
          label="Designation"
          required
          placeholder="Placement Officer"
          defaultValue={values?.designation}
          error={state?.errors?.designation}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          required
          defaultValue={values?.email}
          error={state?.errors?.email}
        />
      </div>
      <SubmitButton pending={pending} pendingLabel="Creating…" className="w-full sm:w-fit">
        Create account and send activation link
      </SubmitButton>
    </form>
  );
}

const secondary =
  "h-9 cursor-pointer rounded-lg border px-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70";

export function TpoRowActions({
  userId,
  suspended,
  canResend,
}: {
  userId: string;
  suspended: boolean;
  canResend: boolean;
}) {
  const [accessState, accessAction, accessPending] = useActionState(
    setTpoAccess.bind(null, userId, suspended),
    undefined
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendTpoActivation.bind(null, userId),
    undefined
  );
  const message = resendState?.message ?? accessState?.message;

  return (
    <div className="grid justify-items-start gap-2 sm:justify-items-end">
      <div className="flex gap-2">
        {canResend && (
          <form action={resendAction}>
            <button
              type="submit"
              disabled={resendPending}
              className={`${secondary} border-[#D9E4F2] text-[#174A91] hover:bg-[#F0F6FD]`}
            >
              {resendPending ? "Sending…" : "Resend link"}
            </button>
          </form>
        )}
        <form action={accessAction}>
          <button
            type="submit"
            disabled={accessPending}
            className={
              suspended
                ? `${secondary} border-[#D9E4F2] text-[#174A91] hover:bg-[#F0F6FD]`
                : `${secondary} border-[#F12D32]/40 text-[#C81E23] hover:bg-[#F12D32]/5`
            }
          >
            {accessPending ? "Saving…" : suspended ? "Enable" : "Disable"}
          </button>
        </form>
      </div>
      {message && <p className="text-xs text-[#526987]">{message}</p>}
    </div>
  );
}
