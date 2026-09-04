"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { userProfile } from "@/src/schema";
import { db } from "@/src/db";

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

  const authResult = await auth.signUp.email({ email, name: `${firstName} ${lastName}`, password });

  if (authResult.error) {
    return { error: authResult.error.message || "Unable to create your account. Please try again." };
  }

  try {
    await db.insert(userProfile).values({
      userId: authResult.data.user.id,
      firstName,
      lastName
    });
  } catch (error) {
    return { error: "Unable to create your profile. Please try again." };
  }

  redirect("/");
}