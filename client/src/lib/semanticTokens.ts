import { getContrastRatio, hexToOklch, type ColorStop } from "@/lib/color";

/**
 * Special negative indices for black or white if your ramp can't meet certain contrast.
 */
export const SPECIAL_BLACK_INDEX = -2;
export const SPECIAL_WHITE_INDEX = -3;

/** Check if an index is one of the special black/white constants. */
function isSpecialIndex(index: number) {
  return index === SPECIAL_BLACK_INDEX || index === SPECIAL_WHITE_INDEX;
}

/** Convert ramp index (or special black/white index) → actual hex color. */
export function getColorFromIndex(ramp: ColorStop[], idx: number): string {
  if (idx === SPECIAL_BLACK_INDEX) return "#000000";
  if (idx === SPECIAL_WHITE_INDEX) return "#FFFFFF";
  return ramp[idx]?.hex ?? "#000000"; // fallback
}

// ────────────────────────────────────────────────────────────────────────────────
// Neutral tokens: fixed values used throughout the app for content or backgrounds
// ────────────────────────────────────────────────────────────────────────────────
export const NEUTRAL_TOKENS = {
  contentTertiary: "#5E5E5E",        // medium gray
  backgroundSecondary: "#F3F3F3",    // light gray
  backgroundTertiary: "#E8E8E8",     // slightly darker light gray
} as const;

/**
 * Strategies that define how "brand" tokens are computed from the color ramp.
 * Each entry leads to a ramp index (or special black/white) after computeSemanticsIndices is called.
 */
type Strategy =
  | { kind: "closest-base-color" }
  | { kind: "lightest-with-contrast"; contrastAgainst: string; ratio: number }
  | { kind: "darkest-with-contrast"; contrastAgainst?: string; contrastAgainstToken?: string; ratio: number }
  | { kind: "disabled-content-color"; backgroundIndexToken: string; contentOnSecondaryIndexToken: string }
  | { kind: "shift-step"; relativeTo: string; offset: number }
  | { kind: "use-same-index"; referenceToken: string }
  | {
      kind: "border-accessible";
      referenceToken: string;
      ratio: number;
      contrastAgainst: string;
    }
  | {
      kind: "content-on-primary-6to1";
      backgroundToken: string;
    };

interface SemanticTokenSpec {
  name: string;
  strategy: Strategy;
}

// ────────────────────────────────────────────────────────────────────────────────
// Brand token configuration: how each token picks a ramp color
// ────────────────────────────────────────────────────────────────────────────────
const SEMANTIC_CONFIG: SemanticTokenSpec[] = [
  {
    // brandBackgroundPrimary picks whichever ramp color is closest to the user-provided baseColor.
    name: "brandBackgroundPrimary",
    strategy: { kind: "closest-base-color" },
  },
  {
    // brandBackgroundSecondary picks the lightest ramp color with at least 4.5:1 contrast vs #5E5E5E
    name: "brandBackgroundSecondary",
    strategy: {
      kind: "lightest-with-contrast",
      contrastAgainst: NEUTRAL_TOKENS.contentTertiary, // "#5E5E5E"
      ratio: 4.5,
    },
  },
  {
    // brandBackgroundDisabled shifts brandBackgroundSecondary's index by +1
    name: "brandBackgroundDisabled",
    strategy: {
      kind: "shift-step",
      relativeTo: "brandBackgroundSecondary",
      offset: 1,
    },
  },
  {
    // brandContentPrimary picks the darkest color that meets 4.5:1 vs #F3F3F3
    name: "brandContentPrimary",
    strategy: {
      kind: "darkest-with-contrast",
      contrastAgainst: NEUTRAL_TOKENS.backgroundSecondary, // "#F3F3F3"
      ratio: 4.5,
    },
  },
  {
    // brandContentOnSecondary picks the darkest color that meets 4.5:1 vs brandBackgroundSecondary
    name: "brandContentOnSecondary",
    strategy: {
      kind: "darkest-with-contrast",
      contrastAgainstToken: "brandBackgroundSecondary",
      ratio: 4.5,
    },
  },
  {
    // brandContentDisabled tries for ~1.2..2.2 contrast vs brandBackgroundDisabled
    // or whichever is closest to that range.
    name: "brandContentDisabled",
    strategy: {
      kind: "disabled-content-color",
      backgroundIndexToken: "brandBackgroundDisabled",
      contentOnSecondaryIndexToken: "brandContentOnSecondary",
    },
  },
  {
    // brandBorderAccessible tries brandBackgroundPrimary's index if >=3:1 vs #E8E8E8,
    // else expands outward, else fallback to brandBackgroundPrimary.
    name: "brandBorderAccessible",
    strategy: {
      kind: "border-accessible",
      referenceToken: "brandBackgroundPrimary",
      ratio: 3,
      contrastAgainst: NEUTRAL_TOKENS.backgroundTertiary, // "#E8E8E8"
    },
  },
  {
    // brandBorderSubtle shifts brandBackgroundSecondary's index by -2
    name: "brandBorderSubtle",
    strategy: {
      kind: "shift-step",
      relativeTo: "brandBackgroundSecondary",
      offset: -2,
    },
  },
  {
    // brandContentOnPrimary tries >=5:1 vs brandBackgroundPrimary,
    // else black/white fallback if >=4.5:1, else fallback to brandBackgroundPrimary index.
    name: "brandContentOnPrimary",
    strategy: {
      kind: "content-on-primary-6to1",
      backgroundToken: "brandBackgroundPrimary",
    },
  },
];

/**
 * Helper utilities for picking an index from the ramp.
 */
function getContrastOrFallback(foreHex: string, backHex: string) {
  return getContrastRatio(foreHex, backHex);
}
function hexToOklchDistance(hex1: string, hex2: string) {
  // Weighted difference in OKLCH
  const a = hexToOklch(hex1);
  const b = hexToOklch(hex2);

  let hDiff = Math.abs(a.h - b.h);
  if (hDiff > 180) hDiff = 360 - hDiff;
  hDiff /= 360;

  const lDiff = Math.abs(a.l - b.l);
  const cDiff = Math.abs(a.c - b.c);

  // Weighted sum
  return (lDiff * 2) + (cDiff * 1.5) + (hDiff * 1);
}

/** Finds whichever ramp color is closest in OKLCH to a `targetHex`. */
function findBestMatchingPrimitive(ramp: ColorStop[], targetHex: string): number {
  if (!ramp.length) return 0;
  let bestIndex = 0;
  let minDiff = Number.MAX_VALUE;

  for (let i = 0; i < ramp.length; i++) {
    const diff = hexToOklchDistance(ramp[i].hex, targetHex);
    if (diff < minDiff) {
      minDiff = diff;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/** Looks from lightest → darkest for first ramp color with >= minContrast vs `against`. */
function findLightestWithContrast(ramp: ColorStop[], against: string, minContrast: number) {
  for (let i = 0; i < ramp.length; i++) {
    if (getContrastOrFallback(ramp[i].hex, against) >= minContrast) {
      return i;
    }
  }
  // If none meets, return the darkest
  return ramp.length - 1;
}

/** Looks from darkest → lightest for first ramp color with >= minContrast vs `against`. */
function findDarkestWithContrast(ramp: ColorStop[], against: string, minContrast: number) {
  for (let i = ramp.length - 1; i >= 0; i--) {
    if (getContrastOrFallback(ramp[i].hex, against) >= minContrast) {
      return i;
    }
  }
  // If none meets, return the lightest
  return 0;
}

/**
 * For "disabled content," tries [1.2..2.2] contrast vs bgHex.
 * If none found, picks whichever is closest. Fallback is the "contentOnSecondary" index if needed.
 */
function findDisabledContentColor(ramp: ColorStop[], bgHex: string, defaultIndex: number) {
  if (!ramp.length) return 0;
  let bestIndex = defaultIndex;
  let bestDistance = Number.MAX_VALUE;

  for (let i = 0; i < ramp.length; i++) {
    const contrast = getContrastOrFallback(ramp[i].hex, bgHex);
    if (contrast >= 1.2 && contrast <= 2.2) {
      return i; // Found a color in the desired range
    }
    const distance =
      contrast < 1.2 ? 1.2 - contrast :
      contrast > 2.2 ? contrast - 2.2 :
      0;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/** 
 * Core function to compute ramp index for each brand token, used by your UI code. 
 * We'll export it so your existing code that imports it won't break.
 */
export function computeSemanticsIndices(ramp: ColorStop[], baseColor: string) {
  const result: Record<string, number> = {};

  for (const tokenSpec of SEMANTIC_CONFIG) {
    const idx = pickIndexForStrategy(tokenSpec.strategy, ramp, result, baseColor);
    result[tokenSpec.name] = idx;
  }
  return result;
}

/** 
 * The function that picks an index based on the given strategy. 
 */
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
      let compareHex = strategy.contrastAgainst || "#FFFFFF";
      if (strategy.contrastAgainstToken) {
        const refIndex = knownIndices[strategy.contrastAgainstToken] ?? 0;
        compareHex = getColorFromIndex(ramp, refIndex);
      }
      return findDarkestWithContrast(ramp, compareHex, strategy.ratio);
    }

    case "disabled-content-color": {
      const bgIndex = knownIndices[strategy.backgroundIndexToken] ?? 0;
      const cOnSecIndex = knownIndices[strategy.contentOnSecondaryIndexToken] ?? 0;
      const bgHex = getColorFromIndex(ramp, bgIndex);
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

    case "border-accessible": {
      const refIndex = knownIndices[strategy.referenceToken] ?? 0;
      const candidateHex = getColorFromIndex(ramp, refIndex);
      const candidateContrast = getContrastOrFallback(candidateHex, strategy.contrastAgainst);
      if (candidateContrast >= strategy.ratio) {
        return refIndex;
      }
      // Expand outward
      let left = refIndex - 1;
      let right = refIndex + 1;
      while (left >= 0 || right < ramp.length) {
        if (left >= 0) {
          const leftHex = ramp[left].hex;
          if (getContrastOrFallback(leftHex, strategy.contrastAgainst) >= strategy.ratio) {
            return left;
          }
          left--;
        }
        if (right < ramp.length) {
          const rightHex = ramp[right].hex;
          if (getContrastOrFallback(rightHex, strategy.contrastAgainst) >= strategy.ratio) {
            return right;
          }
          right++;
        }
      }
      // fallback
      return refIndex;
    }

    case "content-on-primary-6to1": {
      const bgIndex = knownIndices[strategy.backgroundToken] ?? 0;
      const bgHex = getColorFromIndex(ramp, bgIndex);

      // 1) Try to find a ramp color >= 5:1 vs bgHex, searching outward from bgIndex
      const candidateIndices: number[] = [];
      candidateIndices.push(bgIndex);
      let left = bgIndex - 1;
      let right = bgIndex + 1;
      while (left >= 0 || right < ramp.length) {
        if (left >= 0) {
          candidateIndices.push(left);
          left--;
        }
        if (right < ramp.length) {
          candidateIndices.push(right);
          right++;
        }
      }
      let foundIndex = -1;
      for (const idx of candidateIndices) {
        const foreHex = ramp[idx].hex;
        if (getContrastOrFallback(foreHex, bgHex) >= 5) {
          foundIndex = idx;
          break;
        }
      }
      if (foundIndex >= 0) {
        return foundIndex;
      }

      // 2) fallback to black/white if >=4.5:1
      const blackC = getContrastOrFallback("#000000", bgHex);
      const whiteC = getContrastOrFallback("#FFFFFF", bgHex);
      if (blackC >= 4.5 || whiteC >= 4.5) {
        // pick whichever is higher
        if (blackC > whiteC && blackC >= 4.5) return SPECIAL_BLACK_INDEX;
        if (whiteC >= 4.5) return SPECIAL_WHITE_INDEX;
      }

      // 3) fallback to same index as background
      return bgIndex;
    }

    default:
      return 0;
  }
}

/** 
 * If you ever want ONE object with both neutral tokens + brand tokens (as final hex),
 * you can use this function in your code. Otherwise, it's optional.
 */
export function generateAllTokens(ramp: ColorStop[], baseColor: string): Record<string, string> {
  // 1) figure out brand token indices
  const brandIndices = computeSemanticsIndices(ramp, baseColor);

  // 2) map brandIndices -> final hex
  const brandHexes: Record<string, string> = {};
  for (const [tokenName, index] of Object.entries(brandIndices)) {
    brandHexes[tokenName] = getColorFromIndex(ramp, index);
  }

  // 3) combine with neutral tokens into one final "token dictionary"
  return {
    ...NEUTRAL_TOKENS,  // contentTertiary, backgroundSecondary, backgroundTertiary
    ...brandHexes,      // brandBackgroundPrimary, brandContentOnSecondary, etc.
  };
}