export type Point = {
  x: number;
  y: number;
};

export function iterateSegment(
  from: Point,
  to: Point,
  spacing: number,
  callback: (x: number, y: number) => void,
) {
  const distance = Math.hypot(
    to.x - from.x,
    to.y - from.y,
  );

  for (let d = spacing; d < distance; d += spacing) {
    const t = d / distance;

    callback(
      from.x + (to.x - from.x) * t,
      from.y + (to.y - from.y) * t,
    );
  }
}