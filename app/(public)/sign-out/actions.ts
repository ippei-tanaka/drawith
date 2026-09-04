"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signOut() {
  await auth.signOut();
  redirect("/sign-in");
}