import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { isAuthTokenValid } from "@/lib/tokens";
import { InvalidLink, VerifyEmailForm } from "../forms";

export const metadata: Metadata = { title: "Verify email | Student Placement Management System" };

// Verification happens on a button press, not on page load, so link scanners in
// email clients can't use up the token.
export default function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
  return (
    <AuthCard title="Verify your email" description="Confirm your email address to finish signing up.">
      <Suspense>
        <VerifyEmail searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function VerifyEmail({ searchParams }: Pick<PageProps<"/verify-email">, "searchParams">) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !(await isAuthTokenValid(token, "EMAIL_VERIFICATION"))) {
    return <InvalidLink resendHref="/verify-email/resend" resendLabel="Send a new link" />;
  }
  return <VerifyEmailForm token={token} />;
}
