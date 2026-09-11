import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/actions";
import NewBoardForm from "./NewBoardForm";
import "../../../../styles/new-board.css";

export default async function NewBoardPage() {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="new-board-page">
      <section className="new-board-panel" aria-labelledby="new-board-heading">
        <p className="new-board-kicker">A fresh canvas</p>
        <h1 id="new-board-heading">Make room for a new idea.</h1>
        <p className="new-board-description">Name your board, then bring people in when you are ready. You can always rename it later.</p>
        <NewBoardForm user={user} />
        <Link className="back-link" href="/dashboard">Back to your boards</Link>
      </section>
    </main>
  );
}