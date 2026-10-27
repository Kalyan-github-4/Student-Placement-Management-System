"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { FormNotice } from "@/components/auth/auth-card";
import { CompanyFields } from "@/components/company/company-fields";
import { SubmitButton, TextField } from "@/components/forms/fields";
import { registerCompany } from "./actions";

export function RegisterCompanyForm({
  inviteToken,
  invite,
}: {
  inviteToken: string | null;
  invite: { email: string; companyName: string } | null;
}) {
  const [state, action, pending] = useActionState(
    registerCompany.bind(null, inviteToken),
    undefined
  );

  if (state?.message) {
    return (
      <div className="grid justify-items-center gap-3 py-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#174A91]/10 text-[#174A91]">
          <MailCheck className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-semibold text-[#152C50]">Check your inbox</h2>
        <p className="max-w-md text-sm text-[#526987]">
          We sent a verification link to <span className="font-medium">{state.message}</span>.
          After you verify your email you can sign in and finish your profile while the placement
          cell reviews your company.
        </p>
        <Link href="/login" className="mt-2 text-sm font-semibold text-[#174A91] hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  const values = state?.values ?? (invite ? { name: invite.companyName, email: invite.email } : {});
  const errors = state?.errors;

  return (
    // Re-mount on each failed submit so defaultValue picks up the returned values.
    <form key={JSON.stringify(state?.values)} action={action} className="grid gap-8">
      <CompanyFields values={values} errors={errors} />

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-base font-semibold text-[#152C50]">Your details</legend>
        <TextField
          name="recruiterName"
          label="Full name"
          required
          autoComplete="name"
          defaultValue={values.recruiterName}
          error={errors?.recruiterName}
        />
        <TextField
          name="designation"
          label="Designation"
          required
          placeholder="HR Manager"
          defaultValue={values.designation}
          error={errors?.designation}
        />
        <TextField
          name="phone"
          label="Mobile number"
          type="tel"
          required
          autoComplete="tel"
          placeholder="9876543210"
          defaultValue={values.phone}
          error={errors?.phone}
        />
        <TextField
          name="email"
          label="Official email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@acme.com"
          readOnly={!!invite}
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
        <p className="-mt-2 text-sm text-[#526987] sm:col-span-2">
          Use an email on your company&apos;s domain. Personal addresses (Gmail, Yahoo, Outlook) are
          not accepted. Passwords need at least 8 characters with a letter and a number.
        </p>
      </fieldset>

      {errors && (
        <FormNotice tone="error">Some details need fixing. Check the highlighted fields.</FormNotice>
      )}

      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-[#526987]">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-[#174A91] hover:underline">
            Sign in
          </Link>
        </p>
        <SubmitButton pending={pending} pendingLabel="Registering…" className="w-full sm:w-auto">
          Register company
        </SubmitButton>
      </div>
    </form>
  );
}
