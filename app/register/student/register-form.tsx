"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { SubmitButton, TextField } from "@/components/forms/fields";
import { registerStudent } from "./actions";

export function RegisterStudentForm() {
  const [state, action, pending] = useActionState(registerStudent, undefined);

  if (state?.message) {
    return (
      <div className="grid justify-items-center gap-3 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#174A91]/10 text-[#174A91]">
          <MailCheck className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-semibold text-[#152C50]">Check your inbox</h2>
        <p className="text-sm text-[#526987]">
          We sent a verification link to <span className="font-medium">{state.message}</span>.
          Verify your email, then sign in to complete your profile.
        </p>
        <Link href="/login" className="mt-2 text-sm font-semibold text-[#174A91] hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  const values = state?.values ?? {};
  const errors = state?.errors;

  return (
    // Re-mount on each failed submit so defaultValue picks up the returned values.
    <form key={JSON.stringify(state?.values)} action={action} className="grid gap-5">
      <TextField
        name="name"
        label="Full name"
        required
        autoComplete="name"
        defaultValue={values.name}
        error={errors?.name}
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        required
        autoComplete="email"
        defaultValue={values.email}
        error={errors?.email}
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        required
        autoComplete="new-password"
        error={errors?.password}
      />
      <TextField
        name="confirmPassword"
        label="Confirm password"
        type="password"
        required
        autoComplete="new-password"
        error={errors?.confirmPassword}
      />
      <p className="-mt-2 text-sm text-[#526987]">At least 8 characters, with a letter and a number.</p>
      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-[#526987]">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-[#174A91] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
