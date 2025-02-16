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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 200 });

  const PADDING = 20;
  const CONTROL_POINT_RADIUS = 6;
  const HOVER_RADIUS = 12;
  const GRID_COLOR = '#e5e7eb';
  const CURVE_COLOR = '#000000';
  const POINT_COLOR = '#000000';
  const ACTIVE_POINT_COLOR = '#0066ff';
  const HOVER_POINT_COLOR = '#3388ff';

  // Canvas setup and resizing
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

  // Coordinate conversion utilities
  const toCanvasCoords = (point: Point) => ({
    x: PADDING + ((point.step / (steps - 1)) * (canvasSize.width - 2 * PADDING)),
    y: PADDING + ((maxValue - point.value) / (maxValue - minValue)) * (canvasSize.height - 2 * PADDING)
  });

  const fromCanvasCoords = (x: number, y: number): Point => ({
    step: Math.max(0, Math.min(steps - 1, 
      Math.round(((x - PADDING) / (canvasSize.width - 2 * PADDING)) * (steps - 1))
    )),
    value: Math.max(minValue, Math.min(maxValue,
      maxValue - (((y - PADDING) / (canvasSize.height - 2 * PADDING)) * (maxValue - minValue))
    ))
  });

  // Drawing functions
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = GRID_COLOR;
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
  };

  const drawCurve = (ctx: CanvasRenderingContext2D, sortedPoints: Point[]) => {
    const interpolated = interpolatePointsSpline(sortedPoints, steps * 4, 0.5);

    ctx.strokeStyle = CURVE_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();

    interpolated.forEach((point, i) => {
      const { x, y } = toCanvasCoords(point);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  };

  const drawControlPoints = (ctx: CanvasRenderingContext2D, sortedPoints: Point[]) => {
    sortedPoints.forEach((point, index) => {
      const { x, y } = toCanvasCoords(point);

      // Draw hover area
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.arc(x, y, HOVER_RADIUS, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw point
      ctx.fillStyle = index === draggingIndex ? ACTIVE_POINT_COLOR :
                     index === hoverIndex ? HOVER_POINT_COLOR :
                     POINT_COLOR;
      ctx.beginPath();
      ctx.arc(x, y, CONTROL_POINT_RADIUS, 0, 2 * Math.PI);
      ctx.fill();

      // Draw white border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  // Main render function
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Sort points
    const sortedPoints = [...points].sort((a, b) => a.step - b.step);

    // Draw components
    drawGrid(ctx);
    drawCurve(ctx, sortedPoints);
    drawControlPoints(ctx, sortedPoints);

    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < steps; i++) {
      const x = PADDING + ((canvasSize.width - 2 * PADDING) * i) / (steps - 1);
      ctx.fillText(`${i + 1}`, x, canvasSize.height - 5);
    }
  }, [points, steps, minValue, maxValue, canvasSize, draggingIndex, hoverIndex]);

  // Event handling
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

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getEventPosition(e);
    if (!pos) return;

    const { x, y } = pos;

    // Find closest point
    let closestIndex = -1;
    let closestDistance = Infinity;

    points.forEach((point, index) => {
      const coords = toCanvasCoords(point);
      const distance = Math.sqrt(Math.pow(coords.x - x, 2) + Math.pow(coords.y - y, 2));
      if (distance < HOVER_RADIUS && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== -1) {
      setDraggingIndex(closestIndex);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getEventPosition(e);
    if (!pos) return;

    const { x, y } = pos;

    // Update hover state
    let newHoverIndex = null;
    points.forEach((point, index) => {
      const coords = toCanvasCoords(point);
      const distance = Math.sqrt(Math.pow(coords.x - x, 2) + Math.pow(coords.y - y, 2));
      if (distance < HOVER_RADIUS) {
        newHoverIndex = index;
      }
    });
    setHoverIndex(newHoverIndex);

    // Handle dragging
    if (draggingIndex !== null) {
      const newPoint = fromCanvasCoords(x, y);
      const newPoints = [...points];
      newPoints[draggingIndex] = newPoint;
      onChange(newPoints);
    }
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