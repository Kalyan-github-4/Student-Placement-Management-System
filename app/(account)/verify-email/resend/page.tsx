import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { EmailRequestForm } from "../../forms";

export const metadata: Metadata = { title: "Resend verification | Student Placement Management System" };

export default function ResendVerificationPage() {
  return (
    <AuthCard
      title="Resend verification link"
      description="Enter the email you registered with and we'll send a new verification link."
    >
      <EmailRequestForm kind="verification" />
    </AuthCard>
  );
}
