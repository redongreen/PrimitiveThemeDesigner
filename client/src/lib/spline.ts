import { Point } from '@/components/CurveEditor';

export interface Vector2D {
  x: number;
  y: number;
}

// Convert between our point format and vector format
export const toVector = (point: Point): Vector2D => ({
  x: point.step,
  y: point.value
});

export const toPoint = (vector: Vector2D): Point => ({
  step: vector.x,
  value: vector.y
});

// Catmull-Rom spline tension (0.5 for centripetal spline)
const TENSION = 0.5;

// Get spline segment point at t position
function getSplinePoint(
  p0: Vector2D,
  p1: Vector2D,
  p2: Vector2D,
  p3: Vector2D,
  t: number
): Vector2D {
  // Catmull-Rom matrix coefficients
  const t2 = t * t;
  const t3 = t2 * t;

  // Calculate basis functions
  const b0 = -TENSION * t3 + 2 * TENSION * t2 - TENSION * t;
  const b1 = (2 - TENSION) * t3 + (TENSION - 3) * t2 + 1;
  const b2 = (TENSION - 2) * t3 + (3 - 2 * TENSION) * t2 + TENSION * t;
  const b3 = TENSION * t3 - TENSION * t2;

  // Calculate point position
  return {
    x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
    y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y
  };
}

// Get an array of interpolated points for visualization
export function getSplineCurve(points: Point[], segments: number = 50): Vector2D[] {
  if (points.length < 2) return points.map(toVector);
  
  const vectors = points.map(toVector);
  const curve: Vector2D[] = [];
  
  // Create virtual end points for smooth curve ends
  const p0 = vectors[0];
  const p1 = vectors[0];
  const pn = vectors[vectors.length - 1];
  const pn1 = vectors[vectors.length - 1];
  
  vectors.unshift(p0);
  vectors.push(pn1);
  
  // Generate points along each segment
  for (let i = 0; i < vectors.length - 3; i++) {
    for (let t = 0; t <= 1; t += 1 / segments) {
      curve.push(
        getSplinePoint(
          vectors[i],
          vectors[i + 1],
          vectors[i + 2],
          vectors[i + 3],
          t
        )
      );
    }
  }
  
  return curve;
}

// Calculate the influence of a point based on distance
export function calculateInfluence(draggedIndex: number, currentIndex: number, totalPoints: number): number {
  const distance = Math.abs(currentIndex - draggedIndex);
  const maxDistance = Math.ceil(totalPoints / 4); // Local control range
  if (distance > maxDistance) return 0;
  
  // Smooth falloff function
  return Math.cos((distance / maxDistance) * Math.PI * 0.5);
}
