"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/store/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";

type ActiveBoard = {
  title: string;
  people: number;
  activity: string;
  color: string;
};

const initialActiveBoards: ActiveBoard[] = [
  { title: "Friday brainstorm", people: 3, activity: "Maya is drawing", color: "coral" },
  { title: "Product story map", people: 5, activity: "Noah added a note", color: "blue" },
  { title: "Weekly retro", people: 2, activity: "You were invited", color: "yellow" },
];

const recentBoards = [
  { title: "Friday brainstorm", detail: "Edited 12 minutes ago", members: "3 people", color: "coral", preview: "↗" },
  { title: "Product story map", detail: "Edited yesterday", members: "5 people", color: "blue", preview: "→" },
  { title: "Untitled canvas", detail: "Edited 3 days ago", members: "Only you", color: "yellow", preview: "✦" },
];

export default function DashboardPage() 
{
  const dispatch = useAppDispatch();
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

    const labelTimer = window.setInterval(() => setLastUpdated("a few seconds ago"), 10000);

    return () => {
      window.clearInterval(activityTimer);
      window.clearInterval(labelTimer);
    };
  }, []);

  // const { data: session } = await auth.getSession();

  return (
    <main className="dashboard-page">
      <header className="dashboard-topbar">
        <Link className="dashboard-brand" href="/" aria-label="Drawith home"><span className="dashboard-brand-mark">D</span><span>drawith</span></Link>
        <nav className="dashboard-nav" aria-label="Main navigation"><Link className="dashboard-nav-active" href="/dashboard">Your boards</Link><a href="#templates">Templates</a></nav>
        <div className="dashboard-account"><button className="dashboard-help" aria-label="Help" title="Help">?</button><button className="dashboard-sign-out" type="button" onClick={() => dispatch(signOut())}>Sign out</button><button className="dashboard-avatar" aria-label="Open account menu">YO</button></div>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-welcome"><div><p className="dashboard-eyebrow">Wednesday, September 2</p><h1>Good morning, Yuki.</h1><p className="dashboard-subtitle">What are you making space for today?</p></div><Link className="new-board-button" href="/dashboard/new"><span aria-hidden="true">+</span> New board</Link></section>

        <section className="active-boards-section" aria-labelledby="active-heading">
          <div className="section-heading"><div className="active-heading"><span className="live-indicator" aria-hidden="true" /><h2 id="active-heading">Active right now</h2></div><span className="section-note">Updated {lastUpdated}</span></div>
          <div className="active-boards-list">
            {activeBoards.map((board) => <Link className={`active-board active-board-${board.color}`} href="/" key={board.title}><span className="active-board-preview" aria-hidden="true"><span /></span><span className="active-board-copy"><strong>{board.title}</strong><span>{board.activity}</span></span><span className="active-board-people" aria-label={`${board.people} people in this board`}><span className="presence-dots"><i /><i /><i /></span>{board.people}</span><span className="active-board-arrow" aria-hidden="true">&#8594;</span></Link>)}
          </div>
        </section>

        <section className="dashboard-section" aria-labelledby="recent-heading">
          <div className="section-heading"><h2 id="recent-heading">Your boards</h2><button className="sort-button" type="button">Recently edited <span aria-hidden="true">⌄</span></button></div>
          <div className="board-grid">
            <Link className="new-board-card" href="/dashboard/new"><span className="new-board-icon" aria-hidden="true">+</span><strong>Start a new board</strong><span>Blank canvas, open possibilities.</span></Link>
            {recentBoards.map((board) => <Link className={`board-card board-card-${board.color}`} href="/" key={board.title}><div className="board-preview" aria-hidden="true"><span>{board.preview}</span></div><div className="board-card-info"><div><strong>{board.title}</strong><span>{board.detail}</span></div><small>{board.members}</small></div></Link>)}
          </div>
        </section>

        <section className="dashboard-section template-section" id="templates" aria-labelledby="template-heading">
          <div className="section-heading"><h2 id="template-heading">Start with a little momentum</h2><span className="section-note">Templates</span></div>
          <div className="template-grid">
            <Link className="template-card template-meeting" href="/"><span className="template-illustration">◎</span><strong>Team brainstorm</strong><span>Get the room thinking together.</span></Link>
            <Link className="template-card template-project" href="/"><span className="template-illustration">▱</span><strong>Project map</strong><span>Turn loose thoughts into a path.</span></Link>
            <Link className="template-card template-retro" href="/"><span className="template-illustration">✳</span><strong>Weekly retro</strong><span>Reflect, learn, and move forward.</span></Link>
          </div>
        </section>
      </div>
    </main>
  );
}