"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";

const CREATE_NEW_BOARD = gql`
  mutation Mutation($input: drawing_boardCreate!) {
    createOnedrawing_board(input: $input) {
      id
      name
      display_name
    }
  }
`;

export default function NewBoardForm({user}: {user: {id: string}}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mutate, { data, loading, error }] = useMutation(CREATE_NEW_BOARD);

  return (
    <form className="form" onSubmit={async (e) => {
      e.preventDefault();
      try {
        await mutate({
          variables: {
            input: {
              name: name,
              display_name: displayName,
              owner_id: user.id
            }
          }
        });
        console.log("MUTATION SUCCESS", data);
      } catch (err) {
        console.error("MUTATION ERROR", err);
      }
      router.push("/dashboard");
    }}>
      <label htmlFor="board-display-name">Board Display Name</label>
      <input id="board-display-name" name="displayName" type="text" placeholder="e.g. Friday brainstorm" maxLength={120} autoFocus required value={displayName} 
        onChange={(e) => {
          setDisplayName(e.target.value);
          setName(e.target.value.trim().replace(/[^a-zA-Z0-9\s]+/g, "").replace(/\s+/g, "-").toLocaleLowerCase());
        }} />
      <label htmlFor="board-name">Board Identifier</label>
      <input id="board-name" name="name" type="text" placeholder="e.g. friday-brainstorm" maxLength={120} required value={name} onChange={(e) => setName(e.target.value)} />
      {error && <p className="form-error" role="alert">{error.message}</p>}
      <button className="button" type="submit">Create board</button>
    </form>
  );
}