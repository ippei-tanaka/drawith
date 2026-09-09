"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export type AuthActionState = { error: string } | null;

const getValue = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
};

export async function signUpWithEmail(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const firstName = getValue(formData, "firstName");
  const lastName = getValue(formData, "lastName");
  const email = getValue(formData, "email");
  const password = formData.get("password");

  if (!firstName) {
    return { error: "Tell us your first name." };
  }

  if (!lastName) {
    return { error: "Tell us your last name." };
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

  try {
    await auth.api.signUpEmail({body: { email, name: `${firstName} ${lastName}`, password }});
  } catch (error) {
    return { error: (error as Error).message || "Unable to create your account. Please try again." };
  }

  redirect("/");
}