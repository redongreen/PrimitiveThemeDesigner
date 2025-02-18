import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ColorInput } from "./ColorInput";       // adjust if needed
import { ColorRamp } from "./ColorRamp";         // adjust if needed
import { CurveEditor } from "./CurveEditor";     // adjust if needed

interface Point {
  step: number;
  value: number;
}

interface ColorStop {
  hex: string;
  oklch: { l: number; c: number; h: number };
}

interface PrimitiveEditorProps {
  // ramp data
  ramp: ColorStop[];
  baseColor: string;
  steps: number;
  vibrance: number;
  hueTorsion: number;
  contrast: number;

  // curve data
  lightnessPoints: Point[];
  chromaPoints: Point[];
  huePoints: Point[];

  // actions
  handleColorChange: (color: string) => void;
  handleGenerateRamp: () => void;
  handleStepsChange: (newSteps: number) => void;
  handleVibranceChange: (val: number) => void;
  handleHueTorsionChange: (val: number) => void;
  handleContrastChange: (val: number) => void;

  // curve drag handlers
  handleLightnessCurveChange: (newPoints: Point[]) => void;
  handleChromaCurveChange: (newPoints: Point[]) => void;
  handleHueCurveChange: (newPoints: Point[]) => void;
}

export const PrimitiveEditor: React.FC<PrimitiveEditorProps> = ({
  ramp,
  baseColor,
  steps,
  vibrance,
  hueTorsion,
  contrast,
  lightnessPoints,
  chromaPoints,
  huePoints,
  handleColorChange,
  handleGenerateRamp,
  handleStepsChange,
  handleVibranceChange,
  handleHueTorsionChange,
  handleContrastChange,
  handleLightnessCurveChange,
  handleChromaCurveChange,
  handleHueCurveChange,
}) => {
  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Row with color input and steps */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <ColorInput
            value={baseColor}
            onChange={handleColorChange}
            onGenerate={handleGenerateRamp}
            label="Source color"
          />
        </div>

        <div className="w-full sm:w-32">
          <Label htmlFor="steps">Steps</Label>
          <div className="mt-1 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={() => handleStepsChange(Math.max(4, steps - 1))}
              disabled={steps <= 4}
            >
              -
            </Button>
            <div className="w-12 text-center font-mono">{steps}</div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3"
              onClick={() => handleStepsChange(Math.min(20, steps + 1))}
              disabled={steps >= 20}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Render the color ramp */}
      <ColorRamp colors={ramp} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* LIGHTNESS Curve */}
        <Card className="p-4">
          <CurveEditor
            points={lightnessPoints}
            steps={steps}
            minValue={15}
            maxValue={95}
            onChange={handleLightnessCurveChange}  // <--- Ties drag events to state
            label="Lightness Curve"
          />
          <div className="mt-4">
            <Label htmlFor="contrast">Contrast</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-12 text-right">
                <span className="text-sm text-muted-foreground">Low</span>
              </div>
              <div className="relative flex-1">
                <Slider
                  id="contrast"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[contrast]}
                  onValueChange={(val) => handleContrastChange(val[0])}
                />
              </div>
              <div className="w-12">
                <span className="text-sm text-muted-foreground">High</span>
              </div>
            </div>
          </div>
        </Card>

        {/* CHROMA Curve */}
        <Card className="p-4">
          <CurveEditor
            points={chromaPoints}
            steps={steps}
            minValue={0}
            maxValue={100}
            onChange={handleChromaCurveChange}
            label="Chroma Curve"
          />
          <div className="mt-4">
            <Label htmlFor="vibrance">Vibrance</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-12 text-right">
                <span className="text-sm text-muted-foreground">Pastel</span>
              </div>
              <div className="relative flex-1">
                <Slider
                  id="vibrance"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[vibrance]}
                  onValueChange={(val) => handleVibranceChange(val[0])}
                />
              </div>
              <div className="w-12">
                <span className="text-sm text-muted-foreground">Vibrant</span>
              </div>
            </div>
          </div>
        </Card>

        {/* HUE Curve */}
        <Card className="p-4">
          <CurveEditor
            points={huePoints}
            steps={steps}
            minValue={0}
            maxValue={360}
            onChange={handleHueCurveChange}
            label="Hue Curve"
          />
          <div className="mt-4">
            <Label htmlFor="hueTorsion">Hue Torsion</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-12 text-right">
                <span className="text-sm text-muted-foreground">Cool</span>
              </div>
              <div className="relative flex-1">
                <Slider
                  id="hueTorsion"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[hueTorsion]}
                  onValueChange={(val) => handleHueTorsionChange(val[0])}
                />
              </div>
              <div className="w-12">
                <span className="text-sm text-muted-foreground">Warm</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};