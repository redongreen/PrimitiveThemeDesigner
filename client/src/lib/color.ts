import { oklch, parse, formatHex } from 'culori';

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
  const whiteContrast = getContrastRatio(bgColor, '#ffffff');
  const blackContrast = getContrastRatio(bgColor, '#000000');

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

// Modified to support vibrance and hue torsion adjustment
export function generateRamp(baseColor: string, steps: number, vibrance: number = 0.5, hueTorsion: number = 0.5): ColorStop[] {
  const base = hexToOklch(baseColor);
  const ramp: ColorStop[] = [];

  // Adjust base chroma based on vibrance
  const vibranceMultiplier = 0.2 + (vibrance * 1.8);
  const maxChroma = base.c * vibranceMultiplier;

  // Calculate hue torsion effect
  // Map hueTorsion [0,1] to [-1, 1] range for direction
  const torsionStrength = (hueTorsion - 0.5) * 2;

  // Generate lightness values from 0.15 to 0.95 to avoid pure black/white
  for (let i = 0; i < steps; i++) {
    const l = 0.15 + (0.8 * i) / (steps - 1);

    // Adjust chroma based on lightness and vibrance
    const chromaFactor = 1 - Math.abs(0.5 - l) * 1.5;
    let c = maxChroma * Math.max(0, Math.min(1, chromaFactor));

    // Ensure chroma doesn't exceed OKLCH limits
    c = Math.min(c, 0.4);

    // Calculate normalized position in the ramp (0 to 1)
    const position = i / (steps - 1);

    // Create a smooth wave-like effect
    // Use a combination of sine waves to create a more natural curve
    const wave = (x: number, phase: number) =>
      Math.sin(2 * Math.PI * x + phase) *
      Math.exp(-Math.pow((x - 0.5), 2) / 0.5); // Gaussian envelope

    // Calculate the wave effect centered around step 3 (0.3) and step 8 (0.8)
    const step3Effect = wave(position - 0.3, 0) * 0.05;
    const step8Effect = -wave(position - 0.8, 0) * 0.05;

    // Combine the effects and apply torsion strength
    const hueAdjustment = (step3Effect + step8Effect) * torsionStrength;

    // Apply the hue adjustment to the base hue
    const h = base.h + hueAdjustment * 360;

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
  return ramp.map((stop, index) => {
    const x = index / (ramp.length - 1);
    const y = interpolateCurve(curve, x);

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

function interpolateCurve(curve: { x: number; y: number }[], x: number): number {
  const i1 = curve.findIndex(p => p.x > x);
  if (i1 === -1) return curve[curve.length - 1].y;
  if (i1 === 0) return curve[0].y;

  const p0 = curve[i1 - 1];
  const p1 = curve[i1];

  const t = (x - p0.x) / (p1.x - p0.x);
  return p0.y + t * (p1.y - p0.y);
}