"use client";

import { useEffect } from "react";
import { fetchSession, signOut } from "@/lib/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";


export default function Home()
{
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchSession());
  }, [dispatch]);

  return (
    <>
      test
      {user && <p>Welcome, {user.name}!</p>}
      <button onClick={() => {dispatch(signOut())}}>Sign Out</button>
    </>
  );
}
