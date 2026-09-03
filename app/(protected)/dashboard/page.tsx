import Link from "next/link";
import { signOut } from "../../(auth)/sign-out/actions";

const recentBoards = [
  { title: "Friday brainstorm", detail: "Edited 12 minutes ago", members: "3 people", color: "coral", preview: "↗" },
  { title: "Product story map", detail: "Edited yesterday", members: "5 people", color: "blue", preview: "→" },
  { title: "Untitled canvas", detail: "Edited 3 days ago", members: "Only you", color: "yellow", preview: "✦" },
];

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <header className="dashboard-topbar">
        <Link className="dashboard-brand" href="/" aria-label="Drawith home"><span className="dashboard-brand-mark">D</span><span>drawith</span></Link>
        <nav className="dashboard-nav" aria-label="Main navigation"><Link className="dashboard-nav-active" href="/dashboard">Your boards</Link><a href="#templates">Templates</a></nav>
        <div className="dashboard-account"><button className="dashboard-help" aria-label="Help" title="Help">?</button><form action={signOut}><button className="dashboard-sign-out" type="submit">Sign out</button></form><button className="dashboard-avatar" aria-label="Open account menu">YO</button></div>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-welcome"><div><p className="dashboard-eyebrow">Wednesday, September 2</p><h1>Good morning, Yuki.</h1><p className="dashboard-subtitle">What are you making space for today?</p></div><Link className="new-board-button" href="/"><span aria-hidden="true">+</span> New board</Link></section>

        <section className="dashboard-section" aria-labelledby="recent-heading">
          <div className="section-heading"><h2 id="recent-heading">Recent boards</h2><button className="sort-button">Recently edited <span aria-hidden="true">⌄</span></button></div>
          <div className="board-grid">
            <Link className="new-board-card" href="/"><span className="new-board-icon">+</span><strong>Start a new board</strong><span>Blank canvas, open possibilities.</span></Link>
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