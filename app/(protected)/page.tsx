"use client";

// import Link from "next/link";
// import { getUser } from "./actions/auth";
import { authClient } from "@/lib/auth/client";
import { useEffect, useState } from "react";


export default function Home()
{
  const [user, setUser] = useState<null | { name: string }>(null);

  useEffect(() => {
    console.log(11);
    authClient.getSession().then(data => {
      console.log(data);
      setUser({name: data.data?.user.name || ""});
    });
  }, []);

  return (
    <>
      test
      {user && <p>Welcome, {user.name}!</p>}
      <button onClick={() => {authClient.signOut()}}>Sign Out</button>
    </>
  );
}
