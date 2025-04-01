import { getContrastRatio, hexToOklch, type ColorStop } from "@/lib/color";

/**
 * Special negative indices for black or white if your ramp can't meet certain contrast.
 */
export const SPECIAL_BLACK_INDEX = -2;
export const SPECIAL_WHITE_INDEX = -3;

/** 
 * Check if an index refers to our special black/white constants.
 */
function isSpecialIndex(index: number) {
  return index === SPECIAL_BLACK_INDEX || index === SPECIAL_WHITE_INDEX;
}

/** 
 * Finds the ramp color closest in OKLCH space to `targetHex`. 
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
    if (hDiff > 180) hDiff = 360 - hDiff; // hue wrap-around
    hDiff /= 360;

    // Weighted difference
    const diff = (lDiff * 2) + (cDiff * 1.5) + (hDiff * 1);
    if (diff < minDiff) {
      minDiff = diff;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/** Simple wrapper around getContrastRatio. */
function getContrastOrFallback(foreHex: string, backHex: string) {
  return getContrastRatio(foreHex, backHex);
}

/** Finds the first (lightest) color in `ramp` with >= minContrast vs `against`. */
function findLightestWithContrast(ramp: ColorStop[], against: string, minContrast: number) {
  for (let i = 0; i < ramp.length; i++) {
    if (getContrastOrFallback(ramp[i].hex, against) >= minContrast) {
      return i;
    }
  }
  // If none meets, return the darkest
  return ramp.length - 1;
}

/** Finds the first (darkest -> lightest) color in `ramp` with >= minContrast vs `against`. */
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
 * If none is found, picks whichever is closest, or a known fallback index.
 */
function findDisabledContentColor(
  ramp: ColorStop[],
  bgHex: string,
  contentOnSecondaryIndex: number
) {
  if (!ramp.length) return 0;
  let bestIndex = contentOnSecondaryIndex;
  let bestDistance = Number.MAX_VALUE;

  for (let i = 0; i < ramp.length; i++) {
    const contrast = getContrastOrFallback(ramp[i].hex, bgHex);
    if (contrast >= 1.2 && contrast <= 2.2) {
      return i; // Found a color in the desired range
    }
    // measure how far outside [1.2..2.2] range we are
    const distance =
      contrast < 1.2
        ? 1.2 - contrast
        : contrast > 2.2
        ? contrast - 2.2
        : 0;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/**
 * Below are neutral tokens (system-level colors) you want to keep around. 
 * They are not picked from the ramp; they are fixed in your design system.
 */
export const NEUTRAL_TOKENS = {
  contentTertiary: "#5E5E5E",
  backgroundSecondary: "#F3F3F3",
  backgroundTertiary: "#E8E8E8", // used for brandBorderAccessible fallback
};

/**
 * We define brand tokens in a "config array," so each token name 
 * has a strategy to pick a suitable ramp color.
 */
type Strategy =
  | { kind: "closest-base-color" }
  | { kind: "lightest-with-contrast"; contrastAgainst: string; ratio: number }
  | {
      kind: "darkest-with-contrast";
      contrastAgainst?: string;
      contrastAgainstToken?: string;
      ratio: number;
    }
  | {
      kind: "disabled-content-color";
      backgroundIndexToken: string;
      contentOnSecondaryIndexToken: string;
    }
  | { kind: "shift-step"; relativeTo: string; offset: number }
  | { kind: "use-same-index"; referenceToken: string }
  | {
      kind: "border-accessible";
      referenceToken: string;
      ratio: number;
      contrastAgainst: string;
    }
  | {
      /**
       * brandContentOnPrimary tries for >=5:1 vs brandBackgroundPrimary, 
       * else black/white fallback if >=4.5:1, else fallback to background's index.
       */
      kind: "content-on-primary-6to1";
      backgroundToken: string;
    };

interface SemanticTokenSpec {
  name: string;
  strategy: Strategy;
}

/**
 * This array describes *brand tokens* and how each color is chosen from the ramp.
 */
const BRAND_TOKENS_CONFIG: SemanticTokenSpec[] = [
  {
    // brandBackgroundPrimary picks the color in the ramp closest to the user-provided "baseColor"
    name: "brandBackgroundPrimary",
    strategy: { kind: "closest-base-color" },
  },
  {
    // brandBackgroundSecondary uses "lightest-with-contrast" against NEUTRAL_TOKENS.contentTertiary (#5E5E5E) with ratio=4.5
    name: "brandBackgroundSecondary",
    strategy: {
      kind: "lightest-with-contrast",
      contrastAgainst: NEUTRAL_TOKENS.contentTertiary,
      ratio: 4.5,
    },
  },
  {
    name: "brandBackgroundDisabled",
    strategy: {
      kind: "shift-step",
      relativeTo: "brandBackgroundSecondary",
      offset: 1,
    },
  },
  {
    // brandContentPrimary tries "darkest-with-contrast" vs NEUTRAL_TOKENS.backgroundSecondary (#F3F3F3) with ratio=4.5
    name: "brandContentPrimary",
    strategy: {
      kind: "darkest-with-contrast",
      contrastAgainst: NEUTRAL_TOKENS.backgroundSecondary,
      ratio: 4.5,
    },
  },
  {
    name: "brandContentOnSecondary",
    strategy: {
      kind: "darkest-with-contrast",
      contrastAgainstToken: "brandBackgroundSecondary",
      ratio: 4.5,
    },
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
    // brandBorderAccessible tries to be the same as brandBackgroundPrimary if possible (≥3:1) 
    // else expands outward in the ramp, referencing NEUTRAL_TOKENS.backgroundTertiary (#E8E8E8).
    name: "brandBorderAccessible",
    strategy: {
      kind: "border-accessible",
      referenceToken: "brandBackgroundPrimary",
      ratio: 3,
      contrastAgainst: NEUTRAL_TOKENS.backgroundTertiary,
    },
  },
  {
    name: "brandBorderSubtle",
    strategy: {
      kind: "shift-step",
      relativeTo: "brandBackgroundSecondary",
      offset: -2,
    },
  },
  {
    // brandContentOnPrimary tries >=5:1 vs brandBackgroundPrimary, else fallback logic
    name: "brandContentOnPrimary",
    strategy: {
      kind: "content-on-primary-6to1",
      backgroundToken: "brandBackgroundPrimary",
    },
  },
];

/**
 * Picks a color index from the ramp for a single brand token strategy.
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

    case "border-accessible": {
      const referenceIndex = knownIndices[strategy.referenceToken] ?? 0;
      const candidateHex = ramp[referenceIndex]?.hex;
      const candidateContrast = getContrastOrFallback(candidateHex, strategy.contrastAgainst);

      if (candidateContrast >= strategy.ratio) {
        return referenceIndex;
      }

      // Expand outward from referenceIndex
      let left = referenceIndex - 1;
      let right = referenceIndex + 1;
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
      return referenceIndex;
    }

    case "content-on-primary-6to1": {
      const bgIndex = knownIndices[strategy.backgroundToken] ?? 0;
      const bgHex = ramp[bgIndex]?.hex || "#FFFFFF";

      // Step 1) search ramp for >=5:1
      const candidateIndices: number[] = [];
      function expandIndices() {
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
      }
      expandIndices();

      let foundIndex = -1;
      for (const idx of candidateIndices) {
        const fHex = ramp[idx].hex;
        const c = getContrastOrFallback(fHex, bgHex);
        if (c >= 5) {
          foundIndex = idx;
          break;
        }
      }
      if (foundIndex >= 0) {
        return foundIndex;
      }

      // Step 2) fallback to black/white if >=4.5
      const blackC = getContrastOrFallback("#000000", bgHex);
      const whiteC = getContrastOrFallback("#FFFFFF", bgHex);

      if (blackC >= 4.5 || whiteC >= 4.5) {
        if (blackC > whiteC && blackC >= 4.5) {
          return SPECIAL_BLACK_INDEX;
        }
        if (whiteC >= 4.5) {
          return SPECIAL_WHITE_INDEX;
        }
      }

      // Step 3) fallback to same background index
      return bgIndex;
    }

    default:
      return 0;
  }
}

/**
 * Computes an object like { brandBackgroundPrimary: 3, brandBackgroundSecondary: 8, ... }
 * where each value is a ramp index or special black/white index.
 */
export function computeSemanticsIndices(
  ramp: ColorStop[],
  baseColor: string
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const tokenSpec of BRAND_TOKENS_CONFIG) {
    const idx = pickIndexForStrategy(tokenSpec.strategy, ramp, result, baseColor);
    result[tokenSpec.name] = idx;
  }
  return result;
}

/**
 * For convenience, you can generate a final object that merges both:
 * - computed brand token hexes
 * - static neutral tokens
 *
 * Example usage:
 *   const designTokens = computeDesignTokens(ramp, baseColor);
 *   designTokens.brand.brandBackgroundPrimary // => "#???" from the ramp
 *   designTokens.neutral.backgroundSecondary  // => "#F3F3F3" (fixed)
 */
export function computeDesignTokens(ramp: ColorStop[], baseColor: string) {
  const brandIndices = computeSemanticsIndices(ramp, baseColor);
  const brandColors: Record<string, string> = {};

  // Convert each brand token index to an actual hex color
  for (const tokenName in brandIndices) {
    const idx = brandIndices[tokenName];
    if (idx === SPECIAL_BLACK_INDEX) {
      brandColors[tokenName] = "#000000";
    } else if (idx === SPECIAL_WHITE_INDEX) {
      brandColors[tokenName] = "#FFFFFF";
    } else {
      brandColors[tokenName] = ramp[idx]?.hex || "#000000";
    }
  }

  return {
    brand: brandColors,
    neutral: { ...NEUTRAL_TOKENS },
  };
}
