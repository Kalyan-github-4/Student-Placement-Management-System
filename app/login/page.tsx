import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in | Student Placement Management System",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      description="Students, recruiters and placement staff all sign in here."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
