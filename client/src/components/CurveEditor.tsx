import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Point {
  x: number;
  y: number;
}

interface CurveEditorProps {
  points: Point[];
  onChange: (points: Point[]) => void;
  label: string;
}

export function CurveEditor({ points, onChange, label }: CurveEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width * i) / 10;
      const y = (canvas.height * i) / 10;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw curve
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - points[0].y * canvas.height);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(
        points[i].x * canvas.width,
        canvas.height - points[i].y * canvas.height
      );
    }
    ctx.stroke();

    // Draw points
    points.forEach((point) => {
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(
        point.x * canvas.width,
        canvas.height - point.y * canvas.height,
        4,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }, [points]);

  const getMousePosition = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = 1 - (e.clientY - rect.top) / canvas.height;
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePosition(e);
    const index = points.findIndex(
      (p) => Math.abs(p.x - pos.x) < 0.05 && Math.abs(p.y - pos.y) < 0.05
    );
    if (index !== -1) {
      setDraggingIndex(index);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIndex === null) return;
    
    const newPos = getMousePosition(e);
    const newPoints = [...points];
    newPoints[draggingIndex] = {
      x: draggingIndex === 0 || draggingIndex === points.length - 1 
        ? points[draggingIndex].x 
        : newPos.x,
      y: newPos.y
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
