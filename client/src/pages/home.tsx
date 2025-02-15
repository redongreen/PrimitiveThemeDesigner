import React, { useState, useCallback, useEffect } from 'react';
import { ColorInput } from '@/components/ColorInput';
import { CurveEditor } from '@/components/CurveEditor';
import { ColorRamp } from '@/components/ColorRamp';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  generateRamp,
  oklchToHex,
  calculateRampVibrance,
  type ColorStop
} from '@/lib/color';

interface Point {
  step: number;
  value: number;
}

export default function Home() {
  const [baseColor, setBaseColor] = useState('#6366f1');
  const [steps, setSteps] = useState(12);
  const [vibrance, setVibrance] = useState(0.5);
  const [ramp, setRamp] = useState<ColorStop[]>(() => {
    const initialRamp = generateRamp(baseColor, steps, vibrance);
    const initialVibrance = calculateRampVibrance(initialRamp);
    setVibrance(initialVibrance);
    return initialRamp;
  });

  // Initialize points for each curve with default values
  const [lightnessPoints, setLightnessPoints] = useState<Point[]>(() =>
    Array.from({ length: steps }, (_, i) => ({
      step: i,
      value: ramp[i].oklch.l * 100
    }))
  );

  const [chromaPoints, setChromaPoints] = useState<Point[]>(() =>
    Array.from({ length: steps }, (_, i) => ({
      step: i,
      value: ramp[i].oklch.c * 100
    }))
  );

  const [huePoints, setHuePoints] = useState<Point[]>(() =>
    Array.from({ length: steps }, (_, i) => ({
      step: i,
      value: ramp[i].oklch.h
    }))
  );

  // Helper function to interpolate values for new steps
  const interpolatePoints = (currentPoints: Point[], newStepCount: number): Point[] => {
    if (currentPoints.length === 0) return [];
    if (currentPoints.length === 1) {
      return Array.from({ length: newStepCount }, (_, i) => ({
        step: i,
        value: currentPoints[0].value
      }));
    }

    const sorted = [...currentPoints].sort((a, b) => a.step - b.step);
    return Array.from({ length: newStepCount }, (_, i) => {
      const position = i / (newStepCount - 1) * (sorted.length - 1);
      const index = Math.floor(position);
      const fraction = position - index;

      if (index >= sorted.length - 1) {
        return { step: i, value: sorted[sorted.length - 1].value };
      }

      const start = sorted[index].value;
      const end = sorted[index + 1].value;
      const interpolatedValue = start + (end - start) * fraction;

      return { step: i, value: interpolatedValue };
    });
  };

  const updateRamp = useCallback(() => {
    const baseRamp = generateRamp(baseColor, steps, vibrance);

    // Apply curve adjustments
    const newRamp = baseRamp.map((color, i) => {
      const l = lightnessPoints.find(p => p.step === i)?.value! / 100;
      const c = chromaPoints.find(p => p.step === i)?.value! / 100;
      const h = huePoints.find(p => p.step === i)?.value!;

      return {
        oklch: { l, c, h },
        hex: oklchToHex({ l, c, h })
      };
    });

    setRamp(newRamp);
  }, [baseColor, steps, vibrance, lightnessPoints, chromaPoints, huePoints]);

  // Update ramp when curve points or vibrance change
  useEffect(() => {
    updateRamp();
  }, [lightnessPoints, chromaPoints, huePoints, vibrance, updateRamp]);

  const handleColorChange = (newColor: string) => {
    setBaseColor(newColor);
  };

  const handleGenerateRamp = () => {
    const newRamp = generateRamp(baseColor, steps, vibrance);
    setRamp(newRamp);

    // Update curve points with new values
    setLightnessPoints(newRamp.map((color, i) => ({
      step: i,
      value: color.oklch.l * 100
    })));

    setChromaPoints(newRamp.map((color, i) => ({
      step: i,
      value: color.oklch.c * 100
    })));

    setHuePoints(newRamp.map((color, i) => ({
      step: i,
      value: color.oklch.h
    })));
  };

  const handleStepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSteps = parseInt(e.target.value) || 12;
    if (newSteps >= 2 && newSteps <= 20) {
      // Interpolate existing points for the new step count
      const newLightnessPoints = interpolatePoints(lightnessPoints, newSteps);
      const newChromaPoints = interpolatePoints(chromaPoints, newSteps);
      const newHuePoints = interpolatePoints(huePoints, newSteps);

      setSteps(newSteps);
      setLightnessPoints(newLightnessPoints);
      setChromaPoints(newChromaPoints);
      setHuePoints(newHuePoints);

      // Update the ramp with interpolated values
      const baseRamp = generateRamp(baseColor, newSteps, vibrance);
      const newRamp = baseRamp.map((color, i) => {
        const l = newLightnessPoints[i].value / 100;
        const c = newChromaPoints[i].value / 100;
        const h = newHuePoints[i].value;

        return {
          oklch: { l, c, h },
          hex: oklchToHex({ l, c, h })
        };
      });

      setRamp(newRamp);
    }
  };

  const handleVibranceChange = (value: number[]) => {
    setVibrance(value[0]);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Color Ramp Generator</h1>

      <div className="flex flex-col gap-6 mb-8">
        <div className="flex gap-4">
          <ColorInput 
            value={baseColor} 
            onChange={handleColorChange}
            onGenerate={handleGenerateRamp}
          />

          <div>
            <Label htmlFor="steps">Steps</Label>
            <Input
              id="steps"
              type="number"
              min="2"
              max="20"
              value={steps}
              onChange={handleStepsChange}
              className="w-24 mt-1"
            />
          </div>
        </div>

        <div className="w-full">
          <Label htmlFor="vibrance">Vibrance</Label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Pastel</span>
            <Slider
              id="vibrance"
              min={0}
              max={1}
              step={0.01}
              value={[vibrance]}
              onValueChange={handleVibranceChange}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">Vibrant</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CurveEditor
            points={lightnessPoints}
            steps={steps}
            minValue={15}
            maxValue={95}
            onChange={setLightnessPoints}
            label="Lightness Curve"
          />
          <CurveEditor
            points={chromaPoints}
            steps={steps}
            minValue={0}
            maxValue={100}
            onChange={setChromaPoints}
            label="Chroma Curve"
          />
          <CurveEditor
            points={huePoints}
            steps={steps}
            minValue={0}
            maxValue={360}
            onChange={setHuePoints}
            label="Hue Curve"
          />
        </div>

        <ColorRamp colors={ramp} />
      </div>
    </div>
  );
}