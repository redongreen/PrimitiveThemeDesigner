        import React from "react";
        import { ColorStop } from "@/lib/color";
        import { SPECIAL_BLACK_INDEX, SPECIAL_WHITE_INDEX } from "@/lib/semanticTokens";
        import { RestaurantFoodView } from "./RestaurantFoodView";
        import { PrimaryBackgroundScreen } from "./PrimaryBackgroundScreen";
        import { WhiteBackgroundScreen } from "./WhiteBackgroundScreen";

        /**
         * Props for the main PromotionalPreview component
         */
        export interface PromotionalPreviewProps {
          ramp: ColorStop[];
          semanticIndices: Record<string, number>;
        }

        /** 
         * Helper to fetch a specific token's hex color (or black/white fallback) 
         */
        function getTokenColor(
          ramp: ColorStop[],
          semanticIndices: Record<string, number>,
          tokenName: string
        ) {
          const idx = semanticIndices[tokenName] ?? -999;
          if (idx === SPECIAL_BLACK_INDEX) return "#000000";
          if (idx === SPECIAL_WHITE_INDEX) return "#FFFFFF";
          return ramp[idx]?.hex || "#000000"; // fallback if out of range
        }

        export const PromotionalPreview: React.FC<PromotionalPreviewProps> = ({
          ramp,
          semanticIndices,
        }) => {
          // Extract brand token hex values
          const brandBackgroundPrimary = getTokenColor(ramp, semanticIndices, "brandBackgroundPrimary");
          const brandBackgroundSecondary = getTokenColor(ramp, semanticIndices, "brandBackgroundSecondary");
          const brandContentPrimary = getTokenColor(ramp, semanticIndices, "brandContentPrimary");
          const brandContentOnPrimary = getTokenColor(ramp, semanticIndices, "brandContentOnPrimary");
          const brandContentOnSecondary = getTokenColor(ramp, semanticIndices, "brandContentOnSecondary");
          const brandBorderAccessible = getTokenColor(ramp, semanticIndices, "brandBorderAccessible");
          const brandBorderSubtle = getTokenColor(ramp, semanticIndices, "brandBorderSubtle");

          // Example neutral/fixed colors
          const neutralBackground = "#FFFFFF";
          const fgPrimary = "#000000"; 
          const fgSecondary = "#4B4B4B";

          return (
            // Use flex-wrap so screens align side-by-side when there's enough space
            <div className="flex flex-wrap justify-center gap-8">
              {/* Screen 1: RestaurantFoodView */}
              <RestaurantFoodView
                brandBackgroundPrimary={brandBackgroundPrimary}
                brandContentOnPrimary={brandContentOnPrimary}
              />

              {/* Screen 2: PrimaryBackgroundScreen */}
              <PrimaryBackgroundScreen
                brandBackgroundPrimary={brandBackgroundPrimary}
                brandContentOnPrimary={brandContentOnPrimary}
              />

              {/* Screen 3: WhiteBackgroundScreen */}
              <WhiteBackgroundScreen
                brandContentPrimary={brandContentPrimary}
                brandBackgroundSecondary={brandBackgroundSecondary}
                brandContentOnSecondary={brandContentOnSecondary}
                brandBorderAccessible={brandBorderAccessible}
                brandBorderSubtle={brandBorderSubtle}
                neutralBackground={neutralBackground}
                fgPrimary={fgPrimary}
                fgSecondary={fgSecondary}
              />
            </div>
          );
        };
