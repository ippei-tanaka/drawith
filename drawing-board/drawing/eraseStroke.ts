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

function interpolate(
  from: PointerSample,
  to: PointerSample,
  progress: number,
): PointerSample {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    pressure: from.pressure + (to.pressure - from.pressure) * progress,
  };
}

function erasedInterval(
  from: PointerSample,
  to: PointerSample,
  eraserFrom: PointerSample,
  eraserTo: PointerSample,
  radius: number,
): [number, number] | null {
  const distanceAt = (progress: number) => pointToSegmentDistance(
    interpolate(from, to, progress),
    eraserFrom,
    eraserTo,
  );

  let minimumProgress = 0;
  let maximumProgress = 1;

  // Distance to a line segment is convex along a line. Ternary search finds
  // the closest point even when neither endpoint is inside the eraser.
  for (let iteration = 0; iteration < 32; iteration++) {
    const left = minimumProgress + (maximumProgress - minimumProgress) / 3;
    const right = maximumProgress - (maximumProgress - minimumProgress) / 3;

    if (distanceAt(left) < distanceAt(right)) {
      maximumProgress = right;
    } else {
      minimumProgress = left;
    }
  }

  const closestProgress = (minimumProgress + maximumProgress) / 2;

  if (distanceAt(closestProgress) > radius) {
    return null;
  }

  const startInside = distanceAt(0) <= radius;
  const endInside = distanceAt(1) <= radius;
  let start = 0;
  let end = 1;

  if (!startInside) {
    let low = 0;
    let high = closestProgress;

    for (let iteration = 0; iteration < 32; iteration++) {
      const middle = (low + high) / 2;
      if (distanceAt(middle) <= radius) {
        high = middle;
      } else {
        low = middle;
      }
    }

    start = high;
  }

  if (!endInside) {
    let low = closestProgress;
    let high = 1;

    for (let iteration = 0; iteration < 32; iteration++) {
      const middle = (low + high) / 2;
      if (distanceAt(middle) <= radius) {
        low = middle;
      } else {
        high = middle;
      }
    }

    end = low;
  }

  return [start, end];
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

  if (stroke.points.length === 1) {
    return pointToSegmentDistance(
      stroke.points[0],
      eraserFrom,
      eraserTo,
    ) <= radius ? [] : null;
  }

  const parts: Stroke[] = [];
  let points: PointerSample[] = [];
  let erased = false;

  const finishPart = () => {
    if (points.length > 0) {
      parts.push({ ...stroke, points });
      points = [];
    }
  };

  for (let index = 1; index < stroke.points.length; index++) {
    const from = stroke.points[index - 1];
    const to = stroke.points[index];
    const interval = erasedInterval(
      from,
      to,
      eraserFrom,
      eraserTo,
      radius,
    );

    if (!interval) {
      if (points.length === 0) {
        points.push(from);
      }
      points.push(to);
      continue;
    }

    erased = true;
    const [start, end] = interval;

    if (start > 0) {
      if (points.length === 0) {
        points.push(from);
      }
      points.push(interpolate(from, to, start));
      finishPart();
    } else {
      points = [];
    }

    if (end < 1) {
      points.push(interpolate(from, to, end));
    }
  }

  if (!erased) {
    return null;
  }

  finishPart();
  return parts;
}