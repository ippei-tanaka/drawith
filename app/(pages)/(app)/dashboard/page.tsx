import Link from "next/link";
import BoardList from "./BoardList";
import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";


export default async function DashboardPage() {

  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-content">
        <section className="dashboard-welcome">
          <div>
            {/* <p className="dashboard-eyebrow">Wednesday, September 2</p>  */}
            <h1>Hello, {user.name}.</h1>
            <p className="dashboard-subtitle">What are you making space for today?</p>
          </div>
        </section>
        <BoardList user={user} />
      </div>
    </main>
  );
}