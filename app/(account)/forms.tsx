"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormNotice } from "@/components/auth/auth-card";
import { SubmitButton, TextField } from "@/components/forms/fields";
import {
  requestPasswordReset,
  resendVerification,
  setPassword,
  verifyEmail,
} from "./actions";

function BackToSignIn() {
  return (
    <p className="text-center text-sm text-[#526987]">
      <Link href="/login" className="font-semibold text-[#174A91] underline-offset-4 hover:underline">
        Back to sign in
      </Link>
    </p>
  );
}

// Shared by "forgot password" and "resend verification": one email field, generic answer.
export function EmailRequestForm({ kind }: { kind: "reset" | "verification" }) {
  const [state, action, pending] = useActionState(
    kind === "reset" ? requestPasswordReset : resendVerification,
    undefined
  );

  return (
    <form action={action} className="grid gap-5">
      {state?.message && <FormNotice>{state.message}</FormNotice>}
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={state?.errors?.email}
      />
      <SubmitButton pending={pending} pendingLabel="Sending…">
        {kind === "reset" ? "Send reset link" : "Send verification link"}
      </SubmitButton>
      <BackToSignIn />
    </form>
  );
}

export function SetPasswordForm({ token, mode }: { token: string; mode: "reset" | "activate" }) {
  const [state, action, pending] = useActionState(setPassword.bind(null, token, mode), undefined);

  return (
    <form action={action} className="grid gap-5">
      {state?.message && <FormNotice tone="error">{state.message}</FormNotice>}
      <TextField
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        error={state?.errors?.password}
      />
      <TextField
        name="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        error={state?.errors?.confirmPassword}
      />
      <p className="-mt-2 text-sm text-[#526987]">At least 8 characters, with a letter and a number.</p>
      <SubmitButton pending={pending} pendingLabel="Saving…">
        {mode === "reset" ? "Update password" : "Activate account"}
      </SubmitButton>
    </form>
  );
}

export function VerifyEmailForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(verifyEmail.bind(null, token), undefined);

  return (
    <form action={action} className="grid gap-5">
      {state?.message && (
        <FormNotice tone="error">
          {state.message}{" "}
          <Link href="/verify-email/resend" className="font-semibold underline underline-offset-4">
            Get a new link
          </Link>
        </FormNotice>
      )}
      <SubmitButton pending={pending} pendingLabel="Verifying…">
        Confirm my email
      </SubmitButton>
      <BackToSignIn />
    </form>
  );
}

export function InvalidLink({ resendHref, resendLabel }: { resendHref: string; resendLabel: string }) {
  return (
    <div className="grid gap-5">
      <FormNotice tone="error">This link is invalid, expired or already used.</FormNotice>
      <Link
        href={resendHref}
        className="flex h-11 items-center justify-center rounded-lg bg-[#174A91] font-semibold text-white transition hover:bg-[#082B63]"
      >
        {resendLabel}
      </Link>
      <BackToSignIn />
    </div>
  );
}
