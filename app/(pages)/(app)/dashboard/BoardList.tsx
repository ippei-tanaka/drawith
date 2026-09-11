"use client";

import Link from "next/link";
import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const BOARDS_PER_PAGE = 7;

const SELECT_BOARDS = gql`
  query Query($limit: Int, $offset: Int, $orderBy: [drawing_boardOrderBy!], $ownerId: String) {
    findManydrawing_board(limit: $limit, offset: $offset, orderBy: $orderBy, where:  {
      owner_id: { eq: $ownerId }
    }) {
      id, name, display_name
    }
  }
`;

type Board = {
  id: string;
  name: string;
  display_name: string;
};

type GetBoardVariables = {
  ownerId: string;
  limit: number;
  offset: number;
};

type GetBoardData = {
  findManydrawing_board: Board[] | null;
};

export default function BoardList({ user }: { user: { id: string } }) {
  const [offset, setOffset] = useState(0);
  const { data, error, loading } = useQuery<GetBoardData, GetBoardVariables>(SELECT_BOARDS, {
    variables: {
      ownerId: user.id,
      limit: BOARDS_PER_PAGE + 1,
      offset,
    },
  });

  const boards = data?.findManydrawing_board ?? [];
  const hasNextPage = boards.length > BOARDS_PER_PAGE;
  const pageBoards = boards.slice(0, BOARDS_PER_PAGE);
  const pageNumber = Math.floor(offset / BOARDS_PER_PAGE) + 1;

  return (
    <section className="dashboard-section" aria-labelledby="recent-heading">
      <div className="section-heading">
        <h2 id="recent-heading">Your boards</h2>
      </div>
      <div className="board-grid">
        <Link className="new-board-card" href="/boards/new"><span className="new-board-icon" aria-hidden="true">+</span><strong>Start a new board</strong><span>Blank canvas, open possibilities.</span></Link>
        {pageBoards.map((board) => 
          <Link className={`board-card board-card-red`} href={`/boards/${board.name}`} key={board.id}>
            <div className="board-preview" aria-hidden="true">
              <span>{board.display_name}</span>
            </div>
            <div className="board-card-info">
              <div>
                <strong>{board.name}</strong>
                <span>{board.display_name}</span>
              </div>
            </div>
          </Link>)}
      </div>
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
    </section>
  );
}