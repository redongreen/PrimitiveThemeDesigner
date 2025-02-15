import { oklch, parse, formatHex } from 'culori';

export interface ColorStop {
  hex: string;
  oklch: {
    l: number;
    c: number;
    h: number;
  };
}

export function hexToOklch(hex: string) {
  const color = oklch(parse(hex));
  return {
    l: color.l,
    c: color.c || 0,
    h: color.h || 0
  };
}

export function oklchToHex({ l, c, h }: { l: number; c: number; h: number }) {
  return formatHex(oklch({ mode: 'oklch', l, c, h }));
}

export function generateRamp(baseColor: string, steps: number): ColorStop[] {
  const base = hexToOklch(baseColor);
  const ramp: ColorStop[] = [];

  // Generate lightness values from 0.15 to 0.95 to avoid pure black/white
  for (let i = 0; i < steps; i++) {
    const l = 0.15 + (0.8 * i) / (steps - 1);
    const c = base.c * (1 - Math.abs(0.5 - l)); // Reduce chroma at extremes
    const h = base.h;

    const hex = oklchToHex({ l, c, h });
    ramp.push({
      hex,
      oklch: { l, c, h }
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
      newOklch.c = y * stop.oklch.c;
    } else {
      newOklch.h = y * 360;
    }

    return {
      hex: oklchToHex(newOklch),
      oklch: newOklch
    };
  });
}

function interpolateCurve(curve: { x: number; y: number }[], x: number): number {
  // Find the two control points that surround x
  const i1 = curve.findIndex(p => p.x > x);
  if (i1 === -1) return curve[curve.length - 1].y;
  if (i1 === 0) return curve[0].y;

  const p0 = curve[i1 - 1];
  const p1 = curve[i1];

  // Linear interpolation
  const t = (x - p0.x) / (p1.x - p0.x);
  return p0.y + t * (p1.y - p0.y);
}