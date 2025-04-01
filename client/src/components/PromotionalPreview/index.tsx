import React from "react";
import { ColorStop } from "@/lib/color";
import { SPECIAL_BLACK_INDEX, SPECIAL_WHITE_INDEX, NEUTRAL_TOKENS } from "@/lib/semanticTokens";
import { RestaurantFoodView } from "./RestaurantFoodView";
import { PrimaryBackgroundScreen } from "./PrimaryBackgroundScreen";
import { WhiteBackgroundScreen } from "./WhiteBackgroundScreen";

export interface PromotionalPreviewProps {
  ramp: ColorStop[];
  semanticIndices: Record<string, number>;
}

/** Helper to fetch token color or fallback to #000 */
function getTokenColor(
  ramp: ColorStop[],
  semanticIndices: Record<string, number>,
  tokenName: string
) {
  const idx = semanticIndices[tokenName] ?? -999;
  if (idx === SPECIAL_BLACK_INDEX) return "#000000";
  if (idx === SPECIAL_WHITE_INDEX) return "#FFFFFF";
  return ramp[idx]?.hex || "#000000";
}

export const PromotionalPreview: React.FC<PromotionalPreviewProps> = ({
  ramp,
  semanticIndices,
}) => {
  // brand tokens
  const brandBackgroundPrimary = getTokenColor(ramp, semanticIndices, "brandBackgroundPrimary");
  const brandBackgroundSecondary = getTokenColor(ramp, semanticIndices, "brandBackgroundSecondary");
  const brandContentPrimary = getTokenColor(ramp, semanticIndices, "brandContentPrimary");
  const brandContentOnPrimary = getTokenColor(ramp, semanticIndices, "brandContentOnPrimary");
  const brandContentOnSecondary = getTokenColor(ramp, semanticIndices, "brandContentOnSecondary");
  const brandBorderAccessible = getTokenColor(ramp, semanticIndices, "brandBorderAccessible");
  const brandBorderSubtle = getTokenColor(ramp, semanticIndices, "brandBorderSubtle");

  // neutral tokens
  const backgroundPrimary = NEUTRAL_TOKENS.backgroundPrimary;
  const contentPrimary = NEUTRAL_TOKENS.contentPrimary;
  const contentSecondary = NEUTRAL_TOKENS.contentSecondary;

  return (
    <div className="flex flex-wrap justify-center gap-8">
      {/* Screen 1 */}
      <RestaurantFoodView
        brandBackgroundPrimary={brandBackgroundPrimary}
        brandContentOnPrimary={brandContentOnPrimary}
        brandBackgroundSecondary={brandBackgroundSecondary}
      />

      {/* Screen 2: Pass brandBorderSubtle to PrimaryBackgroundScreen */}
      <PrimaryBackgroundScreen
        brandBackgroundPrimary={brandBackgroundPrimary}
        brandContentOnPrimary={brandContentOnPrimary}
        brandBorderSubtle={brandBorderSubtle} // NEW
      />

      {/* Screen 3 */}
      <WhiteBackgroundScreen
        brandContentPrimary={brandContentPrimary}
        brandBackgroundSecondary={brandBackgroundSecondary}
        brandContentOnSecondary={brandContentOnSecondary}
        brandBorderAccessible={brandBorderAccessible}
        brandBorderSubtle={brandBorderSubtle}
        backgroundPrimary={backgroundPrimary}
        contentPrimary={contentPrimary}
        contentSecondary={contentSecondary}
      />
    </div>
  );
};
