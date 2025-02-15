import React, { useState, useCallback } from 'react';
import { ColorInput } from '@/components/ColorInput';
import { CurveEditor } from '@/components/CurveEditor';
import { ColorRamp } from '@/components/ColorRamp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  generateRamp,
  adjustRampWithCurve,
  oklchToHex,
  type ColorStop
} from '@/lib/color';

const defaultCurvePoints = [
  { x: 0, y: 0 },
  { x: 0.5, y: 0.5 },
  { x: 1, y: 1 }
];

export default function Home() {
  const [baseColor, setBaseColor] = useState('#6366f1');
  const [lastValidColor, setLastValidColor] = useState('#6366f1');
  const [steps, setSteps] = useState(12);
  const [ramp, setRamp] = useState<ColorStop[]>(() => 
    generateRamp(lastValidColor, steps)
  );

  const [lightnessCurve, setLightnessCurve] = useState([...defaultCurvePoints]);
  const [chromaCurve, setChromaCurve] = useState([...defaultCurvePoints]);
  const [hueCurve, setHueCurve] = useState([...defaultCurvePoints]);

  const updateRamp = useCallback(() => {
    let newRamp = generateRamp(lastValidColor, steps);
    newRamp = adjustRampWithCurve(newRamp, lightnessCurve, 'l');
    newRamp = adjustRampWithCurve(newRamp, chromaCurve, 'c');
    newRamp = adjustRampWithCurve(newRamp, hueCurve, 'h');
    setRamp(newRamp);
  }, [lastValidColor, steps, lightnessCurve, chromaCurve, hueCurve]);

  const handleColorChange = (newColor: string) => {
    setBaseColor(newColor);
    // Only update lastValidColor and regenerate ramp if we have a complete valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      console.log('Updating ramp with new color:', newColor);
      setLastValidColor(newColor);
      updateRamp();
    }
  };

  const handleStepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSteps = parseInt(e.target.value) || 12;
    if (newSteps >= 2 && newSteps <= 20) {
      setSteps(newSteps);
      updateRamp();
    }
  };

  const handleAdjustColor = (index: number, property: 'l' | 'c' | 'h', value: number) => {
    const newRamp = [...ramp];
    newRamp[index] = {
      ...newRamp[index],
      oklch: {
        ...newRamp[index].oklch,
        [property]: value
      }
    };
    newRamp[index].hex = oklchToHex(newRamp[index].oklch);
    setRamp(newRamp);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Color Ramp Generator</h1>

      <div className="flex gap-4 mb-8">
        <ColorInput value={baseColor} onChange={handleColorChange} />

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

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individual">Individual Adjustment</TabsTrigger>
          <TabsTrigger value="curve">Curve Adjustment</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <ColorRamp colors={ramp} onAdjustColor={handleAdjustColor} />
        </TabsContent>

        <TabsContent value="curve" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CurveEditor
              points={lightnessCurve}
              onChange={(points) => {
                setLightnessCurve(points);
                updateRamp();
              }}
              label="Lightness Curve"
            />
            <CurveEditor
              points={chromaCurve}
              onChange={(points) => {
                setChromaCurve(points);
                updateRamp();
              }}
              label="Chroma Curve"
            />
            <CurveEditor
              points={hueCurve}
              onChange={(points) => {
                setHueCurve(points);
                updateRamp();
              }}
              label="Hue Curve"
            />
          </div>

          <ColorRamp colors={ramp} onAdjustColor={handleAdjustColor} />
        </TabsContent>
      </Tabs>
    </div>
  );
}