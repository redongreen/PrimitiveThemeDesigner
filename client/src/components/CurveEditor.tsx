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
  const sigma = maxDistance / 3;
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

export function CurveEditor({ label, points, steps, minValue, maxValue, onChange }: CurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [initialPoints, setInitialPoints] = useState<Point[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 200 });

  const PADDING = 20;

  const updateCanvasSize = () => {
    if (containerRef.current && canvasRef.current) {
      const container = containerRef.current;
      const newWidth = container.clientWidth;
      const newHeight = Math.min(container.clientWidth * 0.66, 300); // Maintain aspect ratio with max height

      setCanvasSize({ width: newWidth, height: newHeight });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set the canvas size
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Update the scale factor for high DPI displays
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

  const fromCanvasCoords = (x: number, y: number): Point => ({
    step: Math.round(((x - PADDING) / (canvasSize.width - 2 * PADDING)) * (steps - 1)),
    value: Math.max(minValue, Math.min(maxValue, 
      maxValue - (((y - PADDING) / (canvasSize.height - 2 * PADDING)) * (maxValue - minValue))
    ))
  });

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

    // Draw curve
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sortedPoints = [...points].sort((a, b) => a.step - b.step);
    if (sortedPoints.length > 0) {
      const start = toCanvasCoords(sortedPoints[0]);
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < sortedPoints.length; i++) {
        const prev = toCanvasCoords(sortedPoints[i - 1]);
        const curr = toCanvasCoords(sortedPoints[i]);
        const cpX = (prev.x + curr.x) / 2;
        ctx.quadraticCurveTo(cpX, prev.y, curr.x, curr.y);
      }
      ctx.stroke();
    }

    // Draw points
    sortedPoints.forEach((point) => {
      const { x, y } = toCanvasCoords(point);
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // Draw labels
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    for (let i = 0; i < steps; i++) {
      const x = PADDING + ((canvasSize.width - 2 * PADDING) * i) / (steps - 1);
      ctx.fillText(`${i + 1}`, x, canvasSize.height - 5);
    }
  }, [points, steps, minValue, maxValue, canvasSize]);

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

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const clampedX = Math.max(PADDING, Math.min(canvasSize.width - PADDING, x));
    const clampedY = Math.max(PADDING, Math.min(canvasSize.height - PADDING, y));

    return fromCanvasCoords(clampedX, clampedY);
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    const pos = getEventPosition(e);
    if (!pos) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const mousePos = { 
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    let closestIndex = -1;
    let closestDistance = Infinity;

    points.forEach((point, index) => {
      const coords = toCanvasCoords(point);
      const distance = Math.sqrt(Math.pow(coords.x - mousePos.x, 2) + Math.pow(coords.y - mousePos.y, 2));
      if (distance < 15 && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== -1) {
      setDraggingIndex(closestIndex);
      setInitialPoints([...points]);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggingIndex === null || !initialPoints.length) return;

    const pos = getEventPosition(e);
    if (!pos) return;

    const newPoints = [...points];
    const draggedStep = points[draggingIndex].step;
    const valueDelta = pos.value - initialPoints[draggingIndex].value;

    newPoints.forEach((point, i) => {
      if (i !== draggingIndex) {
        const influence = calculateInfluence(draggedStep, point.step, steps);
        point.value = initialPoints[i].value + (valueDelta * influence);
        point.value = Math.max(minValue, Math.min(maxValue, point.value));
      }
    });

    newPoints[draggingIndex].value = pos.value;
    onChange(newPoints);
  };

  const handleEnd = () => {
    setDraggingIndex(null);
    setInitialPoints([]);
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