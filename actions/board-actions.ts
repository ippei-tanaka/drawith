import { client } from "@/lib/graphql/client";
import { gql } from "@apollo/client";

export type Board = {
  id: string;
  name: string;
  display_name: string;
};

const FIND_MANY_BOARDS = gql`
  query Query($limit: Int, $offset: Int, $orderBy: [drawing_boardOrderBy!], $ownerId: String) {
    findManydrawing_board(limit: $limit, offset: $offset, orderBy: $orderBy, where:  {
      owner_id: { eq: $ownerId }
    }) {
      id, name, display_name
    }
  }
`;

type BoardOrderBy = {
  id?: "Asc" | "Desc";
  name?: "Asc" | "Desc";
  display_name?: "Asc" | "Desc";
  created_at?: "Asc" | "Desc";
  updated_at?: "Asc" | "Desc";
};

type FindManyBoardVariables = {
  ownerId: string;
  limit?: number;
  offset?: number;
  orderBy?: BoardOrderBy;
};

type FindManyBoardData = {
  findManydrawing_board: Board[] | null;
};

export const findManyBoards = async (variables: FindManyBoardVariables) => {
  await client.clearStore();
  const { data } = await client.query<FindManyBoardData, FindManyBoardVariables>({
    query: FIND_MANY_BOARDS,
    variables,
  });
  return (data && data.findManydrawing_board) || null;
};


const FIND_BOARD = gql`
  query FindFirstdrawing_board($where: drawing_boardWhere) {
    findFirstdrawing_board(where: $where) {
      id, name, display_name
    }
  }
`;

type GetBoardData = {
  findFirstdrawing_board: Board | null;
}

type GetBoardVariables = {
  where: {
    name: { eq: string }
  }
}

export const findBoardByName = async (boardName: string) => {
  await client.clearStore();
  const { data } = await client.query<GetBoardData, GetBoardVariables>({
    query: FIND_BOARD,
    variables: {
      where: {
        name: { eq: boardName },
      }
    }
  });
  return (data && data.findFirstdrawing_board) || null;
};

const DELETE_BOARD = gql`
  mutation Deletedrawing_board($where: drawing_boardWhere) {
    deletedrawing_board(where: $where) {
      id
    }
  }
`;

type DeleteBoardData = {
  deletedrawing_board: Board | null;
}

type DeleteBoardVariables = {
  where: {
    AND: [
      // { owner_id: { eq: string }},
      { id: { eq: string }},
    ]
  }
}

export const deleteBoardById = async (boardId: string) => {
  const { data } = await client.mutate<DeleteBoardData, DeleteBoardVariables>({
    mutation: DELETE_BOARD,
    variables: {
      where: {
        AND: [
          // { owner_id: { eq: userId }},
          { id: { eq: boardId }},
        ]
      }
    }
  });
  return (data && data.deletedrawing_board) || null;
};

const CHANGE_BOARD_NAME = gql`
  mutation Updatedrawing_board($input: drawing_boardUpdate!, $where: drawing_boardWhere) {
    updatedrawing_board(input: $input, where: $where) {
      id, name, display_name
    }
  }
`;

type ChangeBoardNameData = {
    updatedrawing_board: Board | null;
  }

type ChangeBoardNameVariables = {
  where: {
    id: { eq: string }
  },
  input: {
    display_name: string
  }
}

export const changeBoardNamebyId = async (boardId: string, newDisplayName: string) => 
{
  const { data } = await client.mutate<ChangeBoardNameData, ChangeBoardNameVariables>({
    mutation: CHANGE_BOARD_NAME,
    variables: {
      where: {
        id: { eq: boardId }
      },
      input: {
        display_name: newDisplayName
      }
    }
  });

  return (data && data.updatedrawing_board) || null;
};