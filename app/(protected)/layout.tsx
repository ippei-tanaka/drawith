"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server"; // path to your Better Auth server instance
import { headers } from "next/headers";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) 
{
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (!session || !session.user?.id) {
    redirect("/sign-in");
  }

  return (
    <>{children}</>
  );
}
