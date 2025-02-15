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

function calculateInfluence(draggedStep: number, currentStep: number, totalSteps: number): number {
  const distance = Math.abs(currentStep - draggedStep);
  const maxDistance = totalSteps / 2;

  // Exponential falloff - sigma controls the "spread" of the influence
  const sigma = maxDistance / 3; // This makes the falloff more pronounced
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

export function CurveEditor({ label, points, steps, minValue, maxValue, onChange }: CurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [initialPoints, setInitialPoints] = useState<Point[]>([]);

  // Add padding to keep points away from edges
  const PADDING = 20; // pixels of padding

  // Convert between canvas and value coordinates with padding
  const toCanvasCoords = (point: Point, width: number, height: number) => ({
    x: PADDING + ((point.step / (steps - 1)) * (width - 2 * PADDING)),
    y: PADDING + ((maxValue - point.value) / (maxValue - minValue)) * (height - 2 * PADDING)
  });

  const fromCanvasCoords = (x: number, y: number, width: number, height: number): Point => ({
    step: Math.round(((x - PADDING) / (width - 2 * PADDING)) * (steps - 1)),
    value: Math.max(minValue, Math.min(maxValue, 
      maxValue - (((y - PADDING) / (height - 2 * PADDING)) * (maxValue - minValue))
    ))
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid with padding
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical lines for steps
    for (let i = 0; i < steps; i++) {
      const x = PADDING + ((canvas.width - 2 * PADDING) * i) / (steps - 1);
      ctx.beginPath();
      ctx.moveTo(x, PADDING);
      ctx.lineTo(x, canvas.height - PADDING);
      ctx.stroke();
    }

    // Horizontal lines
    const numLines = 5;
    for (let i = 0; i <= numLines; i++) {
      const y = PADDING + ((canvas.height - 2 * PADDING) * i) / numLines;
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(canvas.width - PADDING, y);
      ctx.stroke();
    }

    // Draw curve
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Sort points and draw smooth curve
    const sortedPoints = [...points].sort((a, b) => a.step - b.step);
    if (sortedPoints.length > 0) {
      const start = toCanvasCoords(sortedPoints[0], canvas.width, canvas.height);
      ctx.moveTo(start.x, start.y);

      // Draw curve segments with quadratic curves
      for (let i = 1; i < sortedPoints.length; i++) {
        const prev = toCanvasCoords(sortedPoints[i - 1], canvas.width, canvas.height);
        const curr = toCanvasCoords(sortedPoints[i], canvas.width, canvas.height);

        const cpX = (prev.x + curr.x) / 2;
        ctx.quadraticCurveTo(cpX, (prev.y + curr.y) / 2, curr.x, curr.y);
      }
      ctx.stroke();
    }

    // Draw points with visible handles
    sortedPoints.forEach((point) => {
      const { x, y } = toCanvasCoords(point, canvas.width, canvas.height);

      // Draw point handle
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw larger interaction area
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // Draw step labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < steps; i++) {
      const x = PADDING + ((canvas.width - 2 * PADDING) * i) / (steps - 1);
      ctx.fillText(`${i + 1}`, x, canvas.height - 5);
    }
  }, [points, steps, minValue, maxValue]);

  const getMousePosition = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp coordinates to stay within padded area
    const clampedX = Math.max(PADDING, Math.min(canvas.width - PADDING, x));
    const clampedY = Math.max(PADDING, Math.min(canvas.height - PADDING, y));

    return fromCanvasCoords(clampedX, clampedY, canvas.width, canvas.height);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePosition(e);
    if (!pos) return;

    // Find the closest point within interaction radius
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top };

    let closestIndex = -1;
    let closestDistance = Infinity;

    points.forEach((point, index) => {
      const coords = toCanvasCoords(point, canvas.width, canvas.height);
      const distance = Math.sqrt(Math.pow(coords.x - mousePos.x, 2) + Math.pow(coords.y - mousePos.y, 2));
      if (distance < 15 && distance < closestDistance) { // Increased interaction radius
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== -1) {
      setDraggingIndex(closestIndex);
      setInitialPoints([...points]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIndex === null || !initialPoints.length) return;

    const pos = getMousePosition(e);
    if (!pos) return;

    const newPoints = [...points];
    const draggedStep = points[draggingIndex].step;
    const valueDelta = pos.value - initialPoints[draggingIndex].value;

    // Update all points based on their distance from the dragged point
    newPoints.forEach((point, i) => {
      if (i !== draggingIndex) {
        const influence = calculateInfluence(draggedStep, point.step, steps);
        point.value = initialPoints[i].value + (valueDelta * influence);
        point.value = Math.max(minValue, Math.min(maxValue, point.value));
      }
    });

    // Update the dragged point
    newPoints[draggingIndex].value = pos.value;

    onChange(newPoints);
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
    setInitialPoints([]);
  };

  return (
    <Card className="p-4">
      <div className="font-medium mb-2">{label}</div>
      <canvas
        ref={canvasRef}
        width={300}
        height={200}
        className="border rounded-lg cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </Card>
  );
}