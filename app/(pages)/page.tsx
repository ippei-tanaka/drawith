"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ActiveBoard = {
  id: string;
  title: string;
  people: number;
  activity: string;
  color: string;
};

const initialActiveBoards: ActiveBoard[] = [
  { id: "friday-brainstorm", title: "Friday brainstorm", people: 3, activity: "Maya is drawing", color: "coral" },
  { id: "product-story-map", title: "Product story map", people: 5, activity: "Noah added a note", color: "blue" },
  { id: "weekly-retro", title: "Weekly retro", people: 2, activity: "You were invited", color: "yellow" },
];

export default function Home()
{
  const [activeBoards, setActiveBoards] = useState(initialActiveBoards);
  const [lastUpdated, setLastUpdated] = useState("just now");

  useEffect(() => {
    const activityTimer = window.setInterval(() => {
      setActiveBoards((boards) => boards.map((board, index) => ({
        ...board,
        activity: index === 0 ? "Noah added a note" : index === 1 ? "Maya is drawing" : "You were invited",
      })));
      setLastUpdated("just now");
    }, 5000);

    return () => window.clearInterval(activityTimer);
  }, []);

  return (
    <main className="home-page">
      <header className="home-topbar">
        <Link className="home-brand" href="/" aria-label="Drawith home"><span className="home-brand-mark">D</span><span>drawith</span></Link>
        <span className="home-section-note">Live boards</span>
      </header>

      <div className="home-content">
        <section className="home-welcome">
          <div><p className="home-eyebrow">Open canvas</p><h1>Drawith, together.</h1><p className="home-subtitle">See what is moving right now, then join the board.</p></div>
        </section>

        <section className="home-active-boards" aria-labelledby="active-heading">
          <div className="home-section-heading"><div className="home-active-heading"><span className="home-live-indicator" aria-hidden="true" /><h2 id="active-heading">Active right now</h2></div><span className="home-section-note">Updated {lastUpdated}</span></div>
          <div className="home-active-boards-list">
            {activeBoards.map((board) => <Link className={`home-active-board home-active-board-${board.color}`} href={`/boards/${board.id}`} key={board.id}><span className="home-active-board-preview" aria-hidden="true"><span /></span><span className="home-active-board-copy"><strong>{board.title}</strong><span>{board.activity}</span></span><span className="home-active-board-people" aria-label={`${board.people} people in this board`}><span className="home-presence-dots"><i /><i /><i /></span>{board.people}</span><span className="home-active-board-arrow" aria-hidden="true">&#8594;</span></Link>)}
          </div>
        </section>
      </div>
    </main>
  );
}
