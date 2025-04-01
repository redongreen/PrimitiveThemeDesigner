import React from "react";
import { Copy } from "lucide-react";

/** 1) Category Pill */
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
        backgroundColor: active ? bgColor : "rgba(0,0,0,0.05)",
        color: active ? textColor : "#555",
      }}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

/** 2) NavButton for bottom nav bars */
export const NavButton = ({
  icon,
  badge,
  active = false,
  color
}: {
  icon: React.ReactNode;
  badge?: string;
  active?: boolean;
  color: string;
}) => {
  return (
    <div
      className="relative p-2 flex flex-col items-center"
      style={{ opacity: active ? 1 : 0.7 }}
    >
      <div style={{ color }}>{icon}</div>
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

/** 3) FoodItem for the "grid" in the primary background screen */
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
  imgEmoji
}) => {
  // Map some emojis to icons (if you want).
  function getIconForItem(type: string) {
    switch (type) {
      case "☕":
        return <span style={{ fontSize: "1.5rem" }}>☕</span>;
      case "🥗":
        return <span style={{ fontSize: "1.5rem" }}>🥗</span>;
      case "🍔":
        return <span style={{ fontSize: "1.5rem" }}>🍔</span>;
      case "🥯":
        return <span style={{ fontSize: "1.5rem" }}>🥯</span>;
      default:
        return <span style={{ fontSize: "1.5rem" }}>🍽️</span>;
    }
  }

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
