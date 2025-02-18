import { useState, useEffect, useCallback } from "react";
import { generateRamp, oklchToHex, type ColorStop } from "@/lib/color";
import { computeSemanticsIndices } from "@/lib/semanticTokens";

interface Point {
  step: number;
  value: number;
}

export function useColorRamp() {
  const [baseColor, setBaseColor] = useState("#6366f1");
  const [steps, setSteps] = useState(12);
  const [vibrance, setVibrance] = useState(0.5);
  const [hueTorsion, setHueTorsion] = useState(0.5);
  const [contrast, setContrast] = useState(0.5);

  // Convert the "contrast" slider into alphaIn / alphaOut
  const getContrastValues = (val: number) => {
    const alphaIn = 1 + val * 1; // 1 → 2
    const alphaOut = 1 + val * 2; // 1 → 3
    return { alphaIn, alphaOut };
  };

  // Ramp array
  const [ramp, setRamp] = useState<ColorStop[]>(() => {
    const { alphaIn, alphaOut } = getContrastValues(contrast);
    return generateRamp(baseColor, steps, vibrance, hueTorsion, {
      alphaIn,
      alphaOut,
    });
  });

  // Points for the curve editors (lightness, chroma, hue)
  const [lightnessPoints, setLightnessPoints] = useState<Point[]>(() =>
    ramp.map((c, i) => ({ step: i, value: c.oklch.l * 100 })),
  );
  const [chromaPoints, setChromaPoints] = useState<Point[]>(() =>
    ramp.map((c, i) => ({ step: i, value: c.oklch.c * 100 })),
  );
  const [huePoints, setHuePoints] = useState<Point[]>(() =>
    ramp.map((c, i) => ({ step: i, value: c.oklch.h })),
  );

  // Utility to handle re-sampling of the curve points when steps changes
  const interpolatePoints = (
    currentPoints: Point[],
    newStepCount: number,
  ): Point[] => {
    if (currentPoints.length <= 1) {
      return Array.from({ length: newStepCount }, (_, i) => ({
        step: i,
        value: currentPoints[0]?.value ?? 50,
      }));
    }
    const sorted = [...currentPoints].sort((a, b) => a.step - b.step);
    return Array.from({ length: newStepCount }, (_, i) => {
      const position = (i / (newStepCount - 1)) * (sorted.length - 1);
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

  // Re-compute the final ramp each time any relevant state changes
  const updateRamp = useCallback(() => {
    const { alphaIn, alphaOut } = getContrastValues(contrast);
    // baseline ramp from generateRamp
    const baseRamp = generateRamp(baseColor, steps, vibrance, hueTorsion, {
      alphaIn,
      alphaOut,
    });

    // override each step with our custom L, C, H from the curve editors
    const newRamp = baseRamp.map((color, i) => {
      const l = (lightnessPoints[i]?.value ?? 50) / 100;
      const c = (chromaPoints[i]?.value ?? 50) / 100;
      const h = huePoints[i]?.value ?? 0;
      return {
        oklch: { l, c, h },
        hex: oklchToHex({ l, c, h }),
      };
    });
    setRamp(newRamp);
  }, [
    baseColor,
    steps,
    vibrance,
    hueTorsion,
    contrast,
    lightnessPoints,
    chromaPoints,
    huePoints,
  ]);

  useEffect(() => {
    updateRamp();
  }, [updateRamp]);

  // ==================
  // PUBLIC CALLBACKS
  // ==================

  // 1) Basic color input
  function handleColorChange(newColor: string) {
    setBaseColor(newColor);
  }

  // 2) "Generate Ramp" button
  function handleGenerateRamp() {
    const { alphaIn, alphaOut } = getContrastValues(contrast);
    const newBaseRamp = generateRamp(baseColor, steps, vibrance, hueTorsion, {
      alphaIn,
      alphaOut,
    });

    // re-init curve points from scratch
    setLightnessPoints(
      newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.l * 100 })),
    );
    setChromaPoints(
      newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.c * 100 })),
    );
    setHuePoints(newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.h })));
    setRamp(newBaseRamp);
  }

  // 3) Steps +/- buttons
  function handleStepsChange(newSteps: number) {
    if (newSteps < 4 || newSteps > 20) return;
    const newLightness = interpolatePoints(lightnessPoints, newSteps);
    const newChroma = interpolatePoints(chromaPoints, newSteps);
    const newHue = interpolatePoints(huePoints, newSteps);

    setSteps(newSteps);
    setLightnessPoints(newLightness);
    setChromaPoints(newChroma);
    setHuePoints(newHue);

    // re-generate ramp
    const { alphaIn, alphaOut } = getContrastValues(contrast);
    const baseRamp = generateRamp(baseColor, newSteps, vibrance, hueTorsion, {
      alphaIn,
      alphaOut,
    });
    const finalRamp = baseRamp.map((color, i) => {
      const l = newLightness[i]?.value / 100;
      const c = newChroma[i]?.value / 100;
      const h = newHue[i]?.value;
      return {
        oklch: { l, c, h },
        hex: oklchToHex({ l, c, h }),
      };
    });
    setRamp(finalRamp);
  }

  // 4) Vibrance slider
  function handleVibranceChange(val: number) {
    setVibrance(val);
    const { alphaIn, alphaOut } = getContrastValues(contrast);
    const newBaseRamp = generateRamp(baseColor, steps, val, hueTorsion, {
      alphaIn,
      alphaOut,
    });
    setLightnessPoints(
      newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.l * 100 })),
    );
    setChromaPoints(
      newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.c * 100 })),
    );
    setHuePoints(newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.h })));
    setRamp(newBaseRamp);
  }

  // 5) Hue Torsion slider
  function handleHueTorsionChange(val: number) {
    setHueTorsion(val);
    const { alphaIn, alphaOut } = getContrastValues(contrast);
    const newBaseRamp = generateRamp(baseColor, steps, vibrance, val, {
      alphaIn,
      alphaOut,
    });
    setLightnessPoints(
      newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.l * 100 })),
    );
    setChromaPoints(
      newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.c * 100 })),
    );
    setHuePoints(newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.h })));
    setRamp(newBaseRamp);
  }

  // 6) Contrast slider
  function handleContrastChange(val: number) {
    setContrast(val);
    const { alphaIn, alphaOut } = getContrastValues(val);
    const newBaseRamp = generateRamp(baseColor, steps, vibrance, hueTorsion, {
      alphaIn,
      alphaOut,
    });
    setLightnessPoints(
      newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.l * 100 })),
    );
    setChromaPoints(
      newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.c * 100 })),
    );
    setHuePoints(newBaseRamp.map((c, i) => ({ step: i, value: c.oklch.h })));
    setRamp(newBaseRamp);
  }

  // ========
  // DRAGGING THE POINTS
  // ========
  // We'll add three new handlers so that the user can drag points in each CurveEditor
  function handleLightnessCurveChange(newPoints: Point[]) {
    setLightnessPoints(newPoints);
  }
  function handleChromaCurveChange(newPoints: Point[]) {
    setChromaPoints(newPoints);
  }
  function handleHueCurveChange(newPoints: Point[]) {
    setHuePoints(newPoints);
  }

  // ==================
  // COMPUTE SEMANTIC TOKENS
  // ==================
  const [semanticIndices, setSemanticIndices] = useState<
    Record<string, number>
  >({});
  useEffect(() => {
    const si = computeSemanticsIndices(ramp, baseColor);
    setSemanticIndices(si);
  }, [ramp, baseColor]);

  return {
    // main data
    ramp,
    baseColor,
    steps,
    vibrance,
    hueTorsion,
    contrast,

    // curve data
    lightnessPoints,
    chromaPoints,
    huePoints,

    // semantic token indices
    semanticIndices,

    // actions
    handleColorChange,
    handleGenerateRamp,
    handleStepsChange,
    handleVibranceChange,
    handleHueTorsionChange,
    handleContrastChange,

    // curve drag handlers
    handleLightnessCurveChange,
    handleChromaCurveChange,
    handleHueCurveChange,
  };
}
