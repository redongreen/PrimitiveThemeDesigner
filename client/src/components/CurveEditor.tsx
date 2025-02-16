import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { getSplineCurve, calculateInfluence, Vector2D } from '@/lib/spline';

export interface Point {
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

export function CurveEditor({ 
  label, 
  points, 
  steps, 
  minValue, 
  maxValue, 
  onChange 
}: CurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [initialPoints, setInitialPoints] = useState<Point[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 200 });

  const PADDING = 20;
  const POINT_RADIUS = 4;
  const POINT_HOVER_RADIUS = 10;
  const CURVE_SEGMENTS = 50;

  // Convert between canvas and value coordinates
  const toCanvasCoords = useCallback((point: Point): Vector2D => ({
    x: PADDING + ((point.step / (steps - 1)) * (canvasSize.width - 2 * PADDING)),
    y: PADDING + ((maxValue - point.value) / (maxValue - minValue)) * (canvasSize.height - 2 * PADDING)
  }), [steps, maxValue, minValue, canvasSize]);

  const fromCanvasCoords = useCallback((x: number, y: number): Point => ({
    step: Math.round(((x - PADDING) / (canvasSize.width - 2 * PADDING)) * (steps - 1)),
    value: Math.max(minValue, Math.min(maxValue, 
      maxValue - (((y - PADDING) / (canvasSize.height - 2 * PADDING)) * (maxValue - minValue))
    ))
  }), [steps, maxValue, minValue, canvasSize]);

  // Handle canvas resize
  const updateCanvasSize = useCallback(() => {
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
  }, []);

  // Draw the curve editor
  const drawCurve = useCallback(() => {
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

    // Draw spline curve
    if (points.length >= 2) {
      const curvePoints = getSplineCurve(points, CURVE_SEGMENTS);

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const start = toCanvasCoords(points[0]);
      ctx.moveTo(start.x, start.y);

      curvePoints.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });

      ctx.stroke();
    }

    // Draw control points
    points.forEach((point) => {
      const { x, y } = toCanvasCoords(point);

      // Draw hover area
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.arc(x, y, POINT_HOVER_RADIUS, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw point
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < steps; i++) {
      const x = PADDING + ((canvasSize.width - 2 * PADDING) * i) / (steps - 1);
      ctx.fillText(`${i + 1}`, x, canvasSize.height - 5);
    }
  }, [points, steps, canvasSize, toCanvasCoords]);

  // Event handlers
  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const mousePos = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    // Find closest point
    let closestIndex = -1;
    let closestDistance = Infinity;

    points.forEach((point, index) => {
      const coords = toCanvasCoords(point);
      const distance = Math.sqrt(
        Math.pow(coords.x - mousePos.x, 2) + 
        Math.pow(coords.y - mousePos.y, 2)
      );

      if (distance < POINT_HOVER_RADIUS && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== -1) {
      setDraggingIndex(closestIndex);
      setInitialPoints([...points]);
    }
  }, [points, toCanvasCoords]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingIndex === null || !initialPoints.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newPos = fromCanvasCoords(
      Math.max(PADDING, Math.min(canvasSize.width - PADDING, x)),
      Math.max(PADDING, Math.min(canvasSize.height - PADDING, y))
    );

    const newPoints = [...points];
    const valueDelta = newPos.value - initialPoints[draggingIndex].value;

    // Update points with local influence
    newPoints.forEach((point, i) => {
      if (i !== draggingIndex) {
        const influence = calculateInfluence(draggingIndex, i, points.length);
        point.value = initialPoints[i].value + (valueDelta * influence);
        point.value = Math.max(minValue, Math.min(maxValue, point.value));
      }
    });

    newPoints[draggingIndex].value = newPos.value;
    onChange(newPoints);
  }, [draggingIndex, initialPoints, points, fromCanvasCoords, canvasSize, onChange, maxValue, minValue]);

  const handleEnd = useCallback(() => {
    setDraggingIndex(null);
    setInitialPoints([]);
  }, []);

  // Setup effects
  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  useEffect(() => {
    drawCurve();
  }, [drawCurve]);

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