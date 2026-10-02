import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/actions";
import NewBoardForm from "./NewBoardForm";

export default async function NewBoardPage() {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="form-page">
      <section className="panel" aria-labelledby="new-board-heading">
        <h1 id="new-board-heading">New board</h1>
        <p className="panel-description">Name your board. You can rename it later.</p>
        <NewBoardForm user={user} />
        <p className="panel-footer"><Link href="/dashboard">Back to your boards</Link></p>
      </section>
    </main>
  );
}