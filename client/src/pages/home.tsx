import React, { useState, useCallback, useEffect } from 'react';
import { ColorInput } from '@/components/ColorInput';
import { CurveEditor } from '@/components/CurveEditor';
import { ColorRamp } from '@/components/ColorRamp';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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

interface ColorTokenProps {
  color: string;
  name: string;
  slot: string;
}

const ColorToken: React.FC<ColorTokenProps> = ({ color, name, slot }) => (
  <div className="flex items-center gap-3 mb-2">
    <div 
      className="w-6 h-6 rounded border border-border"
      style={{ backgroundColor: color }}
    />
    <span className="font-mono text-sm">{name} = {slot}</span>
  </div>
);

export default function Home() {
  const [baseColor, setBaseColor] = useState('#6366f1');
  const [steps, setSteps] = useState(12);
  const [vibrance, setVibrance] = useState(0.5);
  const [hueTorsion, setHueTorsion] = useState(0.5);
  const [ramp, setRamp] = useState<ColorStop[]>(() => generateRamp(baseColor, steps, vibrance, hueTorsion));
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
    const baseRamp = generateRamp(baseColor, steps, vibrance, hueTorsion);

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
  }, [baseColor, steps, vibrance, hueTorsion, lightnessPoints, chromaPoints, huePoints]);

  useEffect(() => {
    updateRamp();
  }, [lightnessPoints, chromaPoints, huePoints, vibrance, hueTorsion, updateRamp]);

  const handleColorChange = (newColor: string) => {
    setBaseColor(newColor);
  };

  const handleGenerateRamp = () => {
    const newRamp = generateRamp(baseColor, steps, vibrance, hueTorsion);
    setRamp(newRamp);

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
      const newLightnessPoints = interpolatePoints(lightnessPoints, newSteps);
      const newChromaPoints = interpolatePoints(chromaPoints, newSteps);
      const newHuePoints = interpolatePoints(huePoints, newSteps);

      setSteps(newSteps);
      setLightnessPoints(newLightnessPoints);
      setChromaPoints(newChromaPoints);
      setHuePoints(newHuePoints);

      const baseRamp = generateRamp(baseColor, newSteps, vibrance, hueTorsion);
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
    const newVibrance = value[0];
    setVibrance(newVibrance);

    const newRamp = generateRamp(baseColor, steps, newVibrance, hueTorsion);

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

  const handleHueTorsionChange = (value: number[]) => {
    const newValue = value[0];
    setHueTorsion(newValue);

    const newRamp = generateRamp(baseColor, steps, vibrance, newValue);

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

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Color Ramp Generator</h1>

      <Tabs defaultValue="primitive" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="primitive">Primitive</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>

        <TabsContent value="primitive">
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
              <Label htmlFor="vibrance" className="mb-8">Vibrance</Label>
              <div className="flex items-center gap-4 mt-8">
                <div className="w-16 text-right">
                  <span className="text-sm text-muted-foreground">Pastel</span>
                </div>
                <div className="relative flex-1">
                  <div className="absolute -top-8 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                  <Slider
                    id="vibrance"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[vibrance]}
                    onValueChange={handleVibranceChange}
                  />
                </div>
                <div className="w-16">
                  <span className="text-sm text-muted-foreground">Vibrant</span>
                </div>
              </div>
            </div>

            <div className="w-full">
              <Label htmlFor="hueTorsion" className="mb-8">Hue Torsion</Label>
              <div className="flex items-center gap-4 mt-8">
                <div className="w-16 text-right">
                  <span className="text-sm text-muted-foreground">Cool</span>
                </div>
                <div className="relative flex-1">
                  <div className="absolute -top-8 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                  <Slider
                    id="hueTorsion"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[hueTorsion]}
                    onValueChange={handleHueTorsionChange}
                  />
                </div>
                <div className="w-16">
                  <span className="text-sm text-muted-foreground">Warm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ColorRamp colors={ramp} />

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
          </div>
        </TabsContent>

        <TabsContent value="theme" className="flex gap-8">
          <div className="w-64">
            <h3 className="font-medium mb-4">Background</h3>
            <ColorToken color={ramp[6]?.hex} name="brandBackgroundPrimary" slot="500" />
            <ColorToken color={ramp[1]?.hex} name="brandBackgroundSecondary" slot="100" />
            <ColorToken color={ramp[0]?.hex} name="brandBackgroundDisabled" slot="50" />

            <h3 className="font-medium mb-4 mt-6">Foreground</h3>
            <ColorToken color={ramp[7]?.hex} name="brandContentPrimary" slot="700" />
            <ColorToken color="#FFFFFF" name="brandContentOnPrimary" slot="950" />
            <ColorToken color={ramp[8]?.hex} name="brandContentOnSecondary" slot="800" />
            <ColorToken color={ramp[3]?.hex} name="brandContentDisabled" slot="300" />

            <h3 className="font-medium mb-4 mt-6">Border</h3>
            <ColorToken color={ramp[6]?.hex} name="brandBorderAccessible" slot="600" />
            <ColorToken color={ramp[2]?.hex} name="brandBorderSubtle" slot="200" />
          </div>

          <div className="flex-1">
            <div className="relative mx-auto" style={{ width: '390px' }}>
              <div 
                className="absolute inset-0 rounded-[48px]"
                style={{ 
                  border: '6px solid rgba(0, 0, 0, 0.4)',
                  height: '844px',
                }}
              >
                <div className="w-full h-full rounded-[42px] overflow-hidden bg-background">
                  <div className="p-4">
                    <Card className="mb-4 p-4" style={{ backgroundColor: ramp[6]?.hex }}>
                      <h4 style={{ color: '#FFFFFF' }}>Primary Background</h4>
                    </Card>

                    <Card className="mb-4 p-4" style={{ backgroundColor: ramp[1]?.hex }}>
                      <h4 style={{ color: ramp[8]?.hex }}>Secondary Background</h4>
                    </Card>

                    <div className="rounded-lg p-4 mb-4" style={{ border: `1px solid ${ramp[6]?.hex}` }}>
                      <p style={{ color: ramp[7]?.hex }}>Content with accessible border</p>
                    </div>

                    <div className="rounded-lg p-4" style={{ border: `1px solid ${ramp[2]?.hex}` }}>
                      <p style={{ color: ramp[3]?.hex }}>Disabled content with subtle border</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}