"use server";

import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export async function signOut() {
  await authClient.signOut();
  redirect("/sign-in");
}