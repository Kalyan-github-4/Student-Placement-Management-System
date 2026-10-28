import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterStudentForm } from "./register-form";

export const metadata: Metadata = {
  title: "Student registration | Student Placement Management System",
};

export default function RegisterStudentPage() {
  return (
    <AuthCard
      title="Student registration"
      description="Create your account, then complete your profile. The placement cell verifies your details before you can apply to drives."
    >
      <RegisterStudentForm />
    </AuthCard>
  );
}
