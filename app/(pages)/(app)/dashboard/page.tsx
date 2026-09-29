import BoardList from "./BoardList";
import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import "@/styles/dashboard.css";

export default async function DashboardPage() {

  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-content">
        <BoardList user={user} />
      </div>
    </main>
  );
}