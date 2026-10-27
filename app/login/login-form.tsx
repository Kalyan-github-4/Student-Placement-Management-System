"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNotice } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/forms/password-input";
import { login } from "./actions";

const notices: Record<string, string> = {
  verified: "Email verified. You can sign in now.",
  "password-reset": "Password updated. Sign in with your new password.",
  activated: "Account activated. Sign in with your new password.",
  registered: "Company registered and approved. Sign in to continue.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const notice = notices[searchParams.get("notice") ?? ""];
  const suspended = searchParams.get("error") === "suspended";
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="grid gap-5">
      {notice && !state?.error && <FormNotice>{notice}</FormNotice>}
      {suspended && !state?.error && (
        <FormNotice tone="error">
          This account has been suspended. Contact the placement cell.
        </FormNotice>
      )}

      <div className="grid gap-2">
        <Label htmlFor="email" className="text-[#152C50]">
          Email
        </Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-10" />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password" className="text-[#152C50]">
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#174A91] underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          className="h-10"
        />
      </div>

      {state?.error && (
        <FormNotice tone="error">
          {state.error}{" "}
          {state.unverified && (
            <Link href="/verify-email/resend" className="font-semibold underline underline-offset-4">
              Resend the link
            </Link>
          )}
        </FormNotice>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 cursor-pointer rounded-lg bg-[#174A91] font-semibold text-white transition hover:bg-[#082B63] disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-[#526987]">
        Recruiting for a company?{" "}
        <Link
          href="/register/company"
          className="font-semibold text-[#174A91] underline-offset-4 hover:underline"
        >
          Register your company
        </Link>
      </p>
      <p className="-mt-2 text-center text-sm text-[#526987]">
        <Link href="/" className="font-semibold text-[#174A91] underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </form>
  );
}
