import { oklch, parse, formatHex } from 'culori';

interface Point {
  step: number;
  value: number;
}

// Add Catmull-Rom spline interpolation
function catmullRomSpline(p0: number, p1: number, p2: number, p3: number, t: number, tension: number = 0.5): number {
  const t2 = t * t;
  const t3 = t2 * t;

  // Catmull-Rom matrix coefficients with tension parameter
  const a = (-tension * p0 + (2 - tension) * p1 + (tension - 2) * p2 + tension * p3) * 0.5;
  const b = (2 * tension * p0 + (tension - 3) * p1 + (3 - 2 * tension) * p2 - tension * p3) * 0.5;
  const c = (-tension * p0 + tension * p2) * 0.5;
  const d = p1;

  return a * t3 + b * t2 + c * t + d;
}

// Interpolate array of points using Catmull-Rom spline
export function interpolatePointsSpline(points: Point[], numPoints: number, tension: number = 0.5): Point[] {
  if (points.length < 2) return points;

  const result: Point[] = [];
  const sortedPoints = [...points].sort((a, b) => a.step - b.step);

  // Helper to get point with bounds checking
  const getPoint = (i: number) => {
    if (i < 0) {
      // Extrapolate for start points
      const p0 = sortedPoints[0];
      const p1 = sortedPoints[1];
      return {
        step: p0.step - (p1.step - p0.step),
        value: p0.value - (p1.value - p0.value)
      };
    }
    if (i >= sortedPoints.length) {
      // Extrapolate for end points
      const pn = sortedPoints[sortedPoints.length - 1];
      const pn1 = sortedPoints[sortedPoints.length - 2];
      return {
        step: pn.step + (pn.step - pn1.step),
        value: pn.value + (pn.value - pn1.value)
      };
    }
    return sortedPoints[i];
  };

  // Generate smooth curve
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const targetStep = t * (sortedPoints[sortedPoints.length - 1].step - sortedPoints[0].step) + sortedPoints[0].step;

    // Find the segment containing the target step
    let segmentIndex = 0;
    for (let j = 1; j < sortedPoints.length; j++) {
      if (sortedPoints[j].step > targetStep) {
        break;
      }
      segmentIndex = j;
    }

    // For exact control points, use the point value directly
    const exactPoint = sortedPoints.find(p => Math.abs(p.step - targetStep) < 0.0001);
    if (exactPoint) {
      result.push({ step: i, value: exactPoint.value });
      continue;
    }

    // Calculate local t value within the segment
    const segmentStart = sortedPoints[segmentIndex].step;
    const segmentEnd = segmentIndex < sortedPoints.length - 1 
      ? sortedPoints[segmentIndex + 1].step 
      : segmentStart + 1;
    const localT = (targetStep - segmentStart) / (segmentEnd - segmentStart);

    // Get the four points needed for interpolation
    const p0 = getPoint(segmentIndex - 1);
    const p1 = getPoint(segmentIndex);
    const p2 = getPoint(segmentIndex + 1);
    const p3 = getPoint(segmentIndex + 2);

    // Interpolate value using Catmull-Rom spline
    const value = catmullRomSpline(
      p0.value,
      p1.value,
      p2.value,
      p3.value,
      localT,
      0.3 // Reduced tension for better point adherence
    );

    result.push({
      step: i,
      value: value
    });
  }

  return result;
}

// Calculate relative luminance for a color
function getLuminance(hex: string): number {
  const rgb = parse(hex);
  if (!rgb) return 0;

  // Convert to sRGB values
  const rsRGB = rgb.r || 0;
  const gsRGB = rgb.g || 0;
  const bsRGB = rgb.b || 0;

  // Convert to linear RGB values
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Get the best contrast color (black or white) for a given background
export function getBestContrastColor(bgColor: string): { color: string; ratio: number } {
  const whiteContrast = getContrastRatio('#ffffff', bgColor);
  const blackContrast = getContrastRatio('#000000', bgColor);

  return whiteContrast > blackContrast
    ? { color: '#ffffff', ratio: whiteContrast }
    : { color: '#000000', ratio: blackContrast };
}

export interface ColorStop {
  hex: string;
  oklch: {
    l: number;
    c: number;
    h: number;
  };
}

// Calculate average vibrance (chroma) of a color ramp
export function calculateRampVibrance(ramp: ColorStop[]): number {
  if (ramp.length === 0) return 0;
  const avgChroma = ramp.reduce((sum, stop) => sum + stop.oklch.c, 0) / ramp.length;
  // Normalize to 0-1 range, assuming max chroma of 0.4 in OKLCH
  return Math.min(avgChroma / 0.4, 1);
}

export function hexToOklch(hex: string) {
  try {
    if (!hex.startsWith('#') || hex.length !== 7) {
      console.log('Invalid hex format:', hex);
      return { l: 0.5, c: 0, h: 0 };
    }

    const parsed = parse(hex);
    if (!parsed) {
      console.log('Failed to parse color:', hex);
      return { l: 0.5, c: 0, h: 0 };
    }

    const color = oklch(parsed);
    if (!color) {
      console.log('Failed to convert to OKLCH:', hex);
      return { l: 0.5, c: 0, h: 0 };
    }

    return {
      l: color.l ?? 0.5,
      c: color.c ?? 0,
      h: color.h ?? 0
    };
  } catch (e) {
    console.error('Error parsing color:', hex, e);
    return { l: 0.5, c: 0, h: 0 };
  }
}

export function oklchToHex({ l, c, h }: { l: number; c: number; h: number }) {
  try {
    const color = oklch({ mode: 'oklch', l, c, h });
    const hex = formatHex(color);
    return hex || '#000000';
  } catch (e) {
    console.error('Error converting OKLCH to hex:', { l, c, h }, e);
    return '#000000';
  }
}

// Modified to support non-linear lightness distribution
export function generateRamp(baseColor: string, steps: number, vibrance: number = 0.5, hueTorsion: number = 0.5): ColorStop[] {
  const base = hexToOklch(baseColor);
  const ramp: ColorStop[] = [];

  // Adjust base chroma based on vibrance
  const vibranceMultiplier = 0.2 + (vibrance * 1.8);
  const maxChroma = base.c * vibranceMultiplier;

  // Calculate hue torsion effect
  const torsionStrength = (hueTorsion - 0.5) * 2;

  // Generate lightness values with non-linear distribution
  for (let i = 0; i < steps; i++) {
    // Use exponential function for non-linear lightness distribution
    const t = i / (steps - 1);

    // Create a concave-down curve for lightness
    // This will create more granular steps in the lighter end
    const lightnessExponent = 0.7; // Adjust this value to control the curve shape
    const normalizedL = Math.pow(t, lightnessExponent);

    // Map to our desired lightness range (0.15 to 0.95)
    const l = 0.15 + (0.8 * normalizedL);

    // Adjust chroma based on lightness and vibrance
    const chromaFactor = 1 - Math.abs(0.5 - l) * 1.5;
    let c = maxChroma * Math.max(0, Math.min(1, chromaFactor));

    // Ensure chroma doesn't exceed OKLCH limits
    c = Math.min(c, 0.4);

    // Calculate normalized position in the ramp (0 to 1)
    const position = i / (steps - 1);

    // Create localized wave effects for positions
    const waveEffect = (center: number, width: number) => {
      const currentStep = Math.floor(position * (steps - 1));
      const centerStep = Math.floor(center * (steps - 1));
      const distance = Math.abs(currentStep - centerStep);
      const maxDistance = steps / 2;
      const sigma = maxDistance / 3;
      return Math.exp(-(distance * distance) / (2 * sigma * sigma));
    };

    // Calculate effects centered at 20% and 80% through the ramp
    const darkEffect = waveEffect(0.2, 0);
    const lightEffect = waveEffect(0.8, 0);

    // Calculate hue adjustment based on the combined effects
    const hueAdjustment = (darkEffect - lightEffect) * torsionStrength * 12;

    // Apply the hue adjustment to the base hue
    const h = base.h + hueAdjustment;

    // Normalize hue to 0-360 range
    const normalizedHue = ((h % 360) + 360) % 360;

    const oklchValues = { l, c, h: normalizedHue };
    const hex = oklchToHex(oklchValues);

    ramp.push({
      hex,
      oklch: oklchValues
    });
  }

  return ramp;
}

export function adjustRampWithCurve(
  ramp: ColorStop[],
  curve: { x: number; y: number }[],
  property: 'l' | 'c' | 'h'
): ColorStop[] {
  //Using spline interpolation here instead of linear interpolation.  This assumes the curve array is already in the correct format.
  const interpolatedCurvePoints = interpolatePointsSpline(curve.map((p,i) => ({step: i, value: p.y})), ramp.length);
  return ramp.map((stop, index) => {
    const y = interpolatedCurvePoints[index].value;

    const newOklch = { ...stop.oklch };
    if (property === 'l') {
      newOklch.l = y * 0.8 + 0.15; // Scale to our lightness range
    } else if (property === 'c') {
      // Scale chroma relative to the base color's chroma
      newOklch.c = y * stop.oklch.c;
    } else if (property === 'h') {
      // Adjust hue relative to the base color's hue
      const baseHue = ramp[0].oklch.h;
      newOklch.h = baseHue + (y * 60 - 30); // Allow ±30° hue shift
    }

    return {
      hex: oklchToHex(newOklch),
      oklch: newOklch
    };
  });
}