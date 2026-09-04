"use client"

import { auth } from "@/lib/auth/server";
import { createContext } from "react";

export const AuthenticatedUser = createContext("");

export default async function ProtectedLayout({ children }: LayoutProps<"/">) 
{
  const session = await auth.getSession();
  const id = session?.data?.user?.id;

  if (!id) {
    throw new Error("Unauthenticated");
  }

  return (
    <AuthenticatedUser.Provider value={id}>
      {children}
    </AuthenticatedUser.Provider>
  );
}
