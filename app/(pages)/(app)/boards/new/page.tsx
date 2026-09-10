import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/auth";
import { createBoard } from "./actions";

export default async function NewBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { error } = await searchParams;

  return (
    <main className="new-board-page">
      <section className="new-board-panel" aria-labelledby="new-board-heading">
        <p className="new-board-kicker">A fresh canvas</p>
        <h1 id="new-board-heading">Make room for a new idea.</h1>
        <p className="new-board-description">Name your board, then bring people in when you are ready. You can always rename it later.</p>
        <form className="new-board-form" action={createBoard}>
          <label htmlFor="board-display-name">Board name</label>
          <input id="board-display-name" name="displayName" type="text" placeholder="e.g. Friday brainstorm" maxLength={120} autoFocus required />
          {error && <p className="new-board-error" role="alert">{error}</p>}
          <button className="new-board-submit" type="submit">Create board</button>
        </form>
        <Link className="back-link" href="/dashboard">Back to your boards</Link>
      </section>
    </main>
  );
}