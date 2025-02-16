import React, { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Point {
  step: number; // x-domain in discrete steps
  value: number; // y-value
}

interface CurveEditorProps {
  label: string;
  points: Point[];
  steps: number;
  minValue: number;
  maxValue: number;
  onChange: (points: Point[]) => void;
}

// ---------------------------------------------
// 1) Influence Function
// ---------------------------------------------
function calculateInfluence(
  draggedStep: number,
  currentStep: number,
  totalSteps: number,
): number {
  const distance = Math.abs(currentStep - draggedStep);
  // If you want a narrower or wider “reach,” tweak maxDistance or sigma
  const maxDistance = totalSteps / 2; // half the total range
  const sigma = maxDistance / 3; // tune as you like
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

// ---------------------------------------------
// 2) Main Component
// ---------------------------------------------
export function CurveEditor({
  label,
  points,
  steps,
  minValue,
  maxValue,
  onChange,
}: CurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Keep track of each point’s original value at the start of a drag.
  // That way, we can apply relative offsets as the drag moves.
  const [initialPoints, setInitialPoints] = useState<Point[]>([]);

  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 200 });
  const PADDING = 20;

  // ------------------------------------------------------
  // A) Canvas Size / Setup
  // ------------------------------------------------------
  const updateCanvasSize = () => {
    if (containerRef.current && canvasRef.current) {
      const container = containerRef.current;
      const newWidth = container.clientWidth;
      const newHeight = Math.min(container.clientWidth * 0.66, 300); // maintain aspect ratio

      setCanvasSize({ width: newWidth, height: newHeight });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = newWidth * dpr;
        canvas.height = newHeight * dpr;
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
        ctx.scale(dpr, dpr);
      }
    }
  };

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // ------------------------------------------------------
  // B) Coordinate Conversions
  // ------------------------------------------------------
  const toCanvasCoords = (point: Point) => {
    const xRange = canvasSize.width - 2 * PADDING;
    const yRange = canvasSize.height - 2 * PADDING;
    const x = PADDING + (point.step / (steps - 1)) * xRange;
    const y =
      PADDING + ((maxValue - point.value) / (maxValue - minValue)) * yRange;
    return { x, y };
  };

  const fromCanvasCoords = (cx: number, cy: number): Point => {
    const clampedX = Math.max(
      PADDING,
      Math.min(canvasSize.width - PADDING, cx),
    );
    const clampedY = Math.max(
      PADDING,
      Math.min(canvasSize.height - PADDING, cy),
    );

    const xRange = canvasSize.width - 2 * PADDING;
    const yRange = canvasSize.height - 2 * PADDING;

    const step = Math.round(((clampedX - PADDING) / xRange) * (steps - 1));
    const value =
      maxValue - ((clampedY - PADDING) / yRange) * (maxValue - minValue);

    // clamp the result so we don't exceed min/max
    return {
      step,
      value: Math.max(minValue, Math.min(maxValue, value)),
    };
  };

  // ------------------------------------------------------
  // C) Catmull-Rom Spline Helper
  // ------------------------------------------------------
  function catmullRom2D(
    t: number,
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
  ) {
    const t2 = t * t;
    const t3 = t2 * t;

    // For a standard Catmull-Rom, tension = 0.5
    const v0x = 0.5 * (p2.x - p0.x);
    const v0y = 0.5 * (p2.y - p0.y);
    const v1x = 0.5 * (p3.x - p1.x);
    const v1y = 0.5 * (p3.y - p1.y);

    const x =
      (2 * p1.x - 2 * p2.x + v0x + v1x) * t3 +
      (-3 * p1.x + 3 * p2.x - 2 * v0x - v1x) * t2 +
      v0x * t +
      p1.x;

    const y =
      (2 * p1.y - 2 * p2.y + v0y + v1y) * t3 +
      (-3 * p1.y + 3 * p2.y - 2 * v0y - v1y) * t2 +
      v0y * t +
      p1.y;

    return { x, y };
  }

  function getSafe<T>(arr: T[], index: number): T {
    if (index < 0) return arr[0];
    if (index >= arr.length) return arr[arr.length - 1];
    return arr[index];
  }

  // ------------------------------------------------------
  // D) Drawing the Curve
  // ------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i < steps; i++) {
      const x = PADDING + ((canvasSize.width - 2 * PADDING) * i) / (steps - 1);
      ctx.beginPath();
      ctx.moveTo(x, PADDING);
      ctx.lineTo(x, canvasSize.height - PADDING);
      ctx.stroke();
    }

    // Horizontal lines
    const numLines = 5;
    for (let i = 0; i <= numLines; i++) {
      const y = PADDING + ((canvasSize.height - 2 * PADDING) * i) / numLines;
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(canvasSize.width - PADDING, y);
      ctx.stroke();
    }

    // Sort points by step
    const sortedPoints = [...points].sort((a, b) => a.step - b.step);
    const coords = sortedPoints.map(toCanvasCoords);

    // Draw Catmull-Rom Spline
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (coords.length > 1) {
      const numSegments = coords.length - 1;
      const subdivisions = 20; // how many samples per segment

      for (let i = 0; i < numSegments; i++) {
        const p0 = getSafe(coords, i - 1);
        const p1 = getSafe(coords, i);
        const p2 = getSafe(coords, i + 1);
        const p3 = getSafe(coords, i + 2);

        for (let s = 0; s <= subdivisions; s++) {
          const t = s / subdivisions;
          const { x, y } = catmullRom2D(t, p0, p1, p2, p3);

          if (i === 0 && s === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    }

    // Draw control points
    sortedPoints.forEach((pt) => {
      const { x, y } = toCanvasCoords(pt);
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // Step labels
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    for (let i = 0; i < steps; i++) {
      const x = PADDING + ((canvasSize.width - 2 * PADDING) * i) / (steps - 1);
      ctx.fillText(`${i + 1}`, x, canvasSize.height - 5);
    }
  }, [points, steps, minValue, maxValue, canvasSize]);

  // ------------------------------------------------------
  // E) Interaction Handlers
  // ------------------------------------------------------
  const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getEventPosition(e);
    if (!pos) return;

    const { x, y } = pos;

    // find the closest point
    let closestIndex = -1;
    let closestDistance = Infinity;
    points.forEach((point, index) => {
      const { x: cx, y: cy } = toCanvasCoords(point);
      const dist = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2));
      if (dist < 15 && dist < closestDistance) {
        closestDistance = dist;
        closestIndex = index;
      }
    });

    if (closestIndex !== -1) {
      setDraggingIndex(closestIndex);
      // Store the original positions so we can do relative offset
      setInitialPoints([...points]);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingIndex === null || initialPoints.length === 0) return;
    const pos = getEventPosition(e);
    if (!pos) return;

    // Convert current mouse pos -> domain
    const newPoint = fromCanvasCoords(pos.x, pos.y);

    // The delta in "value" from the original (start of drag) for the dragged point
    const draggedOriginal = initialPoints[draggingIndex];
    const deltaValue = newPoint.value - draggedOriginal.value;

    // Apply that delta to *all* points, scaled by the "influence"
    const newPoints = initialPoints.map((p, i) => {
      if (i === draggingIndex) {
        // The dragged point moves exactly with the mouse
        return {
          ...p,
          value: clampValue(p.value + deltaValue, minValue, maxValue),
        };
      } else {
        // For neighbors, scale by a Gaussian
        const influence = calculateInfluence(
          draggedOriginal.step, // the step of the point being dragged
          p.step, // this point's step
          steps,
        );
        const influencedValue = p.value + deltaValue * influence;
        return {
          ...p,
          value: clampValue(influencedValue, minValue, maxValue),
        };
      }
    });

    onChange(newPoints);
  };

  const handleEnd = () => {
    setDraggingIndex(null);
    setInitialPoints([]);
  };

  const clampValue = (v: number, minV: number, maxV: number) =>
    Math.max(minV, Math.min(maxV, v));

  // ------------------------------------------------------
  // F) Render
  // ------------------------------------------------------
  return (
    <Card className="p-4 w-full">
      <div className="font-medium mb-2">{label}</div>
      <div ref={containerRef} className="w-full">
        <canvas
          ref={canvasRef}
          className="w-full h-auto border rounded-lg cursor-pointer touch-none"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onTouchCancel={handleEnd}
        />
      </div>
    </Card>
  );
}
