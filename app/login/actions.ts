"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";
import { portalPaths, roleFromParam, roleLabels } from "@/lib/roles";

export type LoginState = { error?: string } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const role = roleFromParam[String(formData.get("role"))];
  if (!role) return { error: "Please choose an account type." };

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      role,
      redirectTo: portalPaths[role],
    });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "role_mismatch") {
      return { error: `This is not a ${roleLabels[role]} account.` };
    }
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // signIn throws a redirect on success, which must propagate.
    throw error;
  }
}
