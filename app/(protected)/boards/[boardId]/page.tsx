import BoardCanvas from "@/(protected)/_page";

const boardTitles: Record<string, string> = {
  "friday-brainstorm": "Friday brainstorm",
  "product-story-map": "Product story map",
  "weekly-retro": "Weekly retro",
};

export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;

  return <BoardCanvas boardTitle={boardTitles[boardId] ?? "Untitled board"} />;
}