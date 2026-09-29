"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { findManyBoards, Board } from "@/actions/board-actions";
import { BoardPreview } from "@/components/boards/BoardPreview";

const BOARDS_PER_PAGE = 7;

const ORDER_OPTIONS = {
  created_at_desc: { label: "Newest first", orderBy: { "created_at": "Desc" as const }},
  created_at_asc: { label: "Oldest first", orderBy: { "created_at": "Asc" as const } },
  display_name_asc: { label: "Name (A-Z)", orderBy: { "display_name": "Asc" as const } },
  display_name_desc: { label: "Name (Z-A)", orderBy: { "display_name": "Desc" as const } },
};

type OrderKey = keyof typeof ORDER_OPTIONS;

export default function BoardList({ user }: { user: { id: string } }) {
  const [offset, setOffset] = useState(0);
  const [orderKey, setOrderKey] = useState<OrderKey>("created_at_desc");
  const [boards, setBoards] = useState<Board[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // console.log(ORDER_OPTIONS[orderKey].orderBy);
    findManyBoards({
    ownerId: user.id,
    limit: BOARDS_PER_PAGE + 1,
    offset,
    orderBy: ORDER_OPTIONS[orderKey].orderBy,
    })
      .then((result) => {
        setBoards(result ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [user.id, offset, orderKey]);

  useEffect(() => {
    setOffset(0);
  }, [user.id, orderKey]);  

  const hasNextPage = boards.length > BOARDS_PER_PAGE;
  const pageBoards = boards.slice(0, BOARDS_PER_PAGE);
  const pageNumber = Math.floor(offset / BOARDS_PER_PAGE) + 1;

  return (
    <section className="dashboard-section" aria-labelledby="recent-heading">
      <div className="section-heading">
        <h2 id="recent-heading">Your boards</h2>
      </div>
      <div className="board-list-pagination-container">
        {error ? <p className="board-list-status" role="alert">Unable to load boards.</p> : null}
        {loading ? <p className="board-list-status" aria-live="polite">Loading boards...</p> : null}
        <nav className="board-pagination" aria-label="Board pages">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOffset((currentOffset) => currentOffset - BOARDS_PER_PAGE)
            }}
            disabled={loading || offset === 0}
          >
            Previous
          </button>
          <span aria-live="polite">Page {pageNumber}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOffset((currentOffset) => currentOffset + BOARDS_PER_PAGE)
            }}
            disabled={loading || !hasNextPage}
          >
            Next
          </button>
        </nav>
        <div className="board-order">
          <label htmlFor="board-order-select">Sort by</label>
          <select
            id="board-order-select"
            value={orderKey}
            onChange={(e) => setOrderKey(e.target.value as OrderKey)}
            disabled={loading}
          >
            {Object.entries(ORDER_OPTIONS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="board-grid">
        <Link className="new-board-card" href="/boards/new"><span className="new-board-icon" aria-hidden="true">+</span><strong>Start a new board</strong><span>Blank canvas, open possibilities.</span></Link>
        {pageBoards.map((board) => 
          <Link className={`board-card board-card-red`} href={`/boards/${board.name}`} key={board.id}>
            <BoardPreview boardId={board.id} boardName={board.display_name} />
            <div className="board-card-info">
              <div>
                <strong>{board.name}</strong>
                <span>{board.display_name}</span>
              </div>
            </div>
          </Link>)}
      </div>
    </section>
  );
}