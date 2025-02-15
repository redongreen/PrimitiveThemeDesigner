import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

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
    if (points.length > 1) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x * canvas.width, canvas.height - points[0].y * canvas.height);

      // Draw a smooth curve through all points
      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currentPoint = points[i];

        // Calculate control points for smoother curve
        const controlPoint1 = {
          x: prevPoint.x + (currentPoint.x - prevPoint.x) / 2,
          y: prevPoint.y
        };

        const controlPoint2 = {
          x: prevPoint.x + (currentPoint.x - prevPoint.x) / 2,
          y: currentPoint.y
        };

        ctx.bezierCurveTo(
          controlPoint1.x * canvas.width,
          canvas.height - controlPoint1.y * canvas.height,
          controlPoint2.x * canvas.width,
          canvas.height - controlPoint2.y * canvas.height,
          currentPoint.x * canvas.width,
          canvas.height - currentPoint.y * canvas.height
        );
      }
      ctx.stroke();
    }

    // Draw points
    points.forEach((point, index) => {
      ctx.fillStyle = index === 0 || index === points.length - 1 ? '#666' : '#000';
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

    // Check if clicked near existing point
    const index = points.findIndex(
      (p) => Math.abs(p.x - pos.x) < 0.05 && Math.abs(p.y - pos.y) < 0.05
    );

    if (index !== -1) {
      setDraggingIndex(index);
    } else if (e.altKey) {
      // Add new point when Alt key is pressed
      const newPoints = [...points, pos].sort((a, b) => a.x - b.x);
      onChange(newPoints);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingIndex === null) return;

    const newPos = getMousePosition(e);
    const newPoints = [...points];

    // Only allow horizontal movement for end points
    if (draggingIndex === 0 || draggingIndex === points.length - 1) {
      newPoints[draggingIndex] = {
        x: points[draggingIndex].x,
        y: newPos.y
      };
    } else {
      newPoints[draggingIndex] = newPos;
    }

    // Sort points by x coordinate to maintain order
    onChange(newPoints.sort((a, b) => a.x - b.x));
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  const handleAddPoint = () => {
    // Add a new point in the middle
    const midX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const midY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const newPoints = [...points, { x: midX, y: midY }].sort((a, b) => a.x - b.x);
    onChange(newPoints);
  };

  const handleRemovePoint = () => {
    // Remove the last added point, keeping at least the end points
    if (points.length > 2) {
      onChange(points.slice(0, -1));
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium">{label}</div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddPoint}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Point
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemovePoint}
            disabled={points.length <= 2}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" /> Remove Point
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mb-2">
        Hold Alt and click to add points
      </div>
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