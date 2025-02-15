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

    // Horizontal lines for values
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

    // Sort points by step
    const sortedPoints = [...points].sort((a, b) => a.step - b.step);

    // Draw lines between points
    if (sortedPoints.length > 0) {
      const start = toCanvasCoords(sortedPoints[0], canvas.width, canvas.height);
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < sortedPoints.length; i++) {
        const current = toCanvasCoords(sortedPoints[i], canvas.width, canvas.height);
        ctx.lineTo(current.x, current.y);
      }
      ctx.stroke();
    }

    // Draw points
    sortedPoints.forEach((point) => {
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