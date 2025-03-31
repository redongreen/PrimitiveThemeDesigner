// File: /src/hooks/useColorRamp.ts

import { useState, useEffect } from "react";
import { ColorStop } from "@/lib/color";  // adjust import path if needed
import { computeSemanticsIndices } from "@/lib/semanticTokens";

interface Point {
  step: number;
  value: number;
}

interface RampState {
  ramp: ColorStop[];
  semanticIndices: Record<string, number>;  // <-- The important part!
  baseColor: string;
  steps: number;
  vibrance: number;
  hueTorsion: number;
  contrast: number;

  // curve arrays
  lightnessPoints: Point[];
  chromaPoints: Point[];
  huePoints: Point[];

  // handlers
  handleColorChange: (color: string) => void;
  handleGenerateRamp: () => void;
  handleStepsChange: (newSteps: number) => void;
  handleVibranceChange: (val: number) => void;
  handleHueTorsionChange: (val: number) => void;
  handleContrastChange: (val: number) => void;
  handleLightnessCurveChange: (newPoints: Point[]) => void;
  handleChromaCurveChange: (newPoints: Point[]) => void;
  handleHueCurveChange: (newPoints: Point[]) => void;
}

// EXAMPLE ONLY—replace with your actual ramp-generation code
export function useColorRamp(): RampState {
  // Basic states
  const [baseColor, setBaseColor] = useState("#ff0000");
  const [steps, setSteps] = useState(7);
  const [vibrance, setVibrance] = useState(0.5);
  const [hueTorsion, setHueTorsion] = useState(0.3);
  const [contrast, setContrast] = useState(0.5);

  // Example curves
  const [lightnessPoints, setLightnessPoints] = useState<Point[]>([
    { step: 0, value: 20 },
    { step: steps - 1, value: 90 },
  ]);
  const [chromaPoints, setChromaPoints] = useState<Point[]>([
    { step: 0, value: 10 },
    { step: steps - 1, value: 80 },
  ]);
  const [huePoints, setHuePoints] = useState<Point[]>([
    { step: 0, value: 0 },
    { step: steps - 1, value: 0 },
  ]);

  // The actual color ramp array
  const [ramp, setRamp] = useState<ColorStop[]>([]);

  // Recompute ramp when relevant states change
  useEffect(() => {
    generateRamp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseColor, steps, vibrance, hueTorsion, contrast, lightnessPoints, chromaPoints, huePoints]);

  function generateRamp() {
    // 1) generate your ramp. 
    //    Implementation is up to you—this is just a placeholder.
    const newRamp: ColorStop[] = [];
    for (let i = 0; i < steps; i++) {
      // This is just placeholder logic, replace with your real color generation.
      newRamp.push({
        hex: i === 0 ? "#ffffff" : i === steps - 1 ? "#000000" : `#f${i}f${i}f${i}`,
        oklch: { l: 1 - i / (steps - 1), c: 0.2, h: 0 },
      });
    }
    setRamp(newRamp);
  }

  // Now, we compute the brand token indices from our ramp
  const semanticIndices = computeSemanticsIndices(ramp, baseColor);

  // Handler implementations
  function handleColorChange(color: string) {
    setBaseColor(color);
  }
  function handleGenerateRamp() {
    generateRamp();
  }
  function handleStepsChange(newSteps: number) {
    setSteps(newSteps);
  }
  function handleVibranceChange(val: number) {
    setVibrance(val);
  }
  function handleHueTorsionChange(val: number) {
    setHueTorsion(val);
  }
  function handleContrastChange(val: number) {
    setContrast(val);
  }
  function handleLightnessCurveChange(newPoints: Point[]) {
    setLightnessPoints(newPoints);
  }
  function handleChromaCurveChange(newPoints: Point[]) {
    setChromaPoints(newPoints);
  }
  function handleHueCurveChange(newPoints: Point[]) {
    setHuePoints(newPoints);
  }

  // Finally, return everything
  return {
    ramp,
    semanticIndices,  // <----- KEY! Now home.tsx won't break
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
  };
}
