// import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
console.log(process.env);
export default async function ProtectedLayout({ children }: LayoutProps<"/">) 
{
  // const session = await auth.getSession();
  // const id = session?.data?.user?.id;
  
  // if (!id) {
    // redirect("/sign-in");
  // }

  return (
    <>test1222223{`${process.env.POSTGRES_PASSWORD}`}</>
  );
}
