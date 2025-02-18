import { getContrastRatio, hexToOklch, type ColorStop } from "@/lib/color";

/* 
   Utility for assigning each semantic token to a color in the ramp.

   NOTE: No changes needed if you already had
   the same logic in your "home.tsx".
   We've just moved it to its own file to keep code tidy.
*/

function findBestMatchingPrimitive(ramp: ColorStop[], targetHex: string): number {
  if (!ramp.length) return 0;
  const target = hexToOklch(targetHex);
  let minDiff = Number.MAX_VALUE;
  let bestIndex = 0;

  for (let i = 0; i < ramp.length; i++) {
    const { l, c, h } = ramp[i].oklch;
    const lDiff = Math.abs(l - target.l);
    const cDiff = Math.abs(c - target.c);

    let hDiff = Math.abs(h - target.h);
    if (hDiff > 180) hDiff = 360 - hDiff;
    hDiff /= 360;

    const diff = (lDiff * 2) + (cDiff * 1.5) + (hDiff * 1);
    if (diff < minDiff) {
      minDiff = diff;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function getContrastOrFallback(rampHex: string, bgHex: string) {
  return getContrastRatio(rampHex, bgHex);
}

function findLightestWithContrast(ramp: ColorStop[], against: string, minContrast: number) {
  for (let i = 0; i < ramp.length; i++) {
    if (getContrastOrFallback(ramp[i].hex, against) >= minContrast) {
      return i;
    }
  }
  return ramp.length - 1;
}

function findDarkestWithContrast(ramp: ColorStop[], against: string, minContrast: number) {
  for (let i = ramp.length - 1; i >= 0; i--) {
    if (getContrastOrFallback(ramp[i].hex, against) >= minContrast) {
      return i;
    }
  }
  return 0;
}

function findDisabledContentColor(ramp: ColorStop[], bgHex: string, contentOnSecondaryIndex: number) {
  if (!ramp.length) return 0;
  let bestIndex = contentOnSecondaryIndex;
  let bestDistance = Number.MAX_VALUE;
  for (let i = 0; i < ramp.length; i++) {
    const contrast = getContrastOrFallback(ramp[i].hex, bgHex);
    if (contrast >= 1.2 && contrast <= 2.2) {
      return i;
    }
    const distance = contrast < 1.2 ? (1.2 - contrast) : (contrast > 2.2 ? contrast - 2.2 : 0);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  return bestIndex;
}

type Strategy =
  | { kind: "closest-base-color" }
  | { kind: "lightest-with-contrast"; contrastAgainst: string; ratio: number }
  | { kind: "darkest-with-contrast"; contrastAgainst?: string; contrastAgainstToken?: string; ratio: number }
  | { kind: "disabled-content-color"; backgroundIndexToken: string; contentOnSecondaryIndexToken: string }
  | { kind: "shift-step"; relativeTo: string; offset: number }
  | { kind: "use-same-index"; referenceToken: string };

interface SemanticTokenSpec {
  name: string;
  strategy: Strategy;
}

const NEUTRAL_COLORS = {
  midGray: "#5E5E5E",
  lightBg: "#F3F3F3",
};

/**
 * Example config for each semantic token:
 * brandBackgroundPrimary, brandBackgroundSecondary, etc.
 */
const SEMANTIC_CONFIG: SemanticTokenSpec[] = [
  {
    name: "brandBackgroundPrimary",
    strategy: { kind: "closest-base-color" },
  },
  {
    name: "brandBackgroundSecondary",
    strategy: { kind: "lightest-with-contrast", contrastAgainst: NEUTRAL_COLORS.midGray, ratio: 4.5 },
  },
  {
    name: "brandBackgroundDisabled",
    strategy: { kind: "shift-step", relativeTo: "brandBackgroundSecondary", offset: 1 },
  },
  {
    name: "brandContentPrimary",
    strategy: { kind: "darkest-with-contrast", contrastAgainst: NEUTRAL_COLORS.lightBg, ratio: 4.5 },
  },
  {
    name: "brandContentOnSecondary",
    strategy: { kind: "darkest-with-contrast", contrastAgainstToken: "brandBackgroundSecondary", ratio: 4.5 },
  },
  {
    name: "brandContentDisabled",
    strategy: {
      kind: "disabled-content-color",
      backgroundIndexToken: "brandBackgroundDisabled",
      contentOnSecondaryIndexToken: "brandContentOnSecondary",
    },
  },
  {
    name: "brandBorderAccessible",
    strategy: { kind: "use-same-index", referenceToken: "brandContentPrimary" },
  },
  {
    name: "brandBorderSubtle",
    strategy: { kind: "shift-step", relativeTo: "brandBackgroundSecondary", offset: -2 },
  },
];

function pickIndexForStrategy(
  strategy: Strategy,
  ramp: ColorStop[],
  knownIndices: Record<string, number>,
  baseColor: string
): number {
  switch (strategy.kind) {
    case "closest-base-color":
      return findBestMatchingPrimitive(ramp, baseColor);

    case "lightest-with-contrast":
      return findLightestWithContrast(ramp, strategy.contrastAgainst, strategy.ratio);

    case "darkest-with-contrast": {
      let compareHex = strategy.contrastAgainst ?? "#FFFFFF";
      if (strategy.contrastAgainstToken) {
        const refIndex = knownIndices[strategy.contrastAgainstToken] ?? 0;
        compareHex = ramp[refIndex]?.hex || compareHex;
      }
      return findDarkestWithContrast(ramp, compareHex, strategy.ratio);
    }

    case "disabled-content-color": {
      const bgIndex = knownIndices[strategy.backgroundIndexToken] ?? 0;
      const cOnSecIndex = knownIndices[strategy.contentOnSecondaryIndexToken] ?? 0;
      const bgHex = ramp[bgIndex]?.hex || "#FFFFFF";
      return findDisabledContentColor(ramp, bgHex, cOnSecIndex);
    }

    case "shift-step": {
      const refIndex = knownIndices[strategy.relativeTo] ?? 0;
      let newIndex = refIndex + strategy.offset;
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= ramp.length) newIndex = ramp.length - 1;
      return newIndex;
    }

    case "use-same-index":
      return knownIndices[strategy.referenceToken] ?? 0;

    default:
      return 0;
  }
}

/**
 * Main function to produce a dictionary: { brandBackgroundPrimary: 0, brandBackgroundSecondary: 2, ... }
 */
export function computeSemanticsIndices(ramp: ColorStop[], baseColor: string): Record<string, number> {
  const result: Record<string, number> = {};

  for (const tokenSpec of SEMANTIC_CONFIG) {
    const idx = pickIndexForStrategy(tokenSpec.strategy, ramp, result, baseColor);
    result[tokenSpec.name] = idx;
  }

  return result;
}