import { gql } from "@apollo/client";
import { getUser } from "@/lib/auth/actions";
import { client } from "@/lib/graphql/client";
import { notFound, redirect } from "next/navigation";
import { BoardCanvas } from "./BoardCanvas";

const FIND_BOARD = gql`
  query FindFirstdrawing_board($where: drawing_boardWhere) {
    findFirstdrawing_board(where: $where) {
      id, name, display_name
    }
  }
`;

type Board = {
  id: string;
  name: string;
  display_name: string;
};

type GetBoardData = {
  findFirstdrawing_board: Board | null;
}

type GetBoardVariables = {
  where: {
    name: { eq: string },
    owner_id: { eq: string }
  }
}

export default async function BoardPage({ params }: { params: Promise<{ 'board-name': string }> }) {
  const _params = await params;
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data } = await client.query<GetBoardData, GetBoardVariables>({
    query: FIND_BOARD,
    variables: {
      where: {
        name: { eq: _params["board-name"] },
        owner_id: { eq: user ? user.id : "" }
      }
    }
  });

  if (!data || !data.findFirstdrawing_board) {
    notFound();
  };


  return <BoardCanvas boardTitle={data.findFirstdrawing_board?.display_name ?? ""} />;
}