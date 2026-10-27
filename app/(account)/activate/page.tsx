import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { isAuthTokenValid } from "@/lib/tokens";
import { InvalidLink, SetPasswordForm } from "../forms";

export const metadata: Metadata = { title: "Activate account | Student Placement Management System" };

export default function ActivatePage({ searchParams }: PageProps<"/activate">) {
  return (
    <AuthCard title="Activate your account" description="Set a password to start using the portal.">
      <Suspense>
        <Activate searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function Activate({ searchParams }: Pick<PageProps<"/activate">, "searchParams">) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !(await isAuthTokenValid(token, "ACCOUNT_ACTIVATION"))) {
    // An expired activation link can still be replaced through the reset flow.
    return <InvalidLink resendHref="/forgot-password" resendLabel="Get a new link" />;
  }
  return <SetPasswordForm token={token} mode="activate" />;
}
