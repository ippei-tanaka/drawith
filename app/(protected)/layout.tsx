"use client";

import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useEffect } from "react";

export default function ProtectedLayout({ children }: LayoutProps<"/">) 
{
  useEffect(() => {
    console.log(22);
    authClient.getSession().then(data => {
      console.log(data);
    });
  }, []);

  return children;
}
