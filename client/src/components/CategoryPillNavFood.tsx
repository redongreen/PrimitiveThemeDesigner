// File: src/components/CategoryPillNavFood.tsx

import React from "react";
import { Coffee, Utensils, Pizza, Cookie } from "lucide-react";

/** 
 * A pill-style category button (e.g., "Food", "Market") 
 * that can display an icon plus a label. 
 */
interface CategoryPillProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  bgColor: string;
  textColor: string;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  icon,
  label,
  active = false,
  bgColor,
  textColor,
}) => {
  return (
    <div
      className="flex items-center gap-1 px-3 py-1.5 rounded-full"
      style={{
        // If it's active, we use the passed-in bgColor, else maybe a fallback or partial transparency
        backgroundColor: active ? bgColor : `${bgColor}33`,
        color: textColor,
      }}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

/** 
 * A bottom-navigation button (e.g., Home, Search) 
 * potentially with a badge (like a cart count). 
 */
interface NavButtonProps {
  icon: React.ReactNode;
  badge?: string;
  active?: boolean;
  color: string;
}

export const NavButton: React.FC<NavButtonProps> = ({
  icon,
  badge,
  active = false,
  color,
}) => {
  return (
    <div className="relative p-2 flex flex-col items-center" style={{ opacity: active ? 1 : 0.7 }}>
      <div style={{ color }}>
        {icon}
      </div>
      {active && (
        <div
          className="h-1 w-5 rounded-full mt-1"
          style={{ backgroundColor: color }}
        />
      )}
      {badge && (
        <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
          <span className="text-[10px]">{badge}</span>
        </div>
      )}
    </div>
  );
};

/** 
 * A small card-like display for a "food item" (e.g., burger, coffee).
 * Renders an icon/emoji, title, subtitle, etc. 
 */
interface FoodItemProps {
  brandBackgroundPrimary: string;
  brandContentOnPrimary: string;
  title: string;
  subtitle: string;
  imgEmoji: string;
}

export const FoodItem: React.FC<FoodItemProps> = ({
  brandBackgroundPrimary,
  brandContentOnPrimary,
  title,
  subtitle,
  imgEmoji,
}) => {
  // Simple function that picks a Lucide icon based on an emoji
  const getIconForItem = (type: string) => {
    switch (type) {
      case "☕":
        return <Coffee size={32} />;
      case "🥗":
        return <Utensils size={32} />;
      case "🍔":
        return <Pizza size={32} />;
      case "🥯":
        return <Cookie size={32} />;
      default:
        return <Utensils size={32} />;
    }
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-3">
      <div 
        className="w-16 h-16 rounded-full bg-white bg-opacity-20 mb-3 flex items-center justify-center"
        style={{ color: brandContentOnPrimary }}
      >
        {getIconForItem(imgEmoji)}
      </div>
      <div className="font-semibold text-sm" style={{ color: brandContentOnPrimary }}>
        {title}
      </div>
      <div className="text-xs opacity-90" style={{ color: brandContentOnPrimary }}>
        {subtitle}
      </div>
    </div>
  );
};
