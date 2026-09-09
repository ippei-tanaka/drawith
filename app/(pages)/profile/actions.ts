"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getUser } from "@/app/(pages)/actions/auth";
import { db } from "@/lib/db/db";
import { user as userSchema, userProfile as userProfileSchema } from "@/lib/db/schema";

export type ProfileActionState = { error: string } | null;

const getValue = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
};

export async function updateProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {

  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const username = getValue(formData, "username");
  const firstName = getValue(formData, "firstName");
  const lastName = getValue(formData, "lastName");

  if (!username) {
    return { error: "Choose a username." };
  }

  if (!firstName) {
    return { error: "Tell us your first name." };
  }

  if (!lastName) {
    return { error: "Tell us your last name." };
  }

  try {
    await db
      .update(userProfileSchema)
      .set({ username, firstName, lastName })
      .where(eq(userProfileSchema.userId, user.id));
    await db
      .update(userSchema)
      .set({ name: `${firstName} ${lastName}` })
      .where(eq(userSchema.id, user.id));

  } catch (error) {
    return { error: (error as Error).message || "Unable to update your profile. Please try again." };
  }

  redirect(`/profile`);
}
