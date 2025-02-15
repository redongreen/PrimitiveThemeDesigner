import React, { useState, useCallback, useEffect } from 'react';
import { ColorInput } from '@/components/ColorInput';
import { CurveEditor } from '@/components/CurveEditor';
import { ColorRamp } from '@/components/ColorRamp';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  generateRamp,
  oklchToHex,
  calculateRampVibrance,
  type ColorStop,
  getBestContrastColor,
  getContrastRatio
} from '@/lib/color';

interface Point {
  step: number;
  value: number;
}

interface ColorTokenProps {
  color: string;
  name: string;
  slot: string;
  contrastWith?: string;
}

const ColorToken: React.FC<ColorTokenProps> = ({ color, name, slot, contrastWith }) => {
  const contrastRatio = contrastWith ? getContrastRatio(color, contrastWith) : null;
  const displaySlot = slot === "auto" ? (color === "#000000" ? "Black" : "White") : slot;

  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-center gap-3">
        <div 
          className="w-6 h-6 rounded border border-border"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-sm flex-1">{name} = {displaySlot}</span>
        {contrastRatio && (
          <span className="text-xs text-muted-foreground">
            {contrastRatio.toFixed(2)}:1
          </span>
        )}
      </div>
      <span className="font-mono text-xs text-muted-foreground ml-9 mt-1">
        {color}
      </span>
    </div>
  );
};

interface ColorPairingProps {
  title: string;
  background: string;
  foreground: string;
  border?: string;
  subtitle?: string;
}

const ColorPairing: React.FC<ColorPairingProps> = ({ title, background, foreground, border, subtitle }) => {
  const contrastRatio = getContrastRatio(foreground, background);
  const isAccessible = contrastRatio >= 4.5;

  return (
    <div 
      className="rounded-lg p-4 mb-4"
      style={{ 
        backgroundColor: background,
        border: border ? `1px solid ${border}` : undefined
      }}
    >
      <p style={{ color: foreground }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: foreground }}>
          {subtitle}
        </p>
      )}
      <div className="text-xs mt-2" style={{ color: foreground }}>
        Contrast ratio: {contrastRatio.toFixed(2)}:1
        {!isAccessible && (
          <span className="text-red-500 ml-2">
            (Below WCAG AA)
          </span>
        )}
      </div>
    </div>
  );
};

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
          <div className="w-96">
            <h2 className="text-lg font-semibold mb-6">Semantic Tokens</h2>

            <h3 className="font-medium mb-4">Background</h3>
            <ColorToken 
              color={ramp[6]?.hex} 
              name="brandBackgroundPrimary" 
              slot="500"
              contrastWith="#000000"
            />
            <ColorToken 
              color={ramp[11]?.hex} 
              name="brandBackgroundSecondary" 
              slot="100" 
              contrastWith="#4B4B4B"
            />
            <ColorToken 
              color={ramp[11]?.hex} 
              name="brandBackgroundDisabled" 
              slot="50"
            />

            <h3 className="font-medium mb-4 mt-6">Foreground</h3>
            <ColorToken 
              color={ramp[4]?.hex} 
              name="brandContentPrimary" 
              slot="700"
              contrastWith="#FFFFFF"
            />
            <ColorToken 
              color={getBestContrastColor(ramp[6]?.hex)?.color} 
              name="brandContentOnPrimary" 
              slot="auto"
              contrastWith={ramp[6]?.hex}
            />
            <ColorToken 
              color={ramp[5]?.hex} 
              name="brandContentOnSecondary" 
              slot="800"
              contrastWith={ramp[11]?.hex}
            />
            <ColorToken 
              color={ramp[8]?.hex} 
              name="brandContentDisabled" 
              slot="300"
            />

            <h3 className="font-medium mb-4 mt-6">Border</h3>
            <ColorToken 
              color={ramp[6]?.hex} 
              name="brandBorderAccessible" 
              slot="600"
              contrastWith="#FFFFFF"
            />
            <ColorToken 
              color={ramp[10]?.hex} 
              name="brandBorderSubtle" 
              slot="200"
            />
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
                    <h4 className="text-sm font-medium mb-4">Accessible Pairings</h4>

                    <h5 className="text-xs text-muted-foreground mb-2">Primary</h5>
                    <ColorPairing
                      title="Primary Background with On Primary Content"
                      background={ramp[6]?.hex}
                      foreground={getBestContrastColor(ramp[6]?.hex)?.color}
                    />

                    <h5 className="text-xs text-muted-foreground mb-2 mt-6">Secondary</h5>
                    <ColorPairing
                      title="Secondary Background with On Secondary Content"
                      subtitle="brandBackgroundSecondary with brandContentOnSecondary"
                      background={ramp[11]?.hex}
                      foreground={ramp[5]?.hex}
                    />
                    <ColorPairing
                      title="Secondary Background with Black Text"
                      subtitle="brandBackgroundSecondary with #000000"
                      background={ramp[11]?.hex}
                      foreground="#000000"
                      border={ramp[10]?.hex}
                    />

                    <div className="mt-6">
                      <h5 className="text-xs text-muted-foreground mb-2">Primary on Neutral</h5>
                      <ColorPairing
                        title="Primary Content on Neutral Background"
                        subtitle="brandContentPrimary on #FFFFFF with brandBorderAccessible"
                        background="#FFFFFF"
                        foreground={ramp[4]?.hex}
                        border={ramp[6]?.hex}
                      />

                      {/* Progress bar */}
                      <div className="mt-4 w-full h-2 bg-white rounded-full overflow-hidden">
                        <div 
                          className="h-full w-full animate-progress"
                          style={{ 
                            background: `linear-gradient(90deg, ${ramp[6]?.hex} 0%, ${ramp[6]?.hex} 100%)`,
                            animation: 'progress 2s linear infinite'
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <h5 className="text-xs text-muted-foreground mb-2">Disabled</h5>
                      <ColorPairing
                        title="Disabled State Example"
                        background={ramp[11]?.hex} 
                        foreground={ramp[8]?.hex} 
                      />
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