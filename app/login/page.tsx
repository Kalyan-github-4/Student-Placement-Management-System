import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in | Student Placement Management System",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#F0F6FD] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#D9E4F2] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(8,43,99,0.25)] sm:p-8">
        <h1 className="text-2xl font-bold text-[#152C50]">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-[#526987]">
          Choose your account type and enter your credentials.
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
