import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard, FormNotice } from "@/components/auth/auth-card";
import { getValidInvite } from "@/lib/data/invites";
import { RegisterCompanyForm } from "./register-form";

export const metadata: Metadata = {
  title: "Register your company | Student Placement Management System",
};

export default function RegisterCompanyPage({ searchParams }: PageProps<"/register/company">) {
  return (
    <AuthCard
      wide
      title="Register your company"
      description="Recruit through the Brainware University placement cell. The Training & Placement Office reviews every company before it can post drives."
    >
      <Suspense>
        <Registration searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function Registration({ searchParams }: Pick<PageProps<"/register/company">, "searchParams">) {
  const { invite: token } = await searchParams;
  const invite = typeof token === "string" ? await getValidInvite(token) : null;

  return (
    <div className="grid gap-6">
      {typeof token === "string" &&
        (invite ? (
          <FormNotice tone="info">
            You were invited by the placement cell. Your company is approved as soon as you
            register with {invite.email}.
          </FormNotice>
        ) : (
          <FormNotice tone="error">
            This invitation is invalid or has expired. You can still register below; the placement
            cell will review your details.
          </FormNotice>
        ))}
      <RegisterCompanyForm
        inviteToken={invite ? (token as string) : null}
        invite={invite ? { email: invite.email, companyName: invite.companyName } : null}
      />
    </div>
  );
}
