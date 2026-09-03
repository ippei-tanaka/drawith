"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export type AuthActionState = { error: string } | null;

const getValue = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
};

export async function signUpWithEmail(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = getValue(formData, "name");
  const email = getValue(formData, "email");
  const password = formData.get("password");

  if (!name) {
    return { error: "Tell us your name." };
  }

  if (!email) {
    return { error: "Enter your email address." };
  }

  if (typeof password !== "string" || password.length < 8) {
    return { error: "Your password must be at least 8 characters." };
  }

  if (formData.get("terms") !== "on") {
    return { error: "Please agree to the terms and privacy policy." };
  }

  const { error } = await auth.signUp.email({ email, name, password });

  if (error) {
    return { error: error.message || "Unable to create your account. Please try again." };
  }

  redirect("/");
}