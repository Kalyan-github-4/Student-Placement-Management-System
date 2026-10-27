import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { isAuthTokenValid } from "@/lib/tokens";
import { InvalidLink, SetPasswordForm } from "../forms";

export const metadata: Metadata = { title: "Reset password | Student Placement Management System" };

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <AuthCard title="Set a new password" description="Choose a new password for your account.">
      <Suspense>
        <ResetPassword searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function ResetPassword({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !(await isAuthTokenValid(token, "PASSWORD_RESET"))) {
    return <InvalidLink resendHref="/forgot-password" resendLabel="Request a new link" />;
  }
  return <SetPasswordForm token={token} mode="reset" />;
}
