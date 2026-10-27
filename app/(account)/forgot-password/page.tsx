import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { EmailRequestForm } from "../forms";

export const metadata: Metadata = { title: "Forgot password | Student Placement Management System" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot password"
      description="Enter your account email and we'll send you a link to set a new password."
    >
      <EmailRequestForm kind="reset" />
    </AuthCard>
  );
}
