// File: src/components/FoodAppScreensPreview.tsx
import React from "react";
import {
  Search,
  ShoppingBag,
  Home,
  User,
  Utensils,
  ShoppingCart,
  Gift,
  Store,
  X,
  ArrowRight,
  Star,
  ThumbsUp,
} from "lucide-react";

import { CategoryPill, NavButton, FoodItem } from "./CategoryPillNavFood";
import type { ColorStop } from "@/lib/color";
import { SPECIAL_BLACK_INDEX, SPECIAL_WHITE_INDEX } from "@/lib/semanticTokens";

interface PromotionalPreviewProps {
  ramp: ColorStop[];
  semanticIndices: Record<string, number>;
}

/** Helper to retrieve hex from ramp or black/white constants. */
function getColorFromIndex(ramp: ColorStop[], idx: number): string {
  if (idx === SPECIAL_BLACK_INDEX) return "#000000";
  if (idx === SPECIAL_WHITE_INDEX) return "#FFFFFF";
  return ramp[idx]?.hex ?? "#000000";
}

export const FoodAppScreensPreview: React.FC<PromotionalPreviewProps> = ({
  ramp,
  semanticIndices,
}) => {
  // Helper function to get a brand color from the ramp
  const getColor = (tokenName: string) => {
    const idx = semanticIndices[tokenName] ?? -1;
    return getColorFromIndex(ramp, idx);
  };

  // We pick brand colors from the ramp (or special black/white).
  const brandBackgroundPrimary = getColor("brandBackgroundPrimary");
  const brandBackgroundSecondary = getColor("brandBackgroundSecondary");
  const brandBackgroundDisabled = getColor("brandBackgroundDisabled");
  const brandContentPrimary = getColor("brandContentPrimary");
  const brandContentOnPrimary = getColor("brandContentOnPrimary");
  const brandContentOnSecondary = getColor("brandContentOnSecondary");
  const brandContentDisabled = getColor("brandContentDisabled");
  const brandBorderAccessible = getColor("brandBorderAccessible");
  const brandBorderSubtle = getColor("brandBorderSubtle");

  // Some neutrals
  const neutralBackground = "#FFFFFF";
  const fgPrimary = "#000000";
  const fgSecondary = "#4B4B4B";

  // ...
  // The rest of your existing “three screens” code 
  // remains exactly the same, except that we now 
  // import CategoryPill, NavButton, and FoodItem 
  // from our new file.
  // ...

  return (
    <div className="flex flex-col gap-6">
      {/* SCREEN 1: Medieval Feast */}
      <div
        className="rounded-[24px] overflow-hidden shadow-lg"
        style={{
          width: "375px",
          height: "700px",
          border: "6px solid rgba(0,0,0,.3)",
        }}
      >
        {/* ... identical code ... */}
        {/* Uses <NavButton> or <CategoryPill> or <FoodItem> if needed */}
      </div>

      {/* SCREEN 2: Primary Background */}
      <div
        className="rounded-[24px] overflow-hidden shadow-lg"
        style={{
          width: "375px",
          height: "700px",
          border: "6px solid rgba(0,0,0,.3)",
        }}
      >
        {/* ... identical code ... */}
        {/* Example usage of CategoryPill */}
        {/* 
          <CategoryPill
            icon={<Utensils size={16} />}
            label="Food"
            bgColor={brandContentOnPrimary}
            textColor={brandBackgroundPrimary}
            active
          />
        */}
      </div>

      {/* SCREEN 3: White Background */}
      <div
        className="rounded-[24px] overflow-hidden shadow-lg"
        style={{
          width: "375px",
          height: "700px",
          border: "6px solid rgba(0,0,0,.3)",
        }}
      >
        {/* ... identical code ... */}
      </div>
    </div>
  );
};