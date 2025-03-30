import React from "react";
import { 
  Search, 
  ShoppingBag, 
  Home, 
  User, 
  Coffee, 
  Utensils, 
  Pizza, 
  Cookie, 
  ShoppingCart, 
  Gift, 
  Store,
  LucideIcon,
  Star,
  Clock,
  ThumbsUp,
  Plus,
  Bookmark,
  ArrowRight,
  MapPin,
  X
} from "lucide-react";
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
  const brandBackgroundPrimary = getColor("brandBackgroundPrimary");
  const brandBackgroundSecondary = getColor("brandBackgroundSecondary");
  const brandContentPrimary = getColor("brandContentPrimary");
  const brandContentOnPrimary = getColor("brandContentOnPrimary");
  const brandContentOnSecondary = getColor("brandContentOnSecondary");
  const brandBorderAccessible = getColor("brandBorderAccessible");
  const neutralBackground = "#FFFFFF"; // Neutral surface
  const fgPrimary = "#000000"; // FG Primary
  const fgSecondary = "#4B4B4B"; // FG Secondary

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-wrap justify-center gap-8">
        {/* SCREEN 1: White Background with Brand Elements - Discover */}
        <div 
          className="rounded-[24px] overflow-hidden shadow-lg"
          style={{ 
            width: "375px", 
            height: "700px", 
            border: "6px solid rgba(0,0,0,.3)",
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
              <div className="font-semibold" style={{ color: fgPrimary }}>
                Discover
              </div>
              <User size={16} style={{ color: brandContentPrimary }} />
            </div>

            {/* Category Row */}
            <div className="px-4 mb-4">
              <div className="flex gap-2">
                <CategoryPill
                  icon={<Utensils size={16} />}
                  label="Food"
                  bgColor={neutralBackground}
                  textColor={brandContentPrimary}
                />
                <CategoryPill
                  icon={<ShoppingCart size={16} />}
                  label="Market"
                  bgColor={neutralBackground}
                  textColor={fgPrimary}
                />
                <CategoryPill
                  icon={<Gift size={16} />}
                  label="Deals"
                  bgColor={neutralBackground}
                  textColor={fgPrimary}
                />
                <CategoryPill
                  icon={<Store size={16} />}
                  label="Shop"
                  bgColor={neutralBackground}
                  textColor={fgPrimary}
                />
              </div>
            </div>

            {/* Top Picks Section */}
            <div className="px-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-sm" style={{ color: fgPrimary }}>
                  Featured Restaurants <span>→</span>
                </div>
              </div>

              {/* Restaurants Row - Fixed Width Items (No Scroll) */}
              <div className="grid grid-cols-3 gap-2">
                <RestaurantItem 
                  name="Asian Bistro"
                  time="25 min"
                  promo="Save $3"
                  brandBackgroundPrimary={brandBackgroundPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                />
                <RestaurantItem 
                  name="Grill House"
                  time="30 min"
                  brandBackgroundPrimary={brandBackgroundSecondary}
                  brandContentOnPrimary={brandContentOnSecondary}
                />
                <RestaurantItem 
                  name="Deli Corner"
                  time="25 min"
                  brandBackgroundPrimary={brandBackgroundSecondary}
                  brandContentOnPrimary={brandContentOnSecondary}
                />
              </div>
            </div>

            {/* BOGO Banner */}
            <div className="px-4 mb-4">
              <div 
                className="py-2 px-4 flex justify-between items-center rounded-xl"
                style={{ backgroundColor: brandBackgroundSecondary }}
              >
                <div>
                  <div className="font-semibold text-sm" style={{ color: brandContentOnSecondary }}>BOGO Week</div>
                  <div className="text-xs" style={{ color: brandContentOnSecondary }}>Save on your favorite items</div>
                </div>
                <div 
                  className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ 
                    backgroundColor: neutralBackground, 
                    color: brandContentPrimary 
                  }}
                >
                  View
                </div>
              </div>
            </div>

            {/* Featured Section */}
            <div className="px-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-sm" style={{ color: fgPrimary }}>
                  Local Favorites <span>→</span>
                </div>
              </div>

              {/* Restaurant Card */}
              <div 
                className="rounded-lg overflow-hidden mb-3"
                style={{ 
                  border: `1px solid ${brandBorderAccessible}`,
                }}
              >
                <div 
                  className="h-32 w-full bg-gray-200 relative"
                >
                  <div 
                    className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium"
                    style={{ 
                      backgroundColor: brandBackgroundPrimary,
                      color: brandContentOnPrimary
                    }}
                  >
                    Save $5
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold" style={{ color: brandContentPrimary }}>
                      Market Express
                    </div>
                    <div className="text-xs">
                      <span>★ 4.7</span> (350+) · 20 min
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="mt-auto p-4 border-t flex justify-between items-center">
              <NavButton icon={<Home size={20} />} active color={brandContentPrimary} />
              <NavButton icon={<Search size={20} />} color={brandContentPrimary} />
              <NavButton icon={<ShoppingBag size={20} />} badge="2" color={brandContentPrimary} />
              <NavButton icon={<User size={20} />} color={brandContentPrimary} />
            </div>
          </div>
        </div>
        
        {/* SCREEN 2: Primary Background - This Week */}
        <div 
          className="rounded-[24px] overflow-hidden shadow-lg"
          style={{ 
            width: "375px", 
            height: "700px", 
            border: "6px solid rgba(0,0,0,.3)",
          }}
        >
          <div
            className="w-full h-full flex flex-col"
            style={{ backgroundColor: brandBackgroundPrimary }}
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
            <div className="px-4 pt-2 pb-3">
              <div className="font-semibold text-sm mb-3" style={{ color: brandContentOnPrimary }}>
                This week
              </div>

              {/* Categories */}
              <div className="flex gap-2 mb-4">
                <CategoryPill
                  icon={<Utensils size={16} />}
                  label="Food"
                  active
                  bgColor={brandContentOnPrimary}
                  textColor={brandBackgroundPrimary}
                />
                <CategoryPill
                  icon={<ShoppingCart size={16} />}
                  label="Market"
                  active
                  bgColor={brandContentOnPrimary}
                  textColor={brandBackgroundPrimary}
                />
                <CategoryPill
                  icon={<Gift size={16} />}
                  label="Deals"
                  active
                  bgColor={brandContentOnPrimary}
                  textColor={brandBackgroundPrimary}
                />
                <CategoryPill
                  icon={<Store size={16} />}
                  label="Shop"
                  active
                  bgColor={brandContentOnPrimary}
                  textColor={brandBackgroundPrimary}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4">
              <div className="text-xl font-bold mb-2" style={{ color: brandContentOnPrimary }}>
                BOGO Week Special <span>→</span>
              </div>
              <div className="mb-5 text-sm" style={{ color: brandContentOnPrimary }}>
                Buy 1, get 1 free on featured items
              </div>

              {/* Food Grid */}
              <div className="grid grid-cols-2 gap-4">
                <FoodItem 
                  brandBackgroundPrimary={brandBackgroundPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Coffee Shop"
                  subtitle="Hot & Cold Drinks"
                  imgEmoji="☕"
                />
                <FoodItem 
                  brandBackgroundPrimary={brandBackgroundPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Fresh Greens"
                  subtitle="Salads & Bowls"
                  imgEmoji="🥗"
                />
                <FoodItem 
                  brandBackgroundPrimary={brandBackgroundPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Grill House"
                  subtitle="Burgers & Sandwiches"
                  imgEmoji="🍔"
                />
                <FoodItem 
                  brandBackgroundPrimary={brandBackgroundPrimary}
                  brandContentOnPrimary={brandContentOnPrimary}
                  title="Breakfast Bar"
                  subtitle="Morning Essentials"
                  imgEmoji="🥯"
                />
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="p-4 bg-black bg-opacity-5 flex justify-between items-center">
              <NavButton icon={<Home size={20} />} active color={brandContentOnPrimary} />
              <NavButton icon={<Search size={20} />} color={brandContentOnPrimary} />
              <NavButton icon={<ShoppingBag size={20} />} badge="2" color={brandContentOnPrimary} />
              <NavButton icon={<User size={20} />} color={brandContentOnPrimary} />
            </div>
          </div>
        </div>

        {/* SCREEN 3: Restaurant Food View with Brand Overlay - Medieval */}
        <div 
          className="rounded-[24px] overflow-hidden shadow-lg"
          style={{ 
            width: "375px", 
            height: "700px", 
            border: "6px solid rgba(0,0,0,.3)",
          }}
        >
          <div
            className="w-full h-full flex flex-col relative"
            style={{ backgroundColor: "transparent" }}
          >
            {/* Background Medieval Tavern Image that extends under everything */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: "url('/images/med1.png')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            ></div>
            
            {/* Brand color gradient layer */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backgroundImage: `linear-gradient(135deg, 
                  ${brandBackgroundPrimary}70 0%, 
                  ${brandBackgroundPrimary}50 35%, 
                  transparent 90%)`,
                mixBlendMode: "color"
              }}
            ></div>
            
            {/* Black gradient overlay that fades into the image */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backgroundImage: `linear-gradient(to top, 
                  rgba(0,0,0,0.9) 0%, 
                  rgba(0,0,0,0.7) 25%, 
                  rgba(0,0,0,0.5) 50%, 
                  rgba(0,0,0,0.3) 75%, 
                  rgba(0,0,0,0.1) 90%,
                  rgba(0,0,0,0) 100%)`,
                mixBlendMode: "normal"
              }}
            ></div>
            
            {/* Large text overlay with lightened text */}
            <div className="absolute top-1/4 left-0 right-0 text-center">
              <h1 
                className="text-4xl font-extrabold px-6 leading-tight tracking-tight"
                style={{ 
                  color: "#FFFFFF", // Pure white for better visibility
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)' // Stronger shadow for contrast
                }}
              >
                Medieval Feast Awaits
              </h1>
            </div>
            
            {/* Status Bar - Transparent overlay */}
            <div className="px-4 py-2 flex justify-between items-center z-10 relative">
              <span style={{ color: "#FFFFFF", fontWeight: "500" }}>9:41</span>
              <div className="flex gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#FFFFFF" }}>
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                </svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#FFFFFF" }}>
                  <path d="M2 8L12 16L22 8" />
                </svg>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative">
              {/* Dismiss X Button in Top Right */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-black bg-opacity-60 p-2 rounded-full">
                  <X size={20} className="text-white" />
                </div>
              </div>
              
              {/* Bottom Info Overlay - Black gradient only */}
              <div className="absolute bottom-0 left-0 right-0 pb-5" style={{
                background: `linear-gradient(to top, 
                  rgba(0,0,0,0.95) 0%, 
                  rgba(0,0,0,0.8) 50%, 
                  rgba(0,0,0,0.6) 75%, 
                  rgba(0,0,0,0) 100%)`
              }}>
                {/* Restaurant Info Bar */}
                <div className="px-4 pt-8 pb-3">
                  <div className="flex items-center">
                    <div 
                      className="font-bold text-xl mr-1"
                      style={{ 
                        color: "#FFFFFF", // Pure white for better visibility
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)' // Add shadow for contrast
                      }}
                    >
                      The Golden Dragon Tavern
                    </div>
                    <ArrowRight size={18} style={{ color: "#FFFFFF", opacity: 0.9 }} />
                  </div>
                  
                  <div className="flex items-center text-sm gap-1" style={{ color: "#FFFFFF" }}>
                    <Star size={14} fill="#FFFFFF" />
                    <span className="font-semibold">4.9</span>
                    <span style={{ opacity: 0.9 }}>(1,240+)</span>
                    <span className="mx-1">•</span>
                    <span>Medieval Cuisine</span>
                  </div>
                </div>
                
                {/* Menu Item Card */}
                <div className="px-4 py-2">
                  <div
                    className="w-full rounded-xl p-3 flex items-center"
                    style={{ 
                      backgroundColor: `${brandBackgroundPrimary}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <div 
                      className="w-16 h-16 rounded-lg bg-black bg-opacity-20 flex-shrink-0 flex items-center justify-center"
                      style={{ color: brandContentOnPrimary }}
                    >
                      <Utensils size={24} />
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="font-semibold text-sm" style={{ color: brandContentOnPrimary }}>Roast Pheasant</div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs opacity-90" style={{ color: brandContentOnPrimary }}>5 Gold</div>
                        <div className="flex items-center text-xs opacity-90" style={{ color: brandContentOnPrimary }}>
                          <ThumbsUp size={12} className="mr-1" />
                          <span>98% (237)</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="ml-2 px-3 py-1.5 rounded-lg bg-white bg-opacity-20 text-xs font-medium"
                      style={{
                        backgroundColor: brandContentOnPrimary,
                        color: brandBackgroundPrimary
                      }}
                    >
                      Order now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
//   ↓↓↓ HELPER COMPONENTS
// ────────────────────────────────────────────────────────────────────────────────

// 1) Updated CategoryPill to receive bgColor / textColor as props and use actual icon components:
interface CategoryPillProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  bgColor: string;
  textColor: string;
}

const CategoryPill: React.FC<CategoryPillProps> = ({
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
        // If it's active, we use the bgColor prop,
        // otherwise we use a transparent background with a border
        backgroundColor: active ? bgColor : "transparent", 
        color: textColor,
        border: active ? "none" : `1px solid ${textColor}30`,
      }}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

// 2) Food grid item for Screen 2:
interface FoodItemProps {
  brandBackgroundPrimary: string;
  brandContentOnPrimary: string;
  title: string;
  subtitle: string;
  imgEmoji: string;
}

const FoodItem: React.FC<FoodItemProps> = ({
  brandBackgroundPrimary,
  brandContentOnPrimary,
  title,
  subtitle,
  imgEmoji,
}) => {
  return (
    <div 
      className="rounded-lg p-3 flex flex-col gap-2"
      style={{
        backgroundColor: "rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-lg" style={{ color: brandContentOnPrimary }}>
          {imgEmoji}
        </div>
        <div 
          className="flex items-center justify-center w-5 h-5 rounded-full"
          style={{ 
            backgroundColor: brandContentOnPrimary,
            color: brandBackgroundPrimary,
          }}
        >
          <Plus size={12} />
        </div>
      </div>
      <div>
        <div className="font-medium text-sm" style={{ color: brandContentOnPrimary }}>
          {title}
        </div>
        <div className="text-xs opacity-90" style={{ color: brandContentOnPrimary }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
};

// 3) Restaurant Item for Horizontal Scrolling on Screen 3:
interface RestaurantItemProps {
  name: string;
  time: string;
  promo?: string;
  brandBackgroundPrimary: string;
  brandContentOnPrimary: string;
}

const RestaurantItem: React.FC<RestaurantItemProps> = ({
  name,
  time,
  promo,
  brandBackgroundPrimary,
  brandContentOnPrimary,
}) => {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #eee" }}>
      <div 
        className="h-16 relative bg-gray-100"
      >
        {promo && (
          <div 
            className="absolute top-1 left-1 text-xs px-2 py-0.5 rounded"
            style={{ 
              backgroundColor: brandBackgroundPrimary,
              color: brandContentOnPrimary
            }}
          >
            {promo}
          </div>
        )}
      </div>
      <div className="p-2 text-center">
        <div className="font-medium text-xs">{name}</div>
        <div className="text-[10px] opacity-70">{time}</div>
      </div>
    </div>
  );
};

// 4) Navigation buttons for footer:
interface NavButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  badge?: string;
  color: string;
}

const NavButton: React.FC<NavButtonProps> = ({
  icon,
  active = false,
  badge,
  color
}) => {
  return (
    <div className="relative p-2">
      <div className="flex items-center justify-center" style={{ 
        color,
        opacity: active ? 1 : 0.8
      }}>
        {icon}
      </div>
      
      {badge && (
        <div 
          className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-medium"
          style={{ 
            backgroundColor: color,
            color: '#222',
          }}
        >
          {badge}
        </div>
      )}
      
      {active && (
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full" 
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
};