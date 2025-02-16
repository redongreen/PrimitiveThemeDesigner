import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { interpolatePointsSpline } from '@/lib/color';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 200 });

  const PADDING = 20;
  const POINT_RADIUS = 6;
  const POINT_HOVER_RADIUS = 12;

  const updateCanvasSize = () => {
    if (containerRef.current && canvasRef.current) {
      const container = containerRef.current;
      const newWidth = container.clientWidth;
      const newHeight = Math.min(container.clientWidth * 0.66, 300);

      setCanvasSize({ width: newWidth, height: newHeight });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
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
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const toCanvasCoords = (point: Point) => ({
    x: PADDING + ((point.step / (steps - 1)) * (canvasSize.width - 2 * PADDING)),
    y: PADDING + ((maxValue - point.value) / (maxValue - minValue)) * (canvasSize.height - 2 * PADDING)
  });

  const fromCanvasCoords = (x: number, y: number): Point => {
    const step = Math.round(((x - PADDING) / (canvasSize.width - 2 * PADDING)) * (steps - 1));
    const value = maxValue - (((y - PADDING) / (canvasSize.height - 2 * PADDING)) * (maxValue - minValue));
    return {
      step: Math.max(0, Math.min(steps - 1, step)),
      value: Math.max(minValue, Math.min(maxValue, value))
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i < steps; i++) {
      const x = PADDING + ((canvasSize.width - 2 * PADDING) * i) / (steps - 1);
      ctx.beginPath();
      ctx.moveTo(x, PADDING);
      ctx.lineTo(x, canvasSize.height - PADDING);
      ctx.stroke();
    }

    // Horizontal grid lines
    const numLines = 5;
    for (let i = 0; i <= numLines; i++) {
      const y = PADDING + ((canvasSize.height - 2 * PADDING) * i) / numLines;
      ctx.beginPath();
      ctx.moveTo(PADDING, y);
      ctx.lineTo(canvasSize.width - PADDING, y);
      ctx.stroke();
    }

    // Sort points for proper interpolation
    const sortedPoints = [...points].sort((a, b) => a.step - b.step);

    // Generate interpolated points for smooth curve
    const interpolatedPoints = interpolatePointsSpline(sortedPoints, steps * 4);

    // Draw curve
    if (interpolatedPoints.length > 1) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const start = toCanvasCoords(interpolatedPoints[0]);
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < interpolatedPoints.length; i++) {
        const coords = toCanvasCoords(interpolatedPoints[i]);
        ctx.lineTo(coords.x, coords.y);
      }
      ctx.stroke();
    }

    // Draw control points
    sortedPoints.forEach((point, index) => {
      const { x, y } = toCanvasCoords(point);

      // Draw point highlight/hit area
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.arc(x, y, POINT_HOVER_RADIUS, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw point
      ctx.fillStyle = index === draggingIndex ? '#0066ff' : '#000';
      ctx.beginPath();
      ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI);
      ctx.fill();

      // Draw white border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    // Draw step numbers
    for (let i = 0; i < steps; i++) {
      const x = PADDING + ((canvasSize.width - 2 * PADDING) * i) / (steps - 1);
      ctx.fillText(`${i + 1}`, x, canvasSize.height - 5);
    }
  }, [points, steps, minValue, maxValue, canvasSize, draggingIndex]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getEventPosition(e);
    if (!pos) return;

    const { x, y } = pos;
    const clickPoint = fromCanvasCoords(x, y);

    // Find the closest point
    let closestIndex = -1;
    let closestDistance = Infinity;

    points.forEach((point, index) => {
      const coords = toCanvasCoords(point);
      const distance = Math.sqrt(Math.pow(coords.x - x, 2) + Math.pow(coords.y - y, 2));
      if (distance < POINT_HOVER_RADIUS && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== -1) {
      setDraggingIndex(closestIndex);
    }
  };

  const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingIndex === null) return;

    const pos = getEventPosition(e);
    if (!pos) return;

    const newPoint = fromCanvasCoords(pos.x, pos.y);
    const newPoints = [...points];
    newPoints[draggingIndex] = newPoint;
    onChange(newPoints);
  };

  const handleEnd = () => {
    setDraggingIndex(null);
  };

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