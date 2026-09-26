import type { PointerSample, Stroke } from "@/lib/store/boardSlice";

function pointToSegmentDistance(
  point: PointerSample,
  from: PointerSample,
  to: PointerSample,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - from.x, point.y - from.y);
  }

  const projection = Math.max(
    0,
    Math.min(
      1,
      ((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared,
    ),
  );

  return Math.hypot(
    point.x - (from.x + projection * dx),
    point.y - (from.y + projection * dy),
  );
}

function segmentsIntersect(
  firstFrom: PointerSample,
  firstTo: PointerSample,
  secondFrom: PointerSample,
  secondTo: PointerSample,
) {
  const orientation = (a: PointerSample, b: PointerSample, c: PointerSample) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const first = orientation(firstFrom, firstTo, secondFrom);
  const second = orientation(firstFrom, firstTo, secondTo);
  const third = orientation(secondFrom, secondTo, firstFrom);
  const fourth = orientation(secondFrom, secondTo, firstTo);

  return first * second <= 0 && third * fourth <= 0;
}

function segmentDistance(
  firstFrom: PointerSample,
  firstTo: PointerSample,
  secondFrom: PointerSample,
  secondTo: PointerSample,
) {
  if (segmentsIntersect(firstFrom, firstTo, secondFrom, secondTo)) {
    return 0;
  }

  return Math.min(
    pointToSegmentDistance(firstFrom, secondFrom, secondTo),
    pointToSegmentDistance(firstTo, secondFrom, secondTo),
    pointToSegmentDistance(secondFrom, firstFrom, firstTo),
    pointToSegmentDistance(secondTo, firstFrom, firstTo),
  );
}

export function eraseStroke(
  stroke: Stroke,
  eraserFrom: PointerSample,
  eraserTo: PointerSample,
  eraserSize: number,
): Stroke[] | null {
  if (stroke.points.length === 0) {
    return null;
  }

  const radius = (eraserSize + stroke.size) / 2;
  const erasedPoints = stroke.points.map(point =>
    pointToSegmentDistance(point, eraserFrom, eraserTo) <= radius,
  );
  const erasedSegments = stroke.points.slice(1).map((point, index) =>
    segmentDistance(
      stroke.points[index],
      point,
      eraserFrom,
      eraserTo,
    ) <= radius,
  );

  if (!erasedPoints.some(Boolean) && !erasedSegments.some(Boolean)) {
    return null;
  }

  const parts: Stroke[] = [];
  let points: PointerSample[] = [];

  const finishPart = () => {
    if (points.length > 0) {
      parts.push({ ...stroke, points });
      points = [];
    }
  };

  for (let index = 0; index < stroke.points.length; index++) {
    if (erasedPoints[index]) {
      finishPart();
      continue;
    }

    if (points.length === 0) {
      points.push(stroke.points[index]);
    } else if (!erasedSegments[index - 1]) {
      points.push(stroke.points[index]);
    } else {
      finishPart();
      points.push(stroke.points[index]);
    }
  }

  finishPart();
  return parts;
}