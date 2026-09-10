"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { useState, useEffect } from "react";
import { gql } from "@apollo/client";

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
  owner_id: string;
  limit: number;
  offset: number;
  orderBy?: [string];
}

type GetBoardData = {
  findManydrawing_board: Board[] | null;
}

export default function BoardList({user}: {user: {id: string}}) {
  
  const { loading, error, data } = useQuery<GetBoardData, GetBoardVariables>(SELECT_BOARDS, {
    variables: {
      owner_id: user.id,
      limit: 10,
      offset: 0,
      // orderBy: ["created_at_DESC"]
    }
  });
  
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    console.log("DATA", data);
    console.log("ERROR", error);
    console.log("LOADING", loading);
    if (data) {
      setBoards(data['findManydrawing_board'] || []);
    }
  }, [data]);

  return (
    <section className="dashboard-section" aria-labelledby="recent-heading">
      <div className="section-heading">
        <h2 id="recent-heading">Your boards</h2>
        {/* <button className="sort-button" type="button">
          Recently edited <span aria-hidden="true">⌄</span>
        </button> */}
      </div>
      <div className="board-grid">
        <Link className="new-board-card" href="/boards/new"><span className="new-board-icon" aria-hidden="true">+</span><strong>Start a new board</strong><span>Blank canvas, open possibilities.</span></Link>
        {boards.map((board) => <Link className={`board-card board-card-red`} href={`/boards/${board.id}`} key={board.id}><div className="board-preview" aria-hidden="true"><span>{board.display_name}</span></div><div className="board-card-info"><div><strong>{board.name}</strong><span>{board.display_name}</span></div></div></Link>)}
      </div>
    </section>
  );
}