import { oklch, parse, formatHex } from 'culori';

function getLuminance(hex: string): number {
  const rgb = parse(hex);
  if (!rgb) return 0;
  const rsRGB = rgb.r ?? 0;
  const gsRGB = rgb.g ?? 0;
  const bsRGB = rgb.b ?? 0;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

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

export function calculateRampVibrance(ramp: ColorStop[]): number {
  if (ramp.length === 0) return 0;
  const avgChroma = ramp.reduce((sum, stop) => sum + stop.oklch.c, 0) / ramp.length;
  // scale 0..0.4 => 0..1
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

// ----------------------------------------------------------------------
// S-CURVE function: piecewise, but only one boundary => "start->mid" + "mid->end"
// This yields an "S" shape from 0..1, with separate exponents for "ease in" and "ease out".
// ----------------------------------------------------------------------
function sCurve(
  t: number, 
  mid: number,         // e.g. 0.5 is the midpoint
  alphaIn: number,     // ease-in intensity
  alphaOut: number     // ease-out intensity
): number {
  if (t <= mid) {
    // bottom segment => ease in
    const subT = t / mid;           // maps t=0..mid => subT=0..1
    const eased = Math.pow(subT, alphaIn); 
    // map [0..1] -> [0..mid]
    return eased * mid;
  } else {
    // top segment => ease out
    const subT = (t - mid) / (1 - mid); // maps t=mid..1 => subT=0..1
    const eased = 1 - Math.pow(1 - subT, alphaOut);
    // map [0..1] -> [mid..1]
    return mid + eased * (1 - mid);
  }
}

// ----------------------------------------------------------------------
// generateRamp - uses the sCurve for the entire 0..1 domain of t
// ----------------------------------------------------------------------
export function generateRamp(
  baseColor: string,
  steps: number,
  vibrance: number = 0.5,
  hueTorsion: number = 0.5,
  options?: {
    mid?: number;        // default = 0.5
    alphaIn?: number;    // ease-in exponent
    alphaOut?: number;   // ease-out exponent
  }
): ColorStop[] {
  const {
    mid = 0.5,
    alphaIn = 1.1,   // typical "ease-in" exponent
    alphaOut = 1.67,  // typical "ease-out" exponent
  } = options || {};

  const base = hexToOklch(baseColor);
  const ramp: ColorStop[] = [];

  // Vibrance => adjusts base chroma
  const vibranceMultiplier = 0.2 + vibrance * 1.8;
  const maxChroma = base.c * vibranceMultiplier;

  // Hue torsion
  const torsionStrength = (hueTorsion - 0.5) * 2;

  // Lightness range
  const L_MIN = 0.15;
  const L_MAX = 0.95;
  const span = L_MAX - L_MIN;

  for (let i = 0; i < steps; i++) {
    // 1) normalized t in [0..1]
    const t = i / (steps - 1);

    // 2) apply the sCurve => yields 0..1
    const sValue = sCurve(t, mid, alphaIn, alphaOut);

    // 3) map sValue -> [L_MIN..L_MAX]
    const l = L_MIN + span * sValue;

    // 4) Chroma logic
    const chromaFactor = 1 - Math.abs(0.5 - l) * 1.5;
    let c = maxChroma * Math.max(0, Math.min(1, chromaFactor));
    c = Math.min(c, 0.4);

    // 5) wave/hue effect
    function waveEffect(center: number) {
      const currentStep = Math.floor(t * (steps - 1));
      const centerStep = Math.floor(center * (steps - 1));
      const distance = Math.abs(currentStep - centerStep);
      const maxDistance = steps / 2;
      const sigma = maxDistance / 3;
      return Math.exp(-(distance * distance) / (2 * sigma * sigma));
    }
    const darkEffect = waveEffect(0.2);
    const lightEffect = waveEffect(0.8);
    const hueAdjustment = (darkEffect - lightEffect) * torsionStrength * 12;
    const hRaw = base.h + hueAdjustment;
    const normalizedHue = ((hRaw % 360) + 360) % 360;

    // Final color
    const oklchValues = { l, c, h: normalizedHue };
    const hex = oklchToHex(oklchValues);

    ramp.push({
      hex,
      oklch: oklchValues
    });
  }

  return ramp;
}

// ---------------------------------------------
// If you still want a final step to adjust the
// resulting ramp via a "curve" of your own
// ---------------------------------------------
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
      newOklch.l = y * 0.8 + 0.15;
    } else if (property === 'c') {
      newOklch.c = y * stop.oklch.c;
    } else if (property === 'h') {
      const baseHue = ramp[0].oklch.h;
      newOklch.h = baseHue + (y * 60 - 30);
    }
    return {
      hex: oklchToHex(newOklch),
      oklch: newOklch
    };
  });
}

function interpolateCurve(curve: { x: number; y: number }[], x: number): number {
  const i1 = curve.findIndex((p) => p.x > x);
  if (i1 === -1) return curve[curve.length - 1].y;
  if (i1 === 0) return curve[0].y;

  const p0 = curve[i1 - 1];
  const p1 = curve[i1];

  const t = (x - p0.x) / (p1.x - p0.x);
  return p0.y + t * (p1.y - p0.y);
}