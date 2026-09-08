"use server";

import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import { auth } from "@/lib/auth";

export type AuthActionState = { error: string } | null;

const getValue = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
};

export async function signInWithEmail(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getValue(formData, "email");
  const password = formData.get("password");

  if (!email || typeof password !== "string" || !password) {
    return { error: "Enter your email address and password." };
  }

  let authResult;
  try {
    authResult = await auth.api.signInEmail({body: {email, password}});
  } catch (error) {
    return { error: (error as Error).message || "Unable to sign in. Check your details and try again." };
  }

    console.log("Sign In result:", authResult);


  redirect("/");
}