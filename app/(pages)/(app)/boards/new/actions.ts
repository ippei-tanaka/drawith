"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db/db";
import { getUser } from "@/app/actions/auth";
import { drawingBoard } from "@/lib/db/schema";

const getValue = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
};

export async function createBoard(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const displayName = getValue(formData, "displayName");
  if (!displayName) {
    redirect("/boards/new?error=Give%20your%20board%20a%20name.");
  }

  const id = crypto.randomUUID();

  try {
    await db.insert(drawingBoard).values({
      id,
      name: `${displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "board"}-${id.slice(0, 8)}`,
      displayName,
      ownerId: user.id,
    });
  } catch {
    redirect("/boards/new?error=We%20couldn%27t%20create%20that%20board.%20Please%20try%20again.");
  }

  redirect(`/boards/${id}`);
}