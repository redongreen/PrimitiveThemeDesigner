import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Point {
  step: number;
  value: number;
}

interface CurveEditorProps {
  label: string;
  points: Point[];
  steps: number;
  minValue: number;
  maxValue: number;
  onChange: (points: Point[]) => void;
}

function cubicInterpolate(
  points: Point[],
  t: number,
  minStep: number,
  maxStep: number
): number {
  // Find the points that bracket the target step
  const p = points.sort((a, b) => a.step - b.step);
  const i1 = p.findIndex(pt => pt.step > t);

  if (i1 === -1) return p[p.length - 1].value;
  if (i1 === 0) return p[0].value;

  const i0 = i1 - 1;
  const t0 = p[i0].step;
  const t1 = p[i1].step;
  const v0 = p[i0].value;
  const v1 = p[i1].value;

  // Calculate tension vectors
  const tension = 0.5;
  const m0 = i0 > 0 ? (p[i1].value - p[i0 - 1].value) * tension : (v1 - v0) * tension;
  const m1 = i1 < p.length - 1 ? (p[i1 + 1].value - v0) * tension : (v1 - v0) * tension;

  // Cubic Hermite spline interpolation
  const t2 = (t - t0) / (t1 - t0);
  const t3 = t2 * t2;
  const t4 = t3 * t2;

  return (2 * t4 - 3 * t3 + 1) * v0 +
         (t4 - 2 * t3 + t2) * m0 +
         (-2 * t4 + 3 * t3) * v1 +
         (t4 - t3) * m1;
}

export function CurveEditor({ label, points, steps, minValue, maxValue, onChange }: CurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Convert between canvas and value coordinates
  const toCanvasCoords = (point: Point, width: number, height: number) => ({
    x: (point.step / (steps - 1)) * width,
    y: height - ((point.value - minValue) / (maxValue - minValue)) * height
  });

  const fromCanvasCoords = (x: number, y: number, width: number, height: number): Point => ({
    step: Math.round((x / width) * (steps - 1)),
    value: maxValue - ((y / height) * (maxValue - minValue))
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical lines for steps
    for (let i = 0; i < steps; i++) {
      const x = (canvas.width * i) / (steps - 1);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    const numLines = 5;
    for (let i = 0; i <= numLines; i++) {
      const y = (canvas.height * i) / numLines;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw curve
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Draw smooth curve
    const numSegments = canvas.width;
    for (let i = 0; i <= numSegments; i++) {
      const t = (i / numSegments) * (steps - 1);
      const value = cubicInterpolate(points, t, 0, steps - 1);
      const x = (i / numSegments) * canvas.width;
      const y = canvas.height - ((value - minValue) / (maxValue - minValue)) * canvas.height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw points
    points.sort((a, b) => a.step - b.step).forEach((point) => {
      const { x, y } = toCanvasCoords(point, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw step labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < steps; i++) {
      const x = (canvas.width * i) / (steps - 1);
      ctx.fillText(`${i + 1}`, x, canvas.height - 5);
    }
  }, [points, steps, minValue, maxValue]);

  const getMousePosition = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return fromCanvasCoords(x, y, canvas.width, canvas.height);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePosition(e);
    if (!pos) return;

    // Find the closest point
    const index = points.findIndex(p => p.step === pos.step);
    if (index !== -1) {
      setDraggingIndex(index);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIndex === null) return;

    const pos = getMousePosition(e);
    if (!pos) return;

    const newPoints = [...points];
    newPoints[draggingIndex] = {
      step: points[draggingIndex].step,
      value: Math.max(minValue, Math.min(maxValue, pos.value))
    };

    onChange(newPoints);
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  return (
    <Card className="p-4">
      <div className="font-medium mb-2">{label}</div>
      <canvas
        ref={canvasRef}
        width={300}
        height={200}
        className="border rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </Card>
  );
}