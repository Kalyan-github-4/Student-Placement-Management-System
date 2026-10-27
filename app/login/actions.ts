"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string; unverified?: boolean } | undefined;

const errorMessages: Record<string, string> = {
  locked:
    "Too many failed attempts. Your account is locked for 15 minutes. You can reset your password in the meantime.",
  suspended: "This account has been suspended. Contact the placement cell.",
  rate_limited: "Too many sign-in attempts from your network. Try again in a few minutes.",
};

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/portal",
    });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      if (error.code === "unverified") {
        return { error: "Verify your email address before signing in.", unverified: true };
      }
      if (error.code in errorMessages) return { error: errorMessages[error.code] };
    }
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // signIn throws a redirect on success, which must propagate.
    throw error;
  }
}
