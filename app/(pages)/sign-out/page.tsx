"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { getUser } from "@/app/(pages)/actions/auth";

export default async function SignOutPage() {
  try {
    const user = await getUser();
    if (user) {
      await auth.api.signOut({
        headers: await headers()
      });
    }
  } catch (error) {
    console.error("Error signing out:", error); 
  }
  redirect("/sign-in");
}