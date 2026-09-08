// import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
console.log(process.env);

import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";



export default async function ProtectedLayout({ children }: LayoutProps<"/">) 
{
  // const session = await auth.getSession();
  // const id = session?.data?.user?.id;
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })
  console.log('session', session);

  // if (!id) {
    // redirect("/sign-in");
  // }

  return (
    <>test1222223{`${process.env.POSTGRES_PASSWORD}`}</>
  );
}
