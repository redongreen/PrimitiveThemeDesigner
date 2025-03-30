import React from "react";
import { Search, ShoppingBag, Home, User } from "lucide-react";
import { type ColorStop } from "@/lib/color";
import { SPECIAL_BLACK_INDEX, SPECIAL_WHITE_INDEX } from "@/lib/semanticTokens";

interface PromotionalPreviewProps {
  ramp: ColorStop[];
  semanticIndices: Record<string, number>;
}

/**
 * Get the color from the ramp based on the semantic token index
 */
function getColorFromIndex(ramp: ColorStop[], idx: number): string {
  if (idx === SPECIAL_BLACK_INDEX) {
    return "#000000";
  } else if (idx === SPECIAL_WHITE_INDEX) {
    return "#FFFFFF";
  } else if (idx >= 0 && idx < ramp.length) {
    return ramp[idx].hex;
  }
  return "#000000"; // fallback
}

export const PromotionalPreview: React.FC<PromotionalPreviewProps> = ({
  ramp,
  semanticIndices,
}) => {
  // Consistent function to get colors from tokens
  const getColor = (tokenName: string) => {
    const idx = semanticIndices[tokenName] ?? -1;
    return getColorFromIndex(ramp, idx);
  };

  // Main colors for our design
  const brandPrimary = getColor("brandBackgroundPrimary");
  const brandSecondary = getColor("brandBackgroundSecondary");
  const brandContentPrimary = getColor("brandContentPrimary");
  const brandContentOnPrimary = getColor("brandContentOnPrimary");
  const brandContentOnSecondary = getColor("brandContentOnSecondary");
  const brandBorderAccessible = getColor("brandBorderAccessible");
  const neutralBackground = "#FFFFFF"; // Neutral surface

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold mb-2">Full-Screen Promotional Preview</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Showcasing semantic color tokens in food delivery app promotional screens
      </p>

      <div className="flex flex-wrap justify-center gap-8">
        {/* SCREEN 1: Yellow Primary Background */}
        <div 
          className="rounded-[36px] overflow-hidden shadow-lg"
          style={{ 
            width: "300px", 
            height: "600px", 
            border: "12px solid #111",
          }}
        >
          <div
            className="w-full h-full flex flex-col"
            style={{ backgroundColor: brandPrimary }}
          >
            {/* Status Bar */}
            <div className="px-4 py-2 flex justify-between items-center">
              <span style={{ color: brandContentOnPrimary, fontWeight: "500" }}>9:41</span>
              <div className="flex gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: brandContentOnPrimary }}>
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                </svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: brandContentOnPrimary }}>
                  <path d="M2 8L12 16L22 8" />
                </svg>
              </div>
            </div>
            
            {/* Header */}
            <div className="px-4 pt-2 pb-4">
              <div className="font-bold text-sm mb-4" style={{ color: brandContentOnPrimary }}>
                Uber Eats BOGO Week <span>→</span>
              </div>
              
              {/* Categories */}
              <div className="flex gap-3 mb-6">
                <CategoryPill icon="🍽️" label="Eats" color={brandContentOnPrimary} />
                <CategoryPill icon="🛒" label="Grocery" color={brandContentOnPrimary} />
                <CategoryPill icon="🎁" label="Offers" active color={brandContentOnPrimary} />
                <CategoryPill icon="🛍️" label="Shop" color={brandContentOnPrimary} />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4">
              <div className="text-xl font-bold mb-2" style={{ color: brandContentOnPrimary }}>
                Uber Eats BOGO Week <span>→</span>
              </div>
              <div className="mb-6" style={{ color: brandContentOnPrimary }}>
                Buy 1, get 1 free on your favorite dishes
              </div>

              {/* Food Grid */}
              <div className="grid grid-cols-2 gap-4">
                <FoodItem 
                  brandPrimary={brandPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Dunkin'"
                  subtitle="Iced coffee"
                  imgEmoji="☕"
                />
                <FoodItem 
                  brandPrimary={brandPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Sweetgreen"
                  subtitle="Salads"
                  imgEmoji="🥗"
                />
                <FoodItem 
                  brandPrimary={brandPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="The Bird"
                  subtitle="Fried Chicken Sandwich"
                  imgEmoji="🍔"
                />
                <FoodItem 
                  brandPrimary={brandPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Wise Sons"
                  subtitle="Bagel"
                  imgEmoji="🥯"
                />
              </div>
            </div>
            
            {/* Bottom Navigation */}
            <div className="p-4 bg-black bg-opacity-5 flex justify-between items-center">
              <NavButton icon={<Home size={20} />} active />
              <NavButton icon={<Search size={20} />} />
              <NavButton icon={<ShoppingBag size={20} />} badge="2" />
            </div>
          </div>
        </div>
        
        {/* SCREEN 2: White Background with Brand Elements */}
        <div 
          className="rounded-[36px] overflow-hidden shadow-lg"
          style={{ 
            width: "300px", 
            height: "600px", 
            border: "12px solid #111",
          }}
        >
          <div
            className="w-full h-full flex flex-col"
            style={{ backgroundColor: neutralBackground }}
          >
            {/* Status Bar */}
            <div className="px-4 py-2 flex justify-between items-center">
              <span style={{ color: brandContentPrimary, fontWeight: "500" }}>9:41</span>
              <div className="flex gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: brandContentPrimary }}>
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                </svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: brandContentPrimary }}>
                  <path d="M2 8L12 16L22 8" />
                </svg>
              </div>
            </div>
            
            {/* Header */}
            <div className="p-4 mb-2 flex justify-between items-center">
              <div className="font-bold" style={{ color: brandContentPrimary }}>
                Explore
              </div>
              <User size={18} style={{ color: brandContentPrimary }} />
            </div>
            
            {/* Category Row */}
            <div className="px-4 mb-4">
              <div className="flex gap-3">
                <CategoryPill icon="🍽️" label="Eats" color={brandContentPrimary} />
                <CategoryPill icon="🛒" label="Grocery" color={brandContentPrimary} />
                <CategoryPill icon="🎁" label="Offers" color={brandContentPrimary} />
                <CategoryPill icon="🛍️" label="Shop" color={brandContentPrimary} />
              </div>
            </div>

            {/* Top Picks Section */}
            <div className="px-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium" style={{ color: brandContentPrimary }}>
                  Top picks for Lauren <span>→</span>
                </div>
              </div>
              
              {/* Restaurants Row */}
              <div className="flex gap-3 overflow-x-auto">
                <RestaurantItem 
                  name="Farmhouse Thai"
                  time="25 min"
                  promo="Save $3"
                  brandPrimary={brandPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                />
                <RestaurantItem 
                  name="The Bird"
                  time="30 min"
                  brandPrimary={brandSecondary}
                  brandContentOnPrimary={brandContentOnSecondary}
                />
                <RestaurantItem 
                  name="Wise Sons"
                  time="25 min"
                  brandPrimary={brandSecondary}
                  brandContentOnPrimary={brandContentOnSecondary}
                />
              </div>
            </div>
            
            {/* BOGO Banner */}
            <div className="px-4 mb-4">
              <div 
                className="py-2 px-4 flex justify-between items-center rounded-xl"
                style={{ backgroundColor: brandPrimary }}
              >
                <div>
                  <div className="font-bold" style={{ color: brandContentOnPrimary }}>BOGO Week</div>
                  <div className="text-xs" style={{ color: brandContentOnPrimary }}>Save on your favorite dishes</div>
                </div>
                <div 
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: neutralBackground, 
                    color: brandContentPrimary 
                  }}
                >
                  Shop now
                </div>
              </div>
            </div>
            
            {/* Neighborhood Favorites */}
            <div className="px-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium" style={{ color: brandContentPrimary }}>
                  Neighborhood favorites <span>→</span>
                </div>
              </div>
              
              {/* Restaurant Card */}
              <div 
                className="rounded-xl overflow-hidden mb-3"
                style={{ 
                  border: `1px solid ${brandBorderAccessible}`,
                }}
              >
                <div 
                  className="h-32 w-full bg-gray-200 relative"
                >
                  <div 
                    className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: brandPrimary,
                      color: brandContentOnPrimary
                    }}
                  >
                    Save $5
                  </div>
                </div>
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium" style={{ color: brandContentPrimary }}>
                      G Bodega
                    </div>
                    <div className="text-xs">
                      <span>★ 4.7</span> (2,350+) · 20 min
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Navigation */}
            <div className="mt-auto p-4 border-t flex justify-between items-center">
              <NavButton icon={<Home size={20} />} active />
              <NavButton icon={<Search size={20} />} />
              <NavButton icon={<ShoppingBag size={20} />} badge="2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
const CategoryPill = ({ 
  icon, 
  label, 
  active = false,
  color
}: { 
  icon: string; 
  label: string; 
  active?: boolean;
  color: string;
}) => {
  return (
    <div 
      className="flex items-center gap-1 px-3 py-1.5 rounded-full"
      style={{ 
        backgroundColor: active ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)",
        color: color
      }}
    >
      <span>{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

const NavButton = ({ 
  icon, 
  badge 
}: { 
  icon: React.ReactNode; 
  badge?: string;
  active?: boolean;
}) => {
  return (
    <div className="relative p-2">
      {icon}
      {badge && (
        <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
          <span className="text-[10px]">{badge}</span>
        </div>
      )}
    </div>
  );
};

const FoodItem = ({ 
  brandPrimary,
  brandContentOnPrimary,
  title,
  subtitle,
  imgEmoji
}: { 
  brandPrimary: string;
  brandContentOnPrimary: string;
  title: string;
  subtitle: string;
  imgEmoji: string;
}) => {
  return (
    <div className="bg-white bg-opacity-10 rounded-xl p-3">
      <div 
        className="w-16 h-16 rounded-full bg-white bg-opacity-20 mb-3 flex items-center justify-center text-2xl"
      >
        {imgEmoji}
      </div>
      <div className="font-medium" style={{ color: brandContentOnPrimary }}>{title}</div>
      <div className="text-xs opacity-90" style={{ color: brandContentOnPrimary }}>{subtitle}</div>
    </div>
  );
};

const RestaurantItem = ({ 
  name,
  time,
  promo,
  brandPrimary,
  brandContentOnPrimary
}: { 
  name: string;
  time: string;
  promo?: string;
  brandPrimary: string;
  brandContentOnPrimary: string;
}) => {
  return (
    <div className="w-24 flex-shrink-0">
      <div className="h-20 bg-gray-200 rounded-xl mb-1 relative">
        {promo && (
          <div 
            className="absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded font-medium"
            style={{ 
              backgroundColor: brandPrimary,
              color: brandContentOnPrimary
            }}
          >
            {promo}
          </div>
        )}
      </div>
      <div className="text-xs font-medium">{name}</div>
      <div className="text-xs text-gray-500">{time}</div>
    </div>
  );
};