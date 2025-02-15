import React, { useState, useCallback, useEffect } from 'react';
import { ColorInput } from '@/components/ColorInput';
import { CurveEditor } from '@/components/CurveEditor';
import { ColorRamp } from '@/components/ColorRamp';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  generateRamp,
  type ColorStop
} from '@/lib/color';

interface Point {
  step: number;
  value: number;
}

export default function Home() {
  const [baseColor, setBaseColor] = useState('#6366f1');
  const [steps, setSteps] = useState(12);
  const [ramp, setRamp] = useState<ColorStop[]>(() => 
    generateRamp(baseColor, steps)
  );

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

  const updateRamp = useCallback(() => {
    const baseRamp = generateRamp(baseColor, steps);

    // Apply curve adjustments
    const newRamp = baseRamp.map((color, i) => ({
      ...color,
      oklch: {
        l: lightnessPoints.find(p => p.step === i)?.value! / 100,
        c: chromaPoints.find(p => p.step === i)?.value! / 100,
        h: huePoints.find(p => p.step === i)?.value!
      }
    }));

    setRamp(newRamp);
  }, [baseColor, steps, lightnessPoints, chromaPoints, huePoints]);

  // Update ramp when curve points change
  useEffect(() => {
    updateRamp();
  }, [lightnessPoints, chromaPoints, huePoints, updateRamp]);

  const handleColorChange = (newColor: string) => {
    setBaseColor(newColor);
  };

  const handleGenerateRamp = () => {
    console.log('Generating ramp with color:', baseColor);
    const newRamp = generateRamp(baseColor, steps);
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
      setSteps(newSteps);
      handleGenerateRamp(); // Regenerate ramp with new step count
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Color Ramp Generator</h1>

      <div className="flex gap-4 mb-8">
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