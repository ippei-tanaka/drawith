"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
// import { authClient } from "@/lib/auth/client";
import { auth } from "@/lib/auth/server";
import { getUser } from "@/app/(pages)/actions/auth";

export default async function SignOutPage() {
      console.log(1111);

  try {
    const user = await getUser();
          console.log(2222);

    console.log(user);
    if (user) {
      const signOutResult = await auth.api.signOut({
        headers: await headers()
      });
      console.log(3333, signOutResult);
    }
  } catch (error) {
    console.error("Error signing out:", error); 
  }
      console.log(4444);

  redirect("/sign-in");
  
  return <>test</>
}